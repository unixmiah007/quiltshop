// frontend/src/components/Footer.jsx
export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t bg-white">
      <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-gray-600 flex flex-wrap items-center justify-between gap-3">
        <span>© {year} <span className="font-medium">Bear River Quilting</span>. All rights reserved.</span>
        <nav className="flex items-center gap-4">
          <a href="/about" className="hover:underline">About</a>
          <a href="/contact" className="hover:underline">Contact</a>
          <a href="/terms" className="hover:underline">Terms</a>
          <a href="/privacy" className="hover:underline">Privacy</a>
        </nav>
      </div>
    </footer>
  )
}
