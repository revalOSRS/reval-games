export const DISCORD_CONFIG = {
  CLIENT_ID: '1426865801553776670',
  REDIRECT_URI: 'https://revalosrs.ee/',
  // For local development, you might want to use:
  // REDIRECT_URI: 'http://localhost:5173/',
  SCOPE: 'identify guilds guilds.members.read',
  // Your Discord server ID where members must be
  REQUIRED_GUILD_ID: '1425080688063025286',
  // Role IDs that users must have (at least one)
  REQUIRED_ROLE_IDS: ['1433552611340189716'], // Replace with actual role IDs
}

export function getDiscordAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: DISCORD_CONFIG.CLIENT_ID,
    response_type: 'code',
    redirect_uri: DISCORD_CONFIG.REDIRECT_URI,
    scope: DISCORD_CONFIG.SCOPE,
  })

  return `https://discord.com/oauth2/authorize?${params.toString()}`
}

