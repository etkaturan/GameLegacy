import type { InventoryItem } from '../../types/inventory'

interface Props {
  items: InventoryItem[]
}

export default function InventoryGrid({ items }: Props) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-muted font-mono text-sm">
        No items found in this inventory.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
      {items.map(item => (
        <div
          key={item.asset_id}
          data-hover
          className="bg-surface rounded-lg p-2.5 border transition-all hover:bg-surface2"
          style={{ borderColor: item.rarity_color ? `${item.rarity_color}40` : '#2A2A3E' }}
        >
          <div className="aspect-square rounded mb-2 flex items-center justify-center overflow-hidden"
            style={{ background: `linear-gradient(160deg, ${item.rarity_color}1A, transparent)` }}>
            <img src={item.icon_url} alt={item.name} className="w-full h-full object-contain" />
          </div>
          <p className="font-sans text-xs text-white leading-snug line-clamp-2 mb-1">{item.name}</p>
          {item.exterior && (
            <p className="font-mono text-xs text-muted mb-1">{item.exterior}</p>
          )}
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs" style={{ color: item.rarity_color }}>
              {item.rarity || item.type}
            </span>
            {item.price_usd !== null && item.price_usd !== undefined && (
              <span className="font-mono text-xs text-gold">${item.price_usd.toFixed(2)}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}