import { useEffect, useRef, useState } from 'react'
import Button from '../../components/ui/Button'

const TIMELINE_EVENTS = [
  { dot: '#4A9EFF', event: 'Steam account #1 created — 9 games owned', bold: 'Steam account #1 created', date: 'March 2009' },
  { dot: '#C9A84C', event: '1,000 hours reached in Team Fortress 2', bold: '1,000 hours reached', date: '2011' },
  { dot: '#4A9EFF', event: 'Steam account #2 created — Main account', bold: 'Steam account #2 created', date: 'January 2012' },
  { dot: '#FF4655', event: 'Reached Immortal in Valorant Episode 6', bold: 'Reached Immortal', date: '2023' },
  { dot: '#C9A84C', event: '10,000 lifetime hours — Veteran milestone', bold: '10,000 lifetime hours', date: '2024' },
  { dot: '#818CF8', event: 'GameLegacy connected — 17 years unified', bold: 'GameLegacy connected', date: '2026' },
]

function TimelineEvent({ event, dot, bold, date, isLast, isNew }: {
  event: string, dot: string, bold: string, date: string, isLast: boolean, isNew: boolean
}) {
  const desc = event.replace(bold, '').replace(' — ', '')
  return (
    <div
        className="flex gap-3"
        style={isNew ? {
            animation: 'fadeIn 0.4s ease both'
        } : {}}
        >
      <div className="flex flex-col items-center w-5 shrink-0">
        <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: dot }} />
        {!isLast && <div className="w-px flex-1 mt-1" style={{ background: '#2A2A3E' }} />}
      </div>
      <div className="pb-3">
        <p className="text-sm text-body leading-snug">
          <span className="text-white font-medium">{bold}</span>
          {desc ? ` — ${desc}` : ''}
        </p>
        <p className="font-mono text-xs text-muted mt-0.5">{date}</p>
      </div>
    </div>
  )
}

export default function HeroSection() {
  const [visibleEvents, setVisibleEvents] = useState<number>(0)
  const [hours, setHours] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true

    // Counter animation
    const target = 14600
    const steps = 60
    const duration = 2000
    let i = 0
    const interval = setInterval(() => {
      i++
      setHours(Math.min(Math.round((target / steps) * i), target))
      if (i >= steps) clearInterval(interval)
    }, duration / steps)

    // Timeline animation
    const delays = [600, 1400, 2200, 2900, 3700, 4500]
    delays.forEach((delay, idx) => {
      setTimeout(() => setVisibleEvents(idx + 1), delay)
    })

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="min-h-screen flex items-center px-12 py-32 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.06) 0%, transparent 70%)' }} />

      <div className="grid grid-cols-2 gap-16 items-center max-w-6xl mx-auto w-full relative z-10">

        {/* Left */}
        <div>
          <p className="font-mono text-xs tracking-widest text-gold uppercase mb-5">
            Universal gaming identity
          </p>
          <h1 className="font-sans text-6xl font-bold leading-none tracking-tight mb-6">
            Your gaming<br />accounts are<br />temporary.<br />
            <span className="text-gold">Your legacy</span><br />is forever.
          </h1>
          <p className="text-body text-base leading-relaxed max-w-md mb-10">
            GameLegacy unifies every account, platform, and era of your gaming life
            into a single permanent identity. Every hour. Every rank. Every collection.
          </p>
          <div className="flex gap-4">
            <Button variant="primary">Claim your identity</Button>
            <a href="#features">
            <Button variant="ghost">See how it works</Button>
            </a>
          </div>

          {/* Stats strip */}
          <div className="flex gap-8 mt-12 pt-8 border-t border-border">
            {[
              { num: '6+', label: 'Platforms' },
              { num: '∞', label: 'Accounts per player' },
              { num: '1', label: 'Permanent identity' },
            ].map(s => (
              <div key={s.label}>
                <span className="block font-mono text-2xl font-medium text-white">{s.num}</span>
                <span className="block text-xs text-muted mt-0.5">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Archive card */}
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <span className="font-sans text-sm font-medium text-body">Gaming Archive — Kairo_v</span>
            <span className="font-mono text-xs px-3 py-1 rounded-full border"
              style={{ background: 'rgba(201,168,76,0.12)', borderColor: 'rgba(201,168,76,0.3)', color: '#C9A84C' }}>
              LIVE
            </span>
          </div>

          {/* Player identity */}
          <div className="px-5 py-4 border-b border-border flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-sans font-bold text-lg text-white shrink-0"
              style={{ background: 'linear-gradient(135deg, #6366F1, #C9A84C)' }}>K</div>
            <div>
              <p className="font-sans font-semibold text-white">Kairo_v</p>
              <p className="font-mono text-xs text-muted mt-0.5">Gaming since 2009 · 17 years</p>
            </div>
            <span className="ml-auto font-mono text-xs px-3 py-1 rounded-full"
              style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#818CF8' }}>
              LVL 84
            </span>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 border-b border-border">
            {[
              { val: hours.toLocaleString(), key: 'Total hours' },
              { val: '312', key: 'Games owned' },
              { val: 'Immortal', key: 'Peak rank' },
            ].map((s, i) => (
              <div key={s.key} className={`px-4 py-4 text-center ${i < 2 ? 'border-r border-border' : ''}`}>
                <div className="font-mono text-lg font-medium text-white">{s.val}</div>
                <div className="text-xs text-muted mt-1">{s.key}</div>
              </div>
            ))}
          </div>

          {/* Accounts */}
          <div className="px-5 py-4 border-b border-border">
            <p className="font-mono text-xs tracking-widest text-muted uppercase mb-3">Connected accounts</p>
            {[
              { dot: '#4A9EFF', name: 'Steam — Main (2012)', val: '11,400h' },
              { dot: '#7DA6C8', name: 'Steam — Old (2009)', val: '3,200h' },
              { dot: '#FF4655', name: 'Riot — Valorant', val: 'Immortal 2' },
            ].map(a => (
              <div key={a.name} className="flex items-center gap-3 py-1.5">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: a.dot }} />
                <span className="text-sm text-body flex-1">{a.name}</span>
                <span className="font-mono text-xs text-muted">{a.val}</span>
              </div>
            ))}
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
              <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, rgba(201,168,76,0.5), transparent)' }} />
              <span className="font-mono text-xs text-gold">Combined: 14,600h across 4 accounts</span>
              <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, rgba(201,168,76,0.5), transparent)' }} />
            </div>
          </div>

          {/* Timeline */}
          <div className="px-5 py-4">
            <p className="font-mono text-xs tracking-widest text-muted uppercase mb-3">Gaming timeline</p>
            {TIMELINE_EVENTS.slice(0, visibleEvents).map((e, i) => (
              <TimelineEvent
                key={`${i}-${i < visibleEvents}`}
                {...e}
                isLast={i === visibleEvents - 1}
                isNew={i === visibleEvents - 1}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}