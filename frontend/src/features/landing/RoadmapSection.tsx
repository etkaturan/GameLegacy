const PHASES = [
  { num: '01', title: 'Steam Identity', desc: 'Multiple Steam accounts merged into one identity. Combined library, playtime, achievements, and filtering.', status: 'Building now', style: 'active' },
  { num: '02', title: 'Personal Archive', desc: 'Gaming timeline, calendar history, levels, titles, and full profile customization.', status: 'Up next', style: 'next' },
  { num: '03', title: 'Collections', desc: 'Inventory showcase, collection value tracking, rare item history, and DLC completion.', status: 'Coming soon', style: 'soon' },
  { num: '04', title: 'Multi-Platform', desc: 'Riot, PlayStation, Xbox, Epic, Ubisoft, EA, Battle.net. Full competitive career tracking.', status: 'Planned', style: 'soon' },
  { num: '05', title: 'Universal Hub', desc: 'Game launching, AI-powered insights, advanced analytics, and long-term gaming reports.', status: 'Planned', style: 'soon' },
  { num: '06', title: 'Social Network', desc: 'Public profiles, friends, comparisons, community events, and global leaderboards.', status: 'Vision', style: 'soon' },
]

const statusStyles: Record<string, string> = {
  active: 'bg-[rgba(201,168,76,0.12)] border border-[rgba(201,168,76,0.3)] text-gold',
  next:   'bg-[rgba(99,102,241,0.1)] border border-[rgba(99,102,241,0.25)] text-indigo',
  soon:   'bg-surface border border-border text-muted',
}

export default function RoadmapSection() {
  return (
    <section id="roadmap" className="py-24 px-12 max-w-6xl mx-auto">
      <p className="font-mono text-xs tracking-widest text-gold uppercase mb-4">Product roadmap</p>
      <h2 className="font-sans text-5xl font-bold tracking-tight leading-tight mb-14">
        Built in phases.<br />Designed for decades.
      </h2>

      <div className="grid grid-cols-3 gap-4">
        {PHASES.map(p => (
          <div key={p.num}
            className={`relative rounded-xl p-6 overflow-hidden border transition-all duration-200
              ${p.style === 'active'
                ? 'bg-surface2 border-[rgba(201,168,76,0.4)]'
                : 'bg-surface border-border hover:border-muted'
              }`}>
            {p.style === 'active' && (
              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(to right, #C9A84C, transparent)' }} />
            )}
            <p className="font-mono text-xs text-muted mb-2">Phase {p.num}</p>
            <h3 className="font-sans text-sm font-semibold text-white mb-2">{p.title}</h3>
            <p className="text-xs text-muted leading-relaxed mb-4">{p.desc}</p>
            <span className={`inline-block font-mono text-xs px-3 py-1 rounded-full ${statusStyles[p.style]}`}>
              {p.status}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}