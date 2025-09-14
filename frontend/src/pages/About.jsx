import { Link } from 'react-router-dom'

function QuiltBadge({ className = '' }) {
  // compact SVG quilt block used as a decorative element
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
      {/* 2x2 quilt block */}
      <path d="M50 2 L98 2 L98 50 Z" fill="url(#g1)"/>
      <path d="M2 2 L50 2 L2 50 Z" fill="url(#g2)"/>
      <path d="M2 50 L50 98 L2 98 Z" fill="url(#g3)"/>
      <path d="M98 50 L98 98 L50 98 Z" fill="url(#g4)"/>
      {/* “stitches” */}
      <rect x="6" y="6" width="88" height="88" rx="10" fill="none" stroke="#0f172a" strokeOpacity=".14" strokeDasharray="4 6" strokeWidth="1.5"/>
    </svg>
  )
}

export default function About() {
  return (
    <section className="relative">
      {/* background accents */}
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
        <div className="max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
            Quilts for modern homes, crafted to last.
          </h1>
          <p className="text-lg md:text-xl text-slate-700 mb-6">
            We’re a small studio with <span className="font-semibold">over 15 years</span> of quilting,
            piecing, and finishing experience—bringing heirloom patchwork to everyday life.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/catalog" className="bg-indigo-600 text-white px-5 py-3 rounded-xl shadow hover:bg-indigo-700">
              Shop the collection
            </Link>
            <a href="#our-story" className="px-5 py-3 rounded-xl border bg-white hover:bg-gray-50">Our story</a>
          </div>
        </div>
      </div>

      {/* Highlights */}
      <div className="mt-10 grid sm:grid-cols-3 gap-4">
        {[
          { k: '15+', v: 'Years quilting' },
          { k: '100% cotton', v: 'Quality materials' },
          { k: 'Heirloom finish', v: 'Built for longevity' },
        ].map((stat) => (
          <div key={stat.v} className="bg-white rounded-2xl shadow p-6 border flex items-center gap-4">
            <QuiltBadge className="w-12 h-12" />
            <div>
              <div className="text-2xl font-bold">{stat.k}</div>
              <div className="text-slate-600">{stat.v}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Story */}
      <div id="our-story" className="mt-12 grid lg:grid-cols-2 gap-8 items-center">
        <div className="bg-white rounded-2xl shadow p-6 border">
          <h2 className="text-2xl font-semibold mb-3">Our Story</h2>
          <p className="text-slate-700 leading-relaxed">
            QuiltShop began with a single patchwork throw stitched at a kitchen table. Word spread,
            friends asked for custom pieces, and soon we were quilting full-time. Today, we combine
            classic blocks with contemporary color palettes—so every quilt feels timeless and fresh.
          </p>
          <p className="text-slate-700 leading-relaxed mt-3">
            Each piece is cut, pieced, quilted, and finished in our studio. We obsess over stitch
            quality, seam strength, and the cozy drape that only well-made quilts have.
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow p-6 border">
          <div className="grid grid-cols-3 gap-3">
            <QuiltBadge className="w-full h-auto" />
            <QuiltBadge className="w-full h-auto rotate-45" />
            <QuiltBadge className="w-full h-auto" />
            <QuiltBadge className="w-full h-auto" />
            <QuiltBadge className="w-full h-auto -rotate-12" />
            <QuiltBadge className="w-full h-auto" />
          </div>
          <p className="text-sm text-slate-500 mt-3">Studio swatches & motif studies</p>
        </div>
      </div>

      {/* Process */}
      <div className="mt-12 bg-white rounded-2xl shadow p-6 border">
        <h2 className="text-2xl font-semibold mb-4">How we craft</h2>
        <ol className="grid md:grid-cols-4 gap-4">
          {[
            ['Design', 'We sketch colorways & pick blocks that balance nostalgia and modernity.'],
            ['Piece', 'Cut precisely, then piece blocks into a durable, aligned top.'],
            ['Quilt', 'Layer with batting and quilt for structure and texture.'],
            ['Finish', 'Bind edges and inspect every seam before it ships.'],
          ].map(([title, body], idx) => (
            <li key={idx} className="rounded-xl border p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white text-sm font-semibold">{idx+1}</span>
                <span className="font-medium">{title}</span>
              </div>
              <p className="text-slate-700 text-sm">{body}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* CTA */}
      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-indigo-600 to-rose-500 text-white rounded-2xl p-6 shadow">
        <div>
          <div className="text-xl font-semibold">Ready to wrap your home in color?</div>
          <div className="opacity-90">Browse our latest quilts or ask for a custom piece.</div>
        </div>
        <div className="flex gap-3">
          <Link to="/catalog" className="bg-white text-indigo-700 px-5 py-3 rounded-xl shadow hover:bg-indigo-50">
            Explore Catalog
          </Link>
          <Link to="/contact" className="bg-black/20 px-5 py-3 rounded-xl hover:bg-black/30">
            Request Custom
          </Link>
        </div>
      </div>
    </section>
  )
}
