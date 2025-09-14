import { useEffect, useMemo, useState } from 'react'
import { api } from '../components/api'
import useAuth from '../store/useAuth'
import { Link } from 'react-router-dom'

const STATUS = ['ALL','PENDING','PAID','SHIPPED','DONE','CANCELED']

function money(cents){ return '$' + (cents/100).toFixed(2) }
function dt(s){ try { return new Date(s).toLocaleString() } catch { return s } }

export default function AdminOrders() {
  const { user, init } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('ALL')
  const [q, setQ] = useState('')
  const [savingId, setSavingId] = useState(null)
  const [toast, setToast] = useState('')

  useEffect(()=>{ init() },[])
  useEffect(() => { fetchOrders() }, [status])

  async function fetchOrders() {
    setLoading(true); setError('')
    try {
      const { data } = await api.get('/admin/orders', { params: { status, q } })
      setOrders(data.orders || [])
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to load orders')
    } finally { setLoading(false) }
  }

  async function setStatusFor(orderId, newStatus) {
    setSavingId(orderId)
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus })
      setToast(`Order #${orderId} → ${newStatus}`)
      setTimeout(()=> setToast(''), 1500)
      fetchOrders()
    } catch (e) {
      alert(e?.response?.data?.error || 'Failed to update status')
    } finally { setSavingId(null) }
  }

  const filtered = useMemo(() => orders, [orders])

  if (!user) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold mb-2">Admins only</h2>
        <p className="text-gray-600 mb-6">Please log in as an admin to manage orders.</p>
        <Link to="/login" className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-xl shadow">Login</Link>
      </div>
    )
  }
  if (user.role !== 'ADMIN') {
    return <div className="py-10 text-center text-red-600">You do not have permission to view this page.</div>
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <h1 className="text-2xl font-semibold">Manage Orders</h1>
        <div className="flex flex-wrap items-center gap-2">
          <select value={status} onChange={e=> setStatus(e.target.value)} className="border rounded-lg p-2">
            {STATUS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input
            value={q} onChange={e=> setQ(e.target.value)} placeholder="Search email, name, product"
            className="border rounded-lg p-2 w-56"
          />
          <button onClick={fetchOrders} className="bg-white border px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50">Search</button>
        </div>
      </div>

      {loading && <div className="py-10 text-center text-gray-600">Loading orders…</div>}
      {error && <div className="py-3 text-red-600">{error}</div>}

      {!loading && !error && filtered.length === 0 && (
        <div className="py-10 text-center text-gray-600">No orders.</div>
      )}

      <div className="space-y-3">
        {filtered.map(o => (
          <div key={o.id} className="bg-white rounded-xl shadow p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">#{o.id}</div>
                <div className="font-medium">{o.user?.name || 'Customer'}</div>
                <div className="text-sm text-gray-600">{o.user?.email}</div>
              </div>
              <div className="text-sm text-gray-600">{dt(o.createdAt)}</div>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-3">
              <span className="px-2 py-1 rounded-full bg-gray-100">{o.status}</span>
              <span className="font-semibold">{money(o.totalCents)}</span>

              <select
                disabled={savingId===o.id}
                value={o.status}
                onChange={e => setStatusFor(o.id, e.target.value)}
                className="border rounded-lg p-2"
              >
                <option>PENDING</option>
                <option>PAID</option>
                <option>SHIPPED</option>
                <option>DONE</option>
                <option>CANCELED</option>
              </select>

              <button
                disabled={savingId===o.id || o.status==='SHIPPED'}
                onClick={() => setStatusFor(o.id, 'SHIPPED')}
                className="bg-indigo-600 text-white px-3 py-2 rounded-lg shadow hover:bg-indigo-700 disabled:opacity-50"
              >
                Mark Shipped
              </button>

              <button
                disabled={savingId===o.id || o.status==='DONE'}
                onClick={() => setStatusFor(o.id, 'DONE')}
                className="bg-emerald-600 text-white px-3 py-2 rounded-lg shadow hover:bg-emerald-700 disabled:opacity-50"
              >
                Mark Done
              </button>
            </div>

            <div className="mt-3 divide-y">
              {o.items?.map(it => (
                <div key={it.id} className="py-2 flex items-center gap-3">
                  {it.product?.imageUrl && (
                    <img src={it.product.imageUrl} alt={it.product.title} className="w-14 h-14 object-cover rounded-lg" />
                  )}
                  <div className="flex-1">
                    <div className="font-medium">{it.product?.title ?? 'Product'}</div>
                    <div className="text-sm text-gray-600">Qty {it.quantity}</div>
                  </div>
                  <div className="text-sm font-medium">{money(it.unitCents * it.quantity)}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {toast && (
        <div className="fixed bottom-4 right-4 bg-black text-white px-4 py-2 rounded-lg shadow">
          {toast}
        </div>
      )}
    </div>
  )
}
