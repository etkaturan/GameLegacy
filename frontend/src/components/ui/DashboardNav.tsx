import { NavLink } from 'react-router-dom'

const TABS = [
  { to: '/dashboard', label: 'Overview', end: true },
  { to: '/dashboard/games', label: 'Games', end: false },
  { to: '/dashboard/achievements', label: 'Achievements', end: false },
  { to: '/dashboard/inventory', label: 'Inventory', end: false },
]

export default function DashboardNav() {
  return (
    <div className="flex gap-2 border-b border-border mb-8">
      {TABS.map(tab => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) =>
            `font-mono text-xs px-4 py-3 -mb-px border-b-2 transition-colors ${
              isActive
                ? 'border-gold text-white'
                : 'border-transparent text-muted hover:text-white'
            }`
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </div>
  )
}