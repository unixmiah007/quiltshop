// frontend/src/pages/About.jsx
import { Link } from 'react-router-dom'

/* Compact SVG quilt block used decoratively */
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
      {/* 2x2 quilt block */}
      <path d="M50 2 L98 2 L98 50 Z" fill="url(#g1)"/>
      <path d="M2 2 L50 2 L2 50 Z" fill="url(#g2)"/>
      <path d="M2 50 L50 98 L2 98 Z" fill="url(#g3)"/>
      <path d="M98 50 L98 98 L50 98 Z" fill="url(#g4)"/>
      {/* stitches */}
      <rect x="6" y="6" width="88" height="88" rx="10" fill="none" stroke="#0f172a" strokeOpacity=".14" strokeDasharray="4 6" strokeWidth="1.5"/>
    </svg>
  )
}

/* Image card with an SVG quilt frame overlay */
function QuiltFrameImage({ src, alt = 'Studio portrait', className = '' }) {
  return (
    <div className={`relative rounded-2xl overflow-hidden shadow ${className}`}>
      <img src={src} alt={alt} className="w-full h-full object-cover" loading="eager" />
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern id="sq" width="20" height="20" patternUnits="userSpaceOnUse">
            <rect width="20" height="20" fill="transparent" />
            <path d="M0 0 L20 20 M20 0 L0 20" stroke="white" strokeOpacity=".25" strokeWidth="1.5"/>
          </pattern>
        </defs>
        <rect x="1.5" y="1.5" width="97" height="97" rx="4" fill="none" stroke="white" strokeWidth="3" />
        <rect x="5" y="5" width="90" height="90" rx="4" fill="none" stroke="rgba(255,255,255,.85)" strokeDasharray="6 6" strokeWidth="2"/>
        <rect x="9" y="9" width="82" height="82" rx="3" fill="url(#sq)" />
      </svg>
    </div>
  )
}

export default function About() {
  // Place your photo at: frontend/public/uploads/bio.jpg (or change the path)
  const bioSrc = 'IMG_2342.JPEG'

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

      {/* Story — top aligned on small, equal-height on large */}
      <div id="our-story" className="mt-12 grid lg:grid-cols-2 gap-8 items-start lg:items-stretch">
        {/* Left: Our Story (stretches to match the right on large) */}
        <div className="bg-white rounded-2xl shadow p-6 border self-start lg:h-full flex flex-col">
          <h2 className="text-2xl font-semibold mb-3">Our Story</h2>

          <p className="text-slate-700 leading-relaxed">
            Bear River Quilting began with a single patchwork throw stitched at a kitchen table—meant
            to brighten a long winter and warm a favorite reading chair. Friends asked for one of
            their own. Then friends-of-friends. A side project became a studio, and the studio
            became a calling.
          </p>

          <p className="text-slate-700 leading-relaxed mt-3">
            We chase color the way gardeners chase light—pairing vintage-inspired tones with
            contemporary palettes so each quilt feels timeless and fresh. Our patterns nod to
            classics like log cabin, churn dash, and flying geese, but we’re never afraid to bend
            the rules when the fabric whispers something new.
          </p>

          <p className="text-slate-700 leading-relaxed mt-3">
            Every piece is cut, pieced, quilted, and bound in-house. Seams are pressed with care,
            stitch lengths are checked twice, and edges are finished so your quilt drapes softly the
            day it arrives and only gets cozier with the years. We sew for everyday life—movie
            nights, porch mornings, and the beds that deserve to be made beautifully.
          </p>

          <ul className="mt-4 space-y-2 text-slate-700">
            <li>• Small-batch production with hand-finished details</li>
            <li>• Natural fibers and batting for breathable comfort</li>
            <li>• Reinforced seams and heirloom-quality binding</li>
            <li>• Thoughtful care instructions to make upkeep easy</li>
          </ul>

          <p className="text-slate-700 leading-relaxed mt-3">
            From first sketch to final stitch, our goal is simple: make pieces that feel like home
            the moment you unfold them—and become the ones your family reaches for first.
          </p>

          {/* Spacer to push signature to the bottom if the right card gets taller */}
          <div className="flex-1" />
          <div className="mt-6 text-slate-600">
            — The Bear River Quilting Studio
          </div>
        </div>

        {/* Right: Image + swatches card (stretches) */}
        <div className="bg-white rounded-2xl shadow p-6 border self-start lg:h-full flex flex-col">
          <div className="grid grid-cols-3 gap-3">
            {/* Bio image with quilt frame */}
            <div className="col-span-3 sm:col-span-2">
              <QuiltFrameImage src={bioSrc} alt="Owner at Bear River Quilting" className="h-full" />
            </div>

            {/* Decorative swatches */}
            <QuiltBadge className="w-full h-auto" />
            <QuiltBadge className="w-full h-auto rotate-45" />
            <QuiltBadge className="w-full h-auto" />
            <QuiltBadge className="w-full h-auto" />
            <QuiltBadge className="w-full h-auto -rotate-12" />
            <QuiltBadge className="w-full h-auto" />
          </div>

          <p className="text-sm text-slate-500 mt-3">
            Studio swatches & motif studies
          </p>
          {/* Filler flex space to participate in equal height */}
          <div className="flex-1" />
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
