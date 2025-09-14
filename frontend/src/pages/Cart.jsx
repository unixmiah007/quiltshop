import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import useCart from '../store/useCart'

const TAX_RATE = 0.06 // 6%

export default function Cart() {
  const { items, update, remove, clear } = useCart()
  const [drafts, setDrafts] = useState({})
  const [updating, setUpdating] = useState(false)
  const [justUpdated, setJustUpdated] = useState(false)

  // initialize/reset local quantity drafts whenever cart items change
  useEffect(() => {
    const map = {}
    for (const it of items) map[it.id] = it.quantity
    setDrafts(map)
  }, [items])

  // whether any input differs from store quantities
  const isDirty = useMemo(
    () => items.some(it => drafts[it.id] !== it.quantity),
    [items, drafts]
  )

  // live preview subtotal based on drafts
  const subtotalCents = useMemo(
    () => items.reduce((s, it) => s + it.priceCents * (drafts[it.id] ?? it.quantity), 0),
    [items, drafts]
  )
  const taxCents = useMemo(
    () => Math.round(subtotalCents * TAX_RATE),
    [subtotalCents]
  )
  const totalCents = subtotalCents + taxCents

  function onQtyChange(id, value) {
    const qty = Math.max(1, parseInt(value || '1', 10))
    setDrafts(d => ({ ...d, [id]: isNaN(qty) ? 1 : qty }))
  }

  async function applyUpdates() {
    setUpdating(true)
    for (const it of items) {
      const q = drafts[it.id]
      if (typeof q === 'number' && q !== it.quantity) {
        update(it.id, q)
      }
    }
    setUpdating(false)
    setJustUpdated(true)
    setTimeout(() => setJustUpdated(false), 1200)
  }

  function handleRemove(id) {
    remove(id)
    setDrafts(d => {
      const next = { ...d }
      delete next[id]
      return next
    })
  }

  if (items.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-semibold mb-4">Your Cart</h2>
        <p>Your cart is empty. <Link to="/catalog" className="text-indigo-600">Go shopping</Link>.</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Your Cart</h2>

      <div className="space-y-3">
        {items.map(item => (
          <div key={item.id} className="bg-white p-3 rounded-xl shadow flex items-center gap-4">
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-20 h-20 object-cover rounded-lg"
              />
            )}
            <div className="flex-1">
              <div className="font-medium">{item.title}</div>
              <div className="text-sm text-gray-600">${(item.priceCents/100).toFixed(2)}</div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                value={drafts[item.id] ?? item.quantity}
                onChange={e => onQtyChange(item.id, e.target.value)}
                className="w-24 border rounded-lg p-2"
              />
              <button
                onClick={() => handleRemove(item.id)}
                className="text-red-600 hover:text-red-700 px-2 py-1"
                title="Remove item"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid md:grid-cols-2 gap-4 items-start">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={applyUpdates}
            disabled={!isDirty || updating}
            className="bg-indigo-600 text-white px-5 py-3 rounded-xl shadow hover:bg-indigo-700 disabled:opacity-50"
          >
            {updating ? 'Updating…' : 'Update Cart'}
          </button>
          {justUpdated && <span className="text-green-600">Updated!</span>}
          <button
            onClick={() => clear()}
            className="bg-white border px-5 py-3 rounded-xl shadow-sm hover:bg-gray-50"
          >
            Clear Cart
          </button>
          <Link
            to="/catalog"
            className="text-indigo-600 hover:underline"
          >
            Continue Shopping
          </Link>
        </div>

        <div className="bg-white p-4 rounded-xl shadow space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-600">Subtotal</div>
            <div className="font-medium">${(subtotalCents/100).toFixed(2)}</div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-600">Sales Tax (6%)</div>
            <div className="font-medium">${(taxCents/100).toFixed(2)}</div>
          </div>
          <div className="border-t pt-2 flex items-center justify-between">
            <div className="font-semibold">Total</div>
            <div className="text-lg font-bold">
              ${(totalCents/100).toFixed(2)}
            </div>
          </div>
          <Link
            to="/checkout"
            className="block text-center mt-3 bg-indigo-600 text-white px-6 py-3 rounded-xl shadow hover:bg-indigo-700"
          >
            Checkout
          </Link>
        </div>
      </div>
    </div>
  )
}
