// frontend/src/pages/Home.jsx
import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import useAuth from '../store/useAuth'
import QuiltBlocks from '../components/QuiltBlocks'
import { api } from '../components/api'

const PALETTES = [
  { id: 'cafe',     label: 'Cafe' },
  { id: 'coastal',  label: 'Coastal' },
  { id: 'midnight', label: 'Midnight' },
]

// Prefix relative /uploads paths with the current origin (works behind Nginx)
function resolveUrl(url) {
  if (!url) return ''
  try {
    if (/^https?:\/\//i.test(url)) return url
    if (/^\/\//.test(url)) return window.location.protocol + url
    if (url.startsWith('/')) return window.location.origin + url
    return window.location.origin + '/' + url.replace(/^\.?\//, '')
  } catch {
    return url
  }
}

export default function Home() {
  const { init } = useAuth()
  const [theme, setTheme] = useState('cafe')
  const [featured, setFeatured] = useState([])
  const [loadingFeat, setLoadingFeat] = useState(true)

  useEffect(() => { init() }, [])

  // Load homepage-featured products – with guaranteed fallback to latest with images
  useEffect(() => {
    let mounted = true
    const endLoad = () => mounted && setLoadingFeat(false)

    ;(async () => {
      try {
        setLoadingFeat(true)

        // 1) Try featured
        let rows = []
        try {
          const { data } = await api.get('/products', { params: { featuredHome: 1, limit: 12 } })
          rows = (data?.products || []).filter(p => !!p?.imageUrl)
          if (rows.length) {
            console.info('[Home] Using featuredHome products:', rows.map(r => r.id))
            if (mounted) setFeatured(rows)
            return
          } else {
            console.info('[Home] No featuredHome products returned')
          }
        } catch (e) {
          console.warn('[Home] Featured request failed, will fallback:', e?.response?.data || e?.message)
        }

        // 2) Fallback: get latest and pick ones with images
        try {
          const { data } = await api.get('/products', { params: { limit: 12 } })
          const all = (data?.products || [])
          const withImages = all.filter(p => !!p?.imageUrl)
          if (withImages.length) {
            console.info('[Home] Fallback to latest products with images:', withImages.map(r => r.id))
            if (mounted) setFeatured(withImages)
            return
          } else {
            console.info('[Home] No products with images found in fallback')
          }
        } catch (e) {
          console.error('[Home] Fallback latest products failed:', e?.response?.data || e?.message)
        }

        // 3) Final: show nothing (but don’t leave skeletons up)
        if (mounted) setFeatured([])
      } finally {
        endLoad()
      }
    })()

    return () => { mounted = false }
  }, [])

  const top2 = featured.slice(0, 2)
  const restFeatured = featured.slice(2)

  return (
    <section className={`palette-${theme} py-10 md:py-16 space-y-12`}>
      {/* Hero — background image at 50% via overlay gradient */}
      <div
        className="relative rounded-3xl shadow-xl overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)),url('/uploads/hero-fabric.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Content */}
        <div className="relative z-10 px-6 md:px-12 py-14 md:py-20">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left copy */}
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-2 text-[11px] tracking-wide uppercase font-medium
                                 bg-white/30 px-3 py-1 rounded-full shadow-sm text-white">
                  <span className="inline-block w-2 h-2 rounded-full bg-white" />
                  New Season Drop
                </span>
                {/* Palette switcher */}
                <div className="hidden md:flex items-center gap-2 ml-2">
                  {PALETTES.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setTheme(p.id)}
                      className={`px-3 py-1 rounded-full text-[11px] border shadow-sm hover:opacity-90 transition ${
                        theme === p.id ? 'bg-black/80 text-white border-black/80' : 'bg-white/80 border-white/80 text-black'
                      }`}
                      aria-pressed={theme === p.id}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <h1 className="mt-5 text-4xl md:text-5xl font-extrabold leading-tight tracking-tight text-white">
                Welcome to Bear River Quilting. Quilts for modern homes, <span className="text-white">crafted to last</span>
              </h1>

              <p className="mt-4 text-lg md:text-xl text-white/95 max-w-2xl">
                Heirloom patchwork in contemporary tones—thoughtfully stitched for everyday comfort.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to="/catalog"
                  className="inline-block bg-black/70 text-white px-6 py-3 rounded-xl shadow hover:bg-black/80 transition"
                >
                  Shop Quilts
                </Link>
                <Link
                  to="/account"
                  className="inline-block bg-white/85 px-6 py-3 rounded-xl shadow hover:bg-white border border-white/60 text-black"
                >
                  My Account
                </Link>
              </div>
            </div>

            {/* Right: top 2 products — solid white cards, no blur/opacity */}
            <div className="relative z-20 grid grid-cols-2 gap-4">
              {loadingFeat && (
                <>
                  <CardSkeleton />
                  <CardSkeleton />
                </>
              )}

              {!loadingFeat && top2.map(p => (
                <Link
                  key={p.id}
                  to={`/product/${p.id}`}
                  className="group block bg-white rounded-2xl overflow-hidden shadow hover:shadow-lg transition border border-gray-100"
                  aria-label={`View ${p.title}`}
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={resolveUrl(p.imageUrl)}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform"
                      loading="eager"
                    />
                  </div>
                  <div className="p-3">
                    <div className="font-semibold line-clamp-1 text-gray-900">{p.title}</div>
                    <div className="text-sm text-gray-600 line-clamp-2">{p.description}</div>
                    <div className="mt-1 font-bold text-gray-900">${(p.priceCents/100).toFixed(2)}</div>
                  </div>
                </Link>
              ))}

              {/* If nothing to show, render nothing (no grey placeholders) */}
              {!loadingFeat && !top2.length && null}
            </div>
          </div>
        </div>
      </div>

      {/* Separate block for homepage-featured (excluding the 2 shown in hero) */}
      {restFeatured.length > 0 && (
        <section aria-labelledby="home-featured-heading" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 id="home-featured-heading" className="text-2xl font-semibold text-ink">
              Homepage Featured
            </h2>
            <Link to="/catalog" className="text-indigo-600 hover:underline">View all →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {restFeatured.map(p => (
              <Link key={p.id} to={`/product/${p.id}`} className="bg-white rounded-2xl shadow hover:shadow-md transition overflow-hidden">
                <img
                  src={resolveUrl(p.imageUrl)}
                  alt={p.title}
                  className="w-full h-48 object-cover"
                  loading="lazy"
                />
                <div className="p-3">
                  <h3 className="font-semibold line-clamp-1">{p.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{p.description}</p>
                  <div className="mt-2 font-bold">${(p.priceCents/100).toFixed(2)}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Product Carousel */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-ink">Featured quilts</h2>
          <Link to="/catalog" className="text-indigo-600 hover:underline">View all →</Link>
        </div>
        <ProductCarousel />
      </div>

      {/* Decorative quilt blocks */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-ink">Our Patchwork Palette</h2>
        <QuiltBlocks />
      </div>
    </section>
  )
}

/* -------- Helper components -------- */

function CardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white">
      <div className="w-full aspect-[4/3] bg-gray-200 animate-pulse" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse" />
        <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
      </div>
    </div>
  )
}

/** Lightweight carousel (URL-resolver added) */
function ProductCarousel() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [active, setActive] = useState(0)

  const trackRef = useRef(null)
  const autoplayRef = useRef(null)
  const isPointerDown = useRef(false)
  const startX = useRef(0)
  const scrollStart = useRef(0)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true); setError('')
        const { data } = await api.get('/products')
        const withImages = (data.products || []).filter(p => !!p.imageUrl)
        if (mounted) setItems(withImages)
      } catch (e) {
        if (mounted) setError(e?.response?.data?.error || 'Failed to load products')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (!items.length) return
    startAutoplay()
    return stopAutoplay
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, active])

  function startAutoplay() {
    stopAutoplay()
    autoplayRef.current = setInterval(() => goTo(active + 1), 4000)
  }
  function stopAutoplay() {
    if (autoplayRef.current) clearInterval(autoplayRef.current)
    autoplayRef.current = null
  }

  function goTo(i) {
    if (!trackRef.current || !items.length) return
    const count = items.length
    const idx = (i + count) % count
    setActive(idx)
    const container = trackRef.current
    const card = container.querySelector('[data-slide]')
    if (!card) return
    const cardWidth = card.getBoundingClientRect().width + 16
    container.scrollTo({ left: idx * cardWidth, behavior: 'smooth' })
  }

  function onPointerDown(e) {
    if (!trackRef.current) return
    isPointerDown.current = true
    startX.current = (e.touches?.[0]?.clientX ?? e.clientX ?? 0)
    scrollStart.current = trackRef.current.scrollLeft
    stopAutoplay()
  }
  function onPointerMove(e) {
    if (!isPointerDown.current || !trackRef.current) return
    const x = (e.touches?.[0]?.clientX ?? e.clientX ?? 0)
    const delta = startX.current - x
    trackRef.current.scrollLeft = scrollStart.current + delta
  }
  function onPointerUp() {
    if (!trackRef.current) return
    isPointerDown.current = false
    const card = trackRef.current.querySelector('[data-slide]')
    if (card) {
      const cardWidth = card.getBoundingClientRect().width + 16
      const idx = Math.round(trackRef.current.scrollLeft / cardWidth)
      setActive(Math.max(0, Math.min(idx, items.length - 1)))
      setTimeout(startAutoplay, 800)
    }
  }

  if (loading) return <div className="py-8 text-gray-600">Loading featured quilts…</div>
  if (error) return <div className="py-8 text-red-600">{error}</div>
  if (!items.length) return <div className="py-8 text-gray-600">No featured items yet.</div>

  return (
    <div className="relative">
      {/* Track */}
      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar select-none"
        onMouseDown={onPointerDown}
        onMouseMove={onPointerMove}
        onMouseUp={onPointerUp}
        onMouseLeave={onPointerUp}
        onTouchStart={onPointerDown}
        onTouchMove={onPointerMove}
        onTouchEnd={onPointerUp}
        aria-roledescription="carousel"
        aria-label="Featured products"
      >
        {items.map((p) => (
          <Link
            key={p.id}
            to={`/product/${p.id}`}
            className="snap-start shrink-0 w-72"
            data-slide
            aria-label={`View ${p.title}`}
          >
            <article className="bg-white rounded-2xl shadow hover:shadow-md transition overflow-hidden h-full">
              <div className="relative">
                <img
                  src={resolveUrl(p.imageUrl)}
                  alt={p.title}
                  width={288}
                  height={192}
                  className="w-full h-48 object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent h-16" />
              </div>
              <div className="p-3">
                <h3 className="font-semibold line-clamp-1">{p.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{p.description}</p>
                <div className="mt-2 font-bold">${(p.priceCents/100).toFixed(2)}</div>
              </div>
            </article>
          </Link>
        ))}
      </div>

      {/* Dots */}
      <CarouselDots count={items.length} active={active} onGo={goTo} />

      {/* Prev/Next */}
      <div className="pointer-events-none">
        <button
          onClick={() => goTo(active - 1)}
          className="pointer-events-auto absolute -left-3 top-1/2 -translate-y-1/2 bg-white border shadow rounded-full p-2 hover:bg-gray-50"
          aria-label="Previous slide"
        >
          ‹
        </button>
        <button
          onClick={() => goTo(active + 1)}
          className="pointer-events-auto absolute -right-3 top-1/2 -translate-y-1/2 bg-white border shadow rounded-full p-2 hover:bg-gray-50"
          aria-label="Next slide"
        >
          ›
        </button>
      </div>
    </div>
  )
}

function CarouselDots({ count, active, onGo }) {
  return (
    <div className="mt-3 flex items-center justify-center gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          onClick={() => onGo(i)}
          className={'h-2 rounded-full transition-all ' + (i === active ? 'bg-indigo-600 w-4' : 'bg-gray-300 w-2 hover:bg-gray-400')}
          aria-label={`Go to slide ${i + 1}`}
        />
      ))}
    </div>
  )
}

/* Optional global CSS
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
*/
