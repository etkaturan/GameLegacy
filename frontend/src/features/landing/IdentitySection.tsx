const IDENTITIES = [
  {
    icon: '🏆',
    name: 'The Completionist',
    desc: 'Story games, RPGs, single-player experiences. Measured by completion rate, achievements unlocked, and difficulty conquered.',
    tags: ['Completion %', 'Achievements', 'Difficulty'],
  },
  {
    icon: '⚔️',
    name: 'The Competitor',
    desc: 'Rankings, seasonal history, peak ratings. Your competitive career across Valorant, LoL, CS2, Dota 2 — all in one place.',
    tags: ['Peak rank', 'Match history', 'Seasonal'],
  },
  {
    icon: '💎',
    name: 'The Collector',
    desc: 'Rare skins, limited items, digital collections. Track your CS2 knives, Dota cosmetics, and collection value over time.',
    tags: ['Rare items', 'Est. value', 'Rarity'],
  },
  {
    icon: '🌍',
    name: 'The Explorer',
    desc: 'Genre breadth, platform diversity, games touched across your entire gaming life. The true generalist identity.',
    tags: ['Genre diversity', 'Platforms', 'Games played'],
  },
]

export default function IdentitySection() {
  return (
    <section id="identity" className="py-24 px-12 max-w-6xl mx-auto">
      <p className="font-mono text-xs tracking-widest text-gold uppercase mb-4">Gaming DNA</p>
      <h2 className="font-sans text-5xl font-bold tracking-tight leading-tight mb-4">
        Your identity,<br />your categories.
      </h2>
      <p className="text-body text-base leading-relaxed max-w-lg mb-14">
        Not every game is measured the same way. GameLegacy understands the difference
        between a completionist, a competitor, a collector, and an explorer.
      </p>

      <div className="grid grid-cols-2 gap-4">
        {IDENTITIES.map(item => (
          <div key={item.name}
            className="bg-surface border border-border rounded-xl p-6 hover:border-muted hover:bg-surface2 transition-all duration-200 group">
            <div className="text-2xl mb-4">{item.icon}</div>
            <h3 className="font-sans text-base font-semibold text-white mb-2">{item.name}</h3>
            <p className="text-sm text-muted leading-relaxed mb-4">{item.desc}</p>
            <div className="flex gap-2 flex-wrap">
              {item.tags.map(tag => (
                <span key={tag}
                  className="font-mono text-xs px-2 py-1 rounded border border-border text-muted">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}