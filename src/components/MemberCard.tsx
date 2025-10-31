import React from 'react'
import { cn } from '@/lib/utils'
import { ClanPlayer } from '@/api/wom'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

interface MemberCardProps {
  member: {
    discord_tag: string
    osrs_nickname: string
    discord_avatar?: string
    role?: string
  }
  playerData?: ClanPlayer
  isLoading?: boolean
  rankImage?: string
}

// Badge helper function - determines what badges to show
function getPlayerBadges(player: ClanPlayer): Array<{ label: string; color: string; icon: string }> {
  const badges: Array<{ label: string; color: string; icon: string }> = []
  
  // Maxed badge (all skills 99)
  const isMaxed = player.skills.every(skill => skill.level >= 99)
  if (isMaxed) {
    badges.push({ label: 'Maxed', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50', icon: '👑' })
  }
  
  // High EHP badge (500+ EHP)
  if (player.stats.ehp >= 500) {
    badges.push({ label: 'Efficient', color: 'bg-green-500/20 text-green-300 border-green-500/50', icon: '⚡' })
  }
  
  // High EHB badge (500+ EHB)
  if (player.stats.ehb >= 500) {
    badges.push({ label: 'Boss Slayer', color: 'bg-red-500/20 text-red-300 border-red-500/50', icon: '⚔️' })
  }
  
  // Inferno cape check (if Zuk kills > 0)
  const zukKills = player.bosses.find(b => b.boss.toLowerCase().includes('zuk'))
  if (zukKills && zukKills.kills > 0) {
    badges.push({ label: 'Inferno', color: 'bg-orange-500/20 text-orange-300 border-orange-500/50', icon: '🔥' })
  }
  
  // Combat achievements (check for CM raids with high KC)
  const cmCox = player.bosses.find(b => b.boss.toLowerCase().includes('chambers') && b.boss.toLowerCase().includes('challenge'))
  const cmTob = player.bosses.find(b => b.boss.toLowerCase().includes('theatre') && b.boss.toLowerCase().includes('hard'))
  const expertToa = player.bosses.find(b => b.boss.toLowerCase().includes('tombs') && b.boss.toLowerCase().includes('expert'))
  
  const hasCmCox = cmCox && cmCox.kills >= 50
  const hasCmTob = cmTob && cmTob.kills >= 50
  const hasExpertToa = expertToa && expertToa.kills >= 50
  
  if (hasCmCox || hasCmTob || hasExpertToa) {
    badges.push({ label: 'Raider', color: 'bg-blue-500/20 text-blue-300 border-blue-500/50', icon: '🏛️' })
  }
  
  return badges
}

export function MemberCard({ member, playerData, isLoading, rankImage }: MemberCardProps) {
  const [isFlipped, setIsFlipped] = React.useState(false)

  const formatNumber = (num: number) => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(2)}B`
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('et-EE', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const badges = playerData ? getPlayerBadges(playerData) : []

  return (
    <div 
      className="group perspective-1000 h-96"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div 
        className={cn(
          "relative w-full h-full duration-500 transform-style-3d cursor-pointer",
          isFlipped && "rotate-y-180"
        )}
      >
        {/* Front of Card */}
        <div className="absolute w-full h-full backface-hidden">
          <div className="w-full h-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 rounded-xl border border-zinc-700 overflow-hidden shadow-2xl hover:shadow-primary/20 transition-shadow">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent_50%)]" />
            </div>

            {/* Content */}
            <div className="relative h-full flex flex-col p-6">
              {/* Rank Badge */}
              {rankImage && (
                <div className="absolute top-4 right-4">
                  <img src={rankImage} alt="rank" className="w-8 h-8 object-contain" />
                </div>
              )}

              {/* Avatar */}
              <div className="flex justify-center mb-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 p-1">
                  <div className="w-full h-full rounded-full overflow-hidden bg-zinc-800 border-2 border-zinc-700">
                    {member.discord_avatar ? (
                      <img 
                        src={member.discord_avatar} 
                        alt={member.discord_tag}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-zinc-500">
                        {member.discord_tag.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Names */}
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-white mb-1">{member.discord_tag}</h3>
              </div>

              {/* Stats Preview */}
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full bg-zinc-700" />
                  <Skeleton className="h-4 w-3/4 bg-zinc-700 mx-auto" />
                </div>
              ) : playerData ? (
                <div className="space-y-3 mt-auto">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-zinc-800/50 rounded-lg p-2.5 border border-zinc-700">
                      <p className="text-[10px] text-zinc-400 mb-0.5">Total Level</p>
                      <p className="text-base font-bold text-primary">{playerData.stats.totalLevel}</p>
                    </div>
                    <div className="bg-zinc-800/50 rounded-lg p-2.5 border border-zinc-700">
                      <p className="text-[10px] text-zinc-400 mb-0.5">Total XP</p>
                      <p className="text-base font-bold text-purple-400">{formatNumber(playerData.stats.totalExp)}</p>
                    </div>
                    <div className="bg-zinc-800/50 rounded-lg p-2.5 border border-zinc-700">
                      <p className="text-[10px] text-zinc-400 mb-0.5">EHP</p>
                      <p className="text-base font-bold text-green-400">{playerData.stats.ehp.toFixed(0)}</p>
                    </div>
                    <div className="bg-zinc-800/50 rounded-lg p-2.5 border border-zinc-700">
                      <p className="text-[10px] text-zinc-400 mb-0.5">EHB</p>
                      <p className="text-base font-bold text-red-400">{playerData.stats.ehb.toFixed(0)}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-zinc-500 mt-auto">
                  <p className="text-sm">No player data</p>
                </div>
              )}

              {/* Click hint */}
              <div className="text-center mt-4">
                <p className="text-xs text-zinc-500">Kliki rohkemate andmete jaoks</p>
              </div>
            </div>
          </div>
        </div>

        {/* Back of Card */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180">
          <div className="w-full h-full bg-gradient-to-br from-primary/10 via-purple-900/10 to-zinc-900 rounded-xl border border-primary/30 overflow-hidden shadow-2xl">
            <div className="relative h-full flex flex-col items-center justify-center p-6">
              {/* Header */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-primary mb-2">Saavutused</h3>
                <p className="text-sm text-zinc-400">{playerData?.displayName || member.osrs_nickname}</p>
              </div>

              {/* Badges Section */}
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full bg-zinc-700" />
                  <Skeleton className="h-12 w-full bg-zinc-700" />
                </div>
              ) : badges.length > 0 ? (
                <div className="w-full max-w-sm">
                  <div className="flex flex-wrap gap-3 justify-center">
                    {badges.map((badge, index) => (
                      <Badge 
                        key={index}
                        className={cn("text-sm px-4 py-2 border", badge.color)}
                        variant="outline"
                      >
                        <span className="mr-2 text-lg">{badge.icon}</span>
                        {badge.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center text-zinc-500">
                  <p className="text-lg mb-2">🏆</p>
                  <p className="text-sm">Märke pole veel teenitud</p>
                </div>
              )}

              {/* Click hint */}
              <div className="text-center mt-auto">
                <p className="text-xs text-zinc-500">Kliki tagasi pööramiseks</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

