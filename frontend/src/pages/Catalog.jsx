import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { api } from '../components/api'

export default function Catalog() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fallbackUrls = useMemo(() => {
    const urls = []
    const envBase = import.meta.env.VITE_API_BASE
    if (envBase) urls.push(`${envBase.replace(/\/$/, '')}/products`)
    // Dev fallback (bypasses misconfigured VITE_API_BASE)
    urls.push('http://localhost:4000/api/products')
    return Array.from(new Set(urls))
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError('')
    setProducts([])

    ;(async () => {
      let lastErr

      // 1) Try axios instance (respects withCredentials + interceptors)
      try {
        const { data } = await api.get('/products', { signal: controller.signal })
        if (!data?.products) throw new Error('Malformed response: missing "products"')
        setProducts(data.products)
        setLoading(false)
        return
      } catch (e) {
        if (axios.isCancel?.(e)) return
        lastErr = e
        console.warn('[Catalog] api.get(/products) failed → trying fallbacks', e)
      }

      // 2) Try absolute fallbacks
      for (const url of fallbackUrls) {
        try {
          console.debug('[Catalog] fetching', url)
          const { data } = await axios.get(url, {
            withCredentials: true,
            signal: controller.signal,
          })
          if (!data?.products) throw new Error('Malformed response: missing "products"')
          setProducts(data.products)
          setLoading(false)
          return
        } catch (e) {
          if (axios.isCancel?.(e)) return
          lastErr = e
          console.error('[Catalog] fallback failed for', url, e)
        }
      }

      // 3) If all attempts failed, show a helpful message
      const msg =
        lastErr?.response?.data?.error ||
        (lastErr?.response
          ? `HTTP ${lastErr.response.status}`
          : lastErr?.code === 'ERR_NETWORK'
            ? 'Network/CORS error'
            : lastErr?.message || 'Failed to load products')
      setError(msg)
      setLoading(false)
    })()

    return () => controller.abort()
  }, [fallbackUrls])

  if (loading) {
    return <div className="py-10 text-center text-gray-600">Loading quilts…</div>
  }

  if (error) {
    return (
      <div className="py-10 text-center">
        <div className="text-red-600 mb-2">{error}</div>
        <div className="text-xs text-gray-500">
          Check <code>VITE_API_BASE</code> (frontend/.env) and backend CORS/port. See console for details.
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Quilts</h2>
      {products.length === 0 && (
        <div className="text-center text-gray-600">No products yet.</div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p) => (
          <Link
            key={p.id}
            to={`/product/${p.id}`}
            className="bg-white rounded-2xl shadow p-3 hover:shadow-md transition"
          >
            {p.imageUrl && (
              <img
                src={p.imageUrl}
                alt={p.title}
                width={333}
                height={192}
                className="w-full h-48 object-cover rounded-xl mb-3"
                loading="lazy"
              />
            )}
            <h3 className="font-semibold">{p.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">{p.description}</p>
            <p className="mt-2 font-bold">${(p.priceCents / 100).toFixed(2)}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
