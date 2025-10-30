/**
 * Get Discord avatar URL for a user
 * @param userId Discord user ID
 * @param avatarHash Discord avatar hash (optional)
 * @param size Avatar size (default: 128)
 * @returns Discord CDN URL for the avatar
 */
export function getDiscordAvatarUrl(
  userId: string,
  avatarHash?: string | null,
  size: number = 128
): string {
  if (avatarHash) {
    // User has a custom avatar
    const extension = avatarHash.startsWith('a_') ? 'gif' : 'png'
    return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.${extension}?size=${size}`
  }
  
  // Default Discord avatar (based on user ID)
  const defaultAvatarIndex = (parseInt(userId) >> 22) % 6
  return `https://cdn.discordapp.com/embed/avatars/${defaultAvatarIndex}.png`
}

/**
 * Get initials from Discord tag
 * @param discordTag Discord username (e.g., "Username#1234" or just "Username")
 * @returns First letter of username, uppercased
 */
export function getDiscordInitials(discordTag: string): string {
  const username = discordTag.split('#')[0]
  return username.charAt(0).toUpperCase()
}

