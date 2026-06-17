export interface InventoryItem {
  asset_id: string
  class_id: string
  instance_id: string
  app_id: number
  name: string
  icon_url: string
  marketable: boolean
  tradable: boolean
  type: string
  rarity: string
  rarity_color: string
  exterior: string
  account_index: number
  price_usd: number | null
}

export interface InventoryResult {
  app_id: number
  total_items: number
  items: InventoryItem[]
  total_value_usd: number | null
  priced_item_count: number
}

export interface SupportedGame {
  app_id: number
  name: string
}