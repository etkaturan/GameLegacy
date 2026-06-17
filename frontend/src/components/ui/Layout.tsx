import type { ReactNode } from 'react'
import Navbar from './Navbar'
import Cursor from './Cursor'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-canvas text-white">
      <Cursor />
      <Navbar />
      <main className="pt-16">
        {children}
      </main>
    </div>
  )
}