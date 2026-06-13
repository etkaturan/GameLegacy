import { useState } from 'react'

export default function WaitlistSection() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    if (!email) return
    setSubmitted(true)
  }

  return (
    <section className="py-24 px-12 text-center border-t border-border">
      <p className="font-mono text-xs tracking-widest text-gold uppercase mb-6">Join the waitlist</p>
      <h2 className="font-sans text-5xl font-bold tracking-tight leading-tight mb-5">
        Start building<br />your <span className="text-gold">legacy.</span>
      </h2>
      <p className="text-body text-base leading-relaxed max-w-md mx-auto mb-10">
        GameLegacy is in early development. Be among the first to connect your accounts
        and claim your permanent gaming identity.
      </p>

      {submitted ? (
        <div className="font-mono text-sm text-gold">
          ✓ You're on the list. We'll be in touch.
        </div>
      ) : (
        <>
          <div className="flex max-w-sm mx-auto mb-3">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 px-5 py-3 bg-surface border border-border border-r-0 rounded-l-md text-white text-sm font-body placeholder-muted outline-none focus:border-gold-dim transition-colors"
            />
            <button
              onClick={handleSubmit}
              className="px-5 py-3 bg-gold text-canvas font-sans font-semibold text-sm rounded-r-md hover:opacity-90 transition-opacity whitespace-nowrap">
              Claim your spot
            </button>
          </div>
          <p className="font-mono text-xs text-muted">No spam. Early access when Phase 1 launches.</p>
        </>
      )}
    </section>
  )
}