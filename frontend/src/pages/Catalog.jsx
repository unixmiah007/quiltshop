import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { api } from '../components/api'

function resolveUrl(url) {
  if (!url) return ''
  try {
    if (/^https?:\/\//i.test(url)) return url
    if (/^\/\//.test(url)) return window.location.protocol + url
    if (url.startsWith('/')) return window.location.origin + url
    return window.location.origin + '/' + url.replace(/^\.?\//, '')
  } catch { return url }
}

export default function Catalog() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // search state
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)

  const fallbackUrls = useMemo(() => {
    const urls = []
    const envBase = import.meta.env.VITE_API_BASE
    if (envBase) urls.push(`${envBase.replace(/\/$/, '')}/products`)
    urls.push('http://localhost:4000/api/products')
    return Array.from(new Set(urls))
  }, [])

  // initial load (full list)
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true); setError(''); setProducts([])

    ;(async () => {
      let lastErr
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

      for (const url of fallbackUrls) {
        try {
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

  // derived client-side filtered list (instant)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return products
    return products.filter(p => {
      const t = (p.title || '').toLowerCase()
      const d = (p.description || '').toLowerCase()
      return t.includes(q) || d.includes(q)
    })
  }, [products, query])

  // (Optional) server-side search when query ≥ 2 chars; fall back to client filter if server fails
  useEffect(() => {
    const controller = new AbortController()
    const q = query.trim()
    if (q.length < 2) { setSearching(false); return }

    let cancelled = false
    setSearching(true)

    ;(async () => {
      // Try /products?q=... on same baseURL
      try {
        const { data } = await api.get('/products', { params: { q }, signal: controller.signal })
        if (cancelled) return
        if (Array.isArray(data?.products) && data.products.length) {
          // merge client images with server list if needed or just replace
          setProducts(data.products)
        }
      } catch {
        // silently ignore; client-side filtering still applies via `filtered`
      } finally {
        if (!cancelled) setSearching(false)
      }
    })()

    return () => { cancelled = true; controller.abort() }
  }, [query])

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
      <div className="flex items-end justify-between gap-3 mb-4">
        <h2 className="text-2xl font-semibold">Quilts</h2>
        <div className="relative w-full max-w-sm">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search quilts…"
            className="w-full border rounded-xl pl-10 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
          <span className="absolute left-3 top-2.5 text-gray-500">🔎</span>
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className="mb-3 text-sm text-gray-600">
        {searching ? 'Searching…' : `Showing ${filtered.length} of ${products.length} products`}
      </div>

      {filtered.length === 0 && (
        <div className="text-center text-gray-600">No products match “{query}”.</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((p) => (
          <Link
            key={p.id}
            to={`/product/${p.id}`}
            className="bg-white rounded-2xl shadow p-3 hover:shadow-md transition"
          >
            {p.imageUrl && (
              <img
                src={resolveUrl(p.imageUrl)}
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
