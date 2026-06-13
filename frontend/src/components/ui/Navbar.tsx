import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-12 py-4 flex items-center justify-between border-b border-border bg-canvas/85 backdrop-blur-md">
      <Link to="/" className="font-sans text-lg font-bold text-white tracking-tight">
        Game<span className="text-gold">Legacy</span>
      </Link>

      <ul className="flex gap-8 list-none">
        <li><a href="#features" className="text-sm text-muted font-sans font-medium hover:text-white transition-colors">Features</a></li>
        <li><a href="#roadmap" className="text-sm text-muted font-sans font-medium hover:text-white transition-colors">Roadmap</a></li>
        <li><a href="#identity" className="text-sm text-muted font-sans font-medium hover:text-white transition-colors">Identity</a></li>
      </ul>

      <button className="font-sans text-sm font-semibold px-5 py-2 bg-gold text-canvas rounded-md hover:opacity-90 transition-opacity">
        Join the waitlist
      </button>
    </nav>
  )
}