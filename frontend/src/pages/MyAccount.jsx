import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../components/api'
import useAuth from '../store/useAuth'

function formatMoney(cents) {
  return '$' + (cents / 100).toFixed(2)
}
function formatDate(iso) {
  try { return new Date(iso).toLocaleString() } catch { return iso }
}

export default function MyAccount() {
  const { user, loading: authLoading, init } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { init() }, [])

  useEffect(() => {
    if (!user) { setLoading(false); return }
    setLoading(true); setError('')
    api.get('/orders/mine')
      .then(({ data }) => setOrders(data.orders || []))
      .catch((e) => setError(e?.response?.data?.error || 'Failed to load orders'))
      .finally(() => setLoading(false))
  }, [user])

  if (authLoading) {
    return <div className="py-10 text-center text-gray-600">Loading account…</div>
  }

  if (!user) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold mb-2">Please sign in</h2>
        <p className="text-gray-600 mb-6">You need an account to view your orders.</p>
        <Link to="/login" className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-xl shadow hover:bg-indigo-700">
          Login
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Account</h1>

      <section className="mb-8 bg-white rounded-2xl shadow p-4">
        <h2 className="text-xl font-semibold">Profile</h2>
        <div className="mt-2 text-gray-700">
          <div><span className="font-medium">Name:</span> {user.name}</div>
          <div><span className="font-medium">Email:</span> {user.email}</div>
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Orders</h2>
          <Link to="/catalog" className="text-indigo-600 hover:underline">Continue shopping</Link>
        </div>

        {loading && <div className="py-10 text-center text-gray-600">Loading orders…</div>}
        {error && <div className="py-4 text-red-600">{error}</div>}

        {!loading && !error && orders.length === 0 && (
          <div className="py-10 text-center text-gray-600">You haven’t placed any orders yet.</div>
        )}

        <div className="mt-4 space-y-4">
          {orders.map(order => (
            <div key={order.id} className="border rounded-xl p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="font-semibold">Order #{order.id}</div>
                <div className="text-sm text-gray-600">{formatDate(order.createdAt)}</div>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
                <span className="px-2 py-1 rounded-full bg-gray-100">{order.status}</span>
                <span className="font-medium">Total: {formatMoney(order.totalCents)}</span>
              </div>

              <div className="mt-4 divide-y">
                {order.items?.map(it => (
                  <div key={it.id} className="py-3 flex items-center gap-3">
                    {it.product?.imageUrl && (
                      <img
                        src={it.product.imageUrl}
                        alt={it.product.title}
                        className="w-16 h-16 object-cover rounded-lg"
                        loading="lazy"
                      />
                    )}
                    <div className="flex-1">
                      <div className="font-medium">{it.product?.title ?? 'Product'}</div>
                      <div className="text-sm text-gray-600">Qty {it.quantity}</div>
                    </div>
                    <div className="text-sm font-medium">
                      {formatMoney(it.unitCents * it.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Optional: show addresses if captured */}
              {(order.shippingName || order.shippingAddr1) && (
                <div className="mt-3 grid sm:grid-cols-2 gap-3 text-sm text-gray-700">
                  <div>
                    <div className="font-medium mb-1">Shipping</div>
                    <div>{order.shippingName}</div>
                    <div>{order.shippingAddr1}</div>
                    {order.shippingAddr2 && <div>{order.shippingAddr2}</div>}
                    <div>{[order.shippingCity, order.shippingState, order.shippingPostal].filter(Boolean).join(', ')}</div>
                    <div>{order.shippingCountry}</div>
                  </div>
                  {(order.billingName || order.billingAddr1) && (
                    <div>
                      <div className="font-medium mb-1">Billing</div>
                      <div>{order.billingName}</div>
                      <div>{order.billingAddr1}</div>
                      {order.billingAddr2 && <div>{order.billingAddr2}</div>}
                      <div>{[order.billingCity, order.billingState, order.billingPostal].filter(Boolean).join(', ')}</div>
                      <div>{order.billingCountry}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
