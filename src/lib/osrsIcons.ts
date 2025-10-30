/**
 * Utility functions for handling OSRS item/skill/boss icons
 */

// Base URL for OSRS Wiki images
const WIKI_BASE_URL = 'https://oldschool.runescape.wiki'

/**
 * Get the URL for an OSRS Wiki image
 * @param iconName - The name of the icon (e.g., "Abyssal_whip", "Zulrah", "Attack")
 * @param size - Optional size parameter (default: auto)
 * @returns The full URL to the image
 */
export function getOSRSIconUrl(iconName: string, size?: number): string {
  // For most items, the detail image is at /images/<name>_detail.png
  // For some items like skills or bosses, it's just /images/<name>.png
  
  // Common patterns:
  // Items: https://oldschool.runescape.wiki/images/<item>_detail.png
  // Skills: https://oldschool.runescape.wiki/images/<skill>_icon.png
  // Bosses: https://oldschool.runescape.wiki/images/<boss>.png
  
  // Icon name is already formatted with underscores and URL encoding from the JSON
  // Try detail version first (most items)
  const detailUrl = `${WIKI_BASE_URL}/images/${iconName}_detail.png`
  
  // For now, return the detail URL
  // In production, you might want to check if the image exists and fallback
  return detailUrl
}

/**
 * Get skill icon URL
 */
export function getSkillIconUrl(skillName: string): string {
  const formattedName = skillName.replace(/ /g, '_')
  return `${WIKI_BASE_URL}/images/${formattedName}_icon.png`
}

/**
 * Fallback icon URL if the main one doesn't load
 */
export function getFallbackIconUrl(): string {
  return `${WIKI_BASE_URL}/images/Coins_detail.png`
}

/**
 * Alternative: Use WOM's image CDN (simpler and more reliable)
 * WOM uses: https://wiseoldman.net/img/items/<item_id>.png
 * But requires knowing item IDs
 */
export function getWOMIconUrl(itemId: number): string {
  return `https://wiseoldman.net/img/items/${itemId}.png`
}

/**
 * Map icon names to WOM item IDs (partial list)
 * This would need to be expanded or loaded from an API
 */
export const WOM_ITEM_IDS: Record<string, number> = {
  'Abyssal_whip': 4151,
  'Dragon_warhammer': 13576,
  'Bandos_chestplate': 11832,
  'Fire_cape': 6570,
  'Infernal_cape': 21295,
  'Twisted_bow': 20997,
  'Scythe_of_vitur': 22325,
  'Dragon_claws': 13652,
  // Add more as needed
}

/**
 * Get icon URL with automatic fallback
 */
export function getIconWithFallback(iconName: string): string {
  // Try to use WOM if we have the ID
  if (WOM_ITEM_IDS[iconName]) {
    return getWOMIconUrl(WOM_ITEM_IDS[iconName])
  }
  
  // Otherwise use OSRS Wiki
  return getOSRSIconUrl(iconName)
}

