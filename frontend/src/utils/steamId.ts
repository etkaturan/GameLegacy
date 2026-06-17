/**
 * Extracts the partner Steam ID from a Steam trade URL, or returns the
 * input as-is if it's already a 17-digit Steam ID.
 *
 * Trade URLs look like:
 * https://steamcommunity.com/tradeoffer/new/?partner=123456789&token=AbCdEfGh
 *
 * The `partner` value is a 32-bit account ID, NOT the full 64-bit Steam ID —
 * it must be converted: steamID64 = partnerID + 76561197960265728
 */
const STEAM_ID_64_BASE = 76561197960265728n

export function resolveTradeUrlOrId(input: string): string | null {
  const trimmed = input.trim()

  // Already a 64-bit Steam ID
  if (/^\d{17}$/.test(trimmed)) {
    return trimmed
  }

  // Trade URL — extract partner param
  try {
    const url = new URL(trimmed)
    const partner = url.searchParams.get('partner')
    if (partner && /^\d+$/.test(partner)) {
      const steamId64 = BigInt(partner) + STEAM_ID_64_BASE
      return steamId64.toString()
    }
  } catch {
    // not a valid URL
  }

  return null
}

export function isTradeUrl(input: string): boolean {
  return input.trim().startsWith('https://steamcommunity.com/tradeoffer/')
}