import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import useAuth from '../store/useAuth'
import { api } from '../components/api'

// tiny reusable quilt badge (same as About vibe)
function QuiltBadge({ className = '' }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F59E0B"/><stop offset="100%" stopColor="#FACC15"/>
        </linearGradient>
        <linearGradient id="g2" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22C55E"/><stop offset="100%" stopColor="#10B981"/>
        </linearGradient>
        <linearGradient id="g3" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#93C5FD"/><stop offset="100%" stopColor="#A5B4FC"/>
        </linearGradient>
        <linearGradient id="g4" x1="1" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#F472B6"/><stop offset="100%" stopColor="#FB7185"/>
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="100" height="100" rx="14" fill="#fff"/>
      <rect x="2" y="2" width="96" height="96" rx="12" fill="none" stroke="#e5e7eb" strokeWidth="2"/>
      <path d="M50 2 L98 2 L98 50 Z" fill="url(#g1)"/>
      <path d="M2 2 L50 2 L2 50 Z" fill="url(#g2)"/>
      <path d="M2 50 L50 98 L2 98 Z" fill="url(#g3)"/>
      <path d="M98 50 L98 98 L50 98 Z" fill="url(#g4)"/>
      <rect x="6" y="6" width="88" height="88" rx="10" fill="none" stroke="#0f172a" strokeOpacity=".14" strokeDasharray="4 6" strokeWidth="1.5"/>
    </svg>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <div className="text-sm font-medium text-slate-700 mb-1">{label}</div>
      {children}
    </label>
  )
}

export default function Contact() {
  const { user, init } = useAuth()
  const [form, setForm] = useState({ name:'', email:'', subject:'', orderId:'', message:'' })
  const [sending, setSending] = useState(false)
  const [ok, setOk] = useState('')
  const [err, setErr] = useState('')

  useEffect(() => { init() }, [])
  useEffect(() => {
    if (user?.name || user?.email) {
      setForm(f => ({ ...f, name: f.name || user.name || '', email: f.email || user.email || '' }))
    }
  }, [user])

  function upd(k, v) { setForm(prev => ({ ...prev, [k]: v })) }

  async function submit(e) {
    e.preventDefault()
    setErr(''); setOk('')
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setErr('Please fill your name, email, and message.')
      return
    }
    setSending(true)
    try {
      await api.post('/contact', {
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim() || 'General inquiry',
        orderId: form.orderId?.trim() || null,
        message: form.message.trim(),
      })
      setOk('Thanks! Your message has been received. We’ll get back to you shortly.')
      setForm({ name: user?.name || '', email: user?.email || '', subject:'', orderId:'', message:'' })
    } catch (e) {
      setErr(e?.response?.data?.error || 'Could not send your message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="relative space-y-8">
      {/* background accents (mirrors About) */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-10 -left-10 opacity-30 blur-sm">
          <QuiltBadge className="w-40 h-40" />
        </div>
        <div className="absolute top-24 right-6 opacity-20 blur-[1px]">
          <QuiltBadge className="w-32 h-32" />
        </div>
      </div>

      {/* Hero */}
      <div className="rounded-3xl bg-gradient-to-tr from-rose-50 via-amber-50 to-indigo-50 p-8 md:p-12 border">
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
            Let’s stitch a conversation.
          </h1>
          <p className="text-slate-700">
            Questions, custom requests, or order help? We’ve been quilting for <strong>15+ years</strong> and love matching color, pattern, and purpose.
          </p>
          <div className="mt-4 flex gap-3">
            <Link to="/about" className="px-4 py-2 rounded-xl border bg-white hover:bg-gray-50">About our studio</Link>
            <Link to="/catalog" className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700">Explore quilts</Link>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Form */}
        <form onSubmit={submit} className="md:col-span-2 bg-white rounded-2xl shadow p-6 border space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Your name">
              <input className="border rounded-lg p-2 w-full" value={form.name} onChange={e=>upd('name', e.target.value)} />
            </Field>
            <Field label="Email">
              <input type="email" className="border rounded-lg p-2 w-full" value={form.email} onChange={e=>upd('email', e.target.value)} />
            </Field>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Subject">
              <input className="border rounded-lg p-2 w-full" placeholder="Custom quilt / Order question / etc." value={form.subject} onChange={e=>upd('subject', e.target.value)} />
            </Field>
            <Field label="Order # (optional)">
              <input className="border rounded-lg p-2 w-full" placeholder="e.g. 1234" value={form.orderId} onChange={e=>upd('orderId', e.target.value)} />
            </Field>
          </div>

          <Field label="Message">
            <textarea rows={6} className="border rounded-lg p-2 w-full" value={form.message} onChange={e=>upd('message', e.target.value)} />
          </Field>

          {err && <div className="text-red-600">{err}</div>}
          {ok && <div className="text-emerald-700 bg-emerald-50 border border-emerald-200 rounded p-3">{ok}</div>}

          <div className="flex flex-wrap gap-3">
            <button
              disabled={sending}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl shadow hover:bg-indigo-700 disabled:opacity-50">
              {sending ? 'Sending…' : 'Send message'}
            </button>
            <Link to="/catalog" className="px-6 py-3 rounded-xl border bg-white hover:bg-gray-50">
              Back to catalog
            </Link>
          </div>
        </form>

        {/* Side: studio info + fun graphics */}
        <aside className="bg-white rounded-2xl shadow p-6 border space-y-4">
          <h2 className="text-xl font-semibold">Studio details</h2>
          <p className="text-slate-700 text-sm">
            We stitch heirloom-grade quilts with modern palettes—balanced color, durable seams, cozy drape.
          </p>
          <ul className="text-sm text-slate-700 space-y-1">
            <li>• Custom sizes & colorways</li>
            <li>• Care & repairs</li>
            <li>• Order status & shipping</li>
          </ul>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <QuiltBadge className="w-full h-auto" />
            <QuiltBadge className="w-full h-auto rotate-12" />
            <QuiltBadge className="w-full h-auto -rotate-6" />
          </div>

          <div className="text-sm text-slate-600">
            Prefer email? <a className="text-indigo-600 hover:underline" href="mailto:hello@quiltshop.example">hello@quiltshop.example</a>
          </div>
        </aside>
      </div>

      {/* FAQ / reassurance */}
      <div className="bg-white rounded-2xl shadow p-6 border">
        <h3 className="text-lg font-semibold mb-3">Common questions</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-slate-700">
          <div className="rounded-xl border p-4">
            <div className="font-medium mb-1">Custom timelines</div>
            Most custom throws ship in 2–4 weeks depending on fabric availability.
          </div>
          <div className="rounded-xl border p-4">
            <div className="font-medium mb-1">Care</div>
            Machine wash cold, gentle cycle. Tumble dry low or line dry for best longevity.
          </div>
          <div className="rounded-xl border p-4">
            <div className="font-medium mb-1">Repairs</div>
            Snag or seam issue? We offer repairs to keep your quilt cozy for years.
          </div>
        </div>
      </div>
    </section>
  )
}
