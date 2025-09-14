import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import useCart from '../store/useCart'

function useOnClickOutside(ref, handler) {
  useEffect(() => {
    function listener(e) {
      if (!ref.current || ref.current.contains(e.target)) return
      handler(e)
    }
    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)
    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [ref, handler])
}

export default function FloatingCart() {
  const location = useLocation()
  // Hide on dedicated pages if you prefer (toggle these as you like)
  const hiddenOn = ['/cart', '/checkout', '/admin'] // add '/login' if desired
  if (hiddenOn.some(p => location.pathname.startsWith(p))) return null

  // Subscribe only to derived slices to avoid heavy re-renders
  const items = useCart(s => s.items)
  const update = useCart(s => s.update)
  const remove = useCart(s => s.remove)

  const count = useMemo(
    () => items.reduce((n, it) => n + (it.quantity || 0), 0),
    [items]
  )
  const subtotalCents = useMemo(
    () => items.reduce((s, it) => s + (it.priceCents || 0) * (it.quantity || 0), 0),
    [items]
  )

  const [open, setOpen] = useState(false)
  const panelRef = useRef(null)
  useOnClickOutside(panelRef, () => setOpen(false))

  // keyboard esc to close
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  function inc(id, q) { update(id, Math.max(1, (q || 0) + 1)) }
  function dec(id, q) { update(id, Math.max(1, (q || 0) - 1)) }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="fixed right-4 bottom-4 z-40 flex items-center gap-2 bg-indigo-600 text-white px-4 py-3 rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        aria-expanded={open}
        aria-label="Open mini cart"
      >
        <span className="text-lg">🧺</span>
        <span className="font-semibold">Cart</span>
        <span className="ml-1 inline-flex items-center justify-center min-w-6 h-6 text-sm font-bold bg-white text-indigo-600 rounded-full px-2">
          {count}
        </span>
      </button>

      {/* Slide-up panel */}
      {open && (
        <div className="fixed inset-0 z-40" aria-hidden="true">
          {/* backdrop */}
          <div className="absolute inset-0 bg-black/30" />

          {/* panel */}
          <div
            ref={panelRef}
            className="absolute right-4 bottom-20 w-[min(92vw,380px)] bg-white rounded-2xl shadow-2xl overflow-hidden"
            role="dialog"
            aria-label="Mini cart"
          >
            <header className="flex items-center justify-between px-4 py-3 border-b">
              <div className="font-semibold">Your Cart</div>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setOpen(false)}
                aria-label="Close mini cart"
              >
                ✕
              </button>
            </header>

            {items.length === 0 ? (
              <div className="p-4 text-center text-gray-600">
                Your cart is empty.
                <div className="mt-2">
                  <Link to="/catalog" className="text-indigo-600 hover:underline" onClick={()=>setOpen(false)}>
                    Browse quilts →
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <ul className="max-h-80 overflow-auto divide-y">
                  {items.map(it => (
                    <li key={it.id} className="p-3 flex gap-3 items-center">
                      {it.imageUrl && (
                        <img
                          src={it.imageUrl}
                          alt={it.title}
                          className="w-14 h-14 object-cover rounded-lg"
                          loading="lazy"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{it.title}</div>
                        <div className="text-xs text-gray-600">${((it.priceCents||0)/100).toFixed(2)}</div>
                        <div className="mt-1 inline-flex items-center gap-2">
                          <button className="px-2 py-1 rounded bg-gray-100" onClick={()=>dec(it.id, it.quantity)} aria-label="Decrease quantity">−</button>
                          <span className="w-6 text-center">{it.quantity || 0}</span>
                          <button className="px-2 py-1 rounded bg-gray-100" onClick={()=>inc(it.id, it.quantity)} aria-label="Increase quantity">＋</button>
                        </div>
                      </div>
                      <button className="text-red-600 text-sm hover:underline" onClick={()=>remove(it.id)} aria-label={`Remove ${it.title}`}>
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>

                <footer className="p-4 border-t space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Subtotal</span>
                    <span className="font-semibold">${(subtotalCents/100).toFixed(2)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/cart"
                      onClick={()=>setOpen(false)}
                      className="text-center bg-white border px-3 py-2 rounded-xl shadow-sm hover:bg-gray-50"
                    >
                      View Cart
                    </Link>
                    <Link
                      to="/checkout"
                      onClick={()=>setOpen(false)}
                      className="text-center bg-indigo-600 text-white px-3 py-2 rounded-xl shadow hover:bg-indigo-700"
                    >
                      Checkout
                    </Link>
                  </div>
                </footer>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
