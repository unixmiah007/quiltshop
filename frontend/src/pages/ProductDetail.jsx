import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { api } from '../components/api'
import useCart from '../store/useCart'
import useAuth from '../store/useAuth'

export default function ProductDetail() {
  const { id } = useParams()
  const nav = useNavigate()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [added, setAdded] = useState(false)

  const { add } = useCart()
  const { init } = useAuth()

  // Ensure auth state is initialized (so checkout knows who you are)
  useEffect(() => { init() }, [])

  // Fetch the product by id
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    setNotFound(false)
    setProduct(null)

    api.get(`/products/${id}`)
      .then(({ data }) => {
        if (cancelled) return
        if (!data?.product) {
          setNotFound(true)
          return
        }
        setProduct(data.product)
      })
      .catch((e) => {
        if (cancelled) return
        if (e?.response?.status === 404) setNotFound(true)
        else setError(e?.response?.data?.error || 'Failed to load product')
      })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [id])

  function handleAdd() {
    if (!product) return
    add({
      id: product.id,
      title: product.title,
      priceCents: product.priceCents,
      imageUrl: product.imageUrl,
      quantity: 1,
    })
    setAdded(true)
    // Optional: jump to cart shortly after adding
    // setTimeout(() => nav('/cart'), 500)
    setTimeout(() => setAdded(false), 1200)
  }

  if (loading) {
    return <div className="text-center py-10 text-gray-600">Loading product…</div>
  }

  if (notFound) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold mb-2">Product not found</h2>
        <p className="text-gray-600 mb-6">The quilt you’re looking for doesn’t exist or was removed.</p>
        <Link
          to="/catalog"
          className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-xl shadow hover:bg-indigo-700"
        >
          Back to Catalog
        </Link>
      </div>
    )
  }

  if (error) {
    return <div className="text-center py-10 text-red-600">{error}</div>
  }

  if (!product) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full rounded-2xl shadow object-cover"
          />
        ) : (
          <div className="w-full h-80 bg-gray-100 rounded-2xl shadow flex items-center justify-center text-gray-400">
            No image
          </div>
        )}
      </div>

      <div>
        <h2 className="text-3xl font-bold mb-2">{product.title}</h2>
        <p className="text-gray-600 mb-4">{product.description}</p>
        <p className="text-2xl font-semibold mb-6">${(product.priceCents / 100).toFixed(2)}</p>

        <div className="flex items-center gap-3">
          <button
            onClick={handleAdd}
            disabled={added}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl shadow hover:bg-indigo-700 disabled:opacity-60"
          >
            {added ? 'Added!' : 'Add to Cart'}
          </button>

          <button
            onClick={() => nav('/cart')}
            className="bg-white border px-5 py-3 rounded-xl shadow-sm hover:bg-gray-50"
          >
            View Cart
          </button>
        </div>

        <div className="mt-6">
          <Link to="/catalog" className="text-indigo-600 hover:underline">
            ← Back to Catalog
          </Link>
        </div>
      </div>
    </div>
  )
}
