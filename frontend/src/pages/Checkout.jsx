import { useEffect, useState } from 'react'
import useCart from '../store/useCart'
import useAuth from '../store/useAuth'
import { api } from '../components/api'

export default function Checkout() {
  const { items, totalCents, clear } = useCart()
  const { user, init } = useAuth()

  // form state
  const [shipping, setShipping] = useState({ name:'', address1:'', address2:'', city:'', state:'', postal:'', country:'' })
  const [billing,  setBilling]  = useState({ name:'', address1:'', address2:'', city:'', state:'', postal:'', country:'' })

  // ui state
  const [error, setError]     = useState('')
  const [notice, setNotice]   = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(()=>{ init() },[])

  // map cart + address objects to backend payload expected by /checkout/save
  const buildPayload = () => {
    const mapAddr = (a) => ({
      name: a.name || '',
      addr1: a.address1 || '',
      addr2: a.address2 || '',
      city: a.city || '',
      state: a.state || '',
      postal: a.postal || '',
      country: a.country || '',
    })
    const payloadItems = items.map(i => ({
      productId: i.id,
      quantity: Number(i.quantity || i.qty || 1),
    }))
    return { items: payloadItems, shipping: mapAddr(shipping), billing: mapAddr(billing) }
  }

  async function handleCheckout() {
    setError(''); setNotice('')
    if (!user) { setError('Please login before checkout.'); return }
    if (items.length === 0) { setError('Your cart is empty.'); return }

    setLoading(true)
    const payload = buildPayload()

    try {
      // 1) Always save a draft order first (status = PENDING)
      const saved = await api.post('/checkout/save', payload)   // { ok, orderId, totalCents }

      // 2) Then try to start Stripe. If this fails, the draft remains.
      const { data } = await api.post('/checkout/create-session', { ...payload, orderId: saved.data?.orderId })
      if (data?.url) {
        window.location.href = data.url
        return
      }
      // If backend didn’t return a URL
      setNotice('We saved your shipping & billing info and cart. You can complete payment later.')
    } catch (e) {
      // Stripe or network failed — ensure at least the draft save is attempted
      try {
        await api.post('/checkout/save', buildPayload())
        setNotice('We saved your shipping & billing info and cart. You can complete payment later.')
      } catch (e2) {
        setError(e2?.response?.data?.error || 'Could not save your order. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Optional: a manual “Save without payment” button
  async function saveOnly() {
    setError(''); setNotice('')
    if (!user) { setError('Please login before saving.'); return }
    if (items.length === 0) { setError('Your cart is empty.'); return }
    setLoading(true)
    try {
      await api.post('/checkout/save', buildPayload())
      setNotice('Saved! Your order is recorded as PENDING. You can return later to complete payment.')
    } catch (e) {
      setError(e?.response?.data?.error || 'Could not save your order.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Shipping Info</h2>
        <Form data={shipping} setData={setShipping} />
        <h2 className="text-2xl font-semibold mt-8 mb-4">Billing Info</h2>
        <Form data={billing} setData={setBilling} />
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Summary</h2>
        <div className="bg-white p-4 rounded-xl shadow">
          {items.map(i => (
            <div key={i.id} className="flex items-center justify-between py-2">
              <div>{i.title} × {i.quantity}</div>
              <div>${((i.priceCents*i.quantity)/100).toFixed(2)}</div>
            </div>
          ))}
          <div className="border-t mt-3 pt-3 flex items-center justify-between font-semibold">
            <div>Total</div>
            <div>${(totalCents/100).toFixed(2)}</div>
          </div>

          {error && <div className="text-red-600 mt-3">{error}</div>}
          {notice && <div className="text-amber-700 bg-amber-50 border border-amber-200 rounded-md mt-3 p-3">{notice}</div>}

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full mt-4 bg-indigo-600 text-white px-6 py-3 rounded-xl shadow hover:bg-indigo-700 disabled:opacity-50">
            {loading ? 'Processing…' : 'Pay with Stripe'}
          </button>

          <button
            type="button"
            onClick={saveOnly}
            disabled={loading}
            className="w-full mt-3 bg-white border px-6 py-3 rounded-xl shadow hover:bg-gray-50 disabled:opacity-50">
            Save without payment
          </button>
        </div>
      </div>
    </div>
  )
}

function Form({ data, setData }) {
  function upd(k, v){ setData(prev => ({ ...prev, [k]: v })) }
  return (
    <div className="bg-white p-4 rounded-xl shadow grid grid-cols-1 sm:grid-cols-2 gap-3">
      <input className="border p-2 rounded-lg" placeholder="Full name" value={data.name} onChange={e=> upd('name', e.target.value)} />
      <input className="border p-2 rounded-lg sm:col-span-2" placeholder="Address line 1" value={data.address1} onChange={e=> upd('address1', e.target.value)} />
      <input className="border p-2 rounded-lg sm:col-span-2" placeholder="Address line 2 (optional)" value={data.address2} onChange={e=> upd('address2', e.target.value)} />
      <input className="border p-2 rounded-lg" placeholder="City" value={data.city} onChange={e=> upd('city', e.target.value)} />
      <input className="border p-2 rounded-lg" placeholder="State / Province" value={data.state} onChange={e=> upd('state', e.target.value)} />
      <input className="border p-2 rounded-lg" placeholder="Postal code" value={data.postal} onChange={e=> upd('postal', e.target.value)} />
      <input className="border p-2 rounded-lg" placeholder="Country" value={data.country} onChange={e=> upd('country', e.target.value)} />
    </div>
  )
}
