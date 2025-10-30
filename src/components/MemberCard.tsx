import React from 'react'
import { cn } from '@/lib/utils'
import { WOMPlayer, WOMAchievement } from '@/api/wom'
import { Skeleton } from '@/components/ui/skeleton'

interface MemberCardProps {
  member: {
    discord_tag: string
    osrs_nickname: string
    discord_avatar?: string
    role?: string
  }
  womData?: WOMPlayer
  achievements?: WOMAchievement[]
  isLoading?: boolean
  rankImage?: string
}

export function MemberCard({ member, womData, achievements, isLoading, rankImage }: MemberCardProps) {
  const [isFlipped, setIsFlipped] = React.useState(false)

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('et-EE', { month: 'short', day: 'numeric', year: 'numeric' })
  }

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
                <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-zinc-800/50 border border-zinc-600 flex items-center justify-center">
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
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white mb-1">{member.discord_tag}</h3>
                <p className="text-sm text-zinc-400 font-mono">{member.osrs_nickname}</p>
              </div>

              {/* Stats Preview */}
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full bg-zinc-700" />
                  <Skeleton className="h-4 w-3/4 bg-zinc-700 mx-auto" />
                </div>
              ) : womData ? (
                <div className="grid grid-cols-2 gap-4 mt-auto">
                  <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700">
                    <p className="text-xs text-zinc-400 mb-1">Total XP</p>
                    <p className="text-lg font-bold text-primary">{formatNumber(womData.exp)}</p>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700">
                    <p className="text-xs text-zinc-400 mb-1">EHP</p>
                    <p className="text-lg font-bold text-purple-400">{womData.ehp.toFixed(1)}</p>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700">
                    <p className="text-xs text-zinc-400 mb-1">EHB</p>
                    <p className="text-lg font-bold text-blue-400">{womData.ehb.toFixed(1)}</p>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700">
                    <p className="text-xs text-zinc-400 mb-1">Status</p>
                    <p className="text-sm font-semibold text-green-400 capitalize">{womData.status}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center text-zinc-500 mt-auto">
                  <p className="text-sm">No WOM data</p>
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
            <div className="relative h-full flex flex-col p-6">
              {/* Header */}
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-primary mb-1">Viimased Saavutused</h3>
                <p className="text-xs text-zinc-400">Wise Old Man Statistics</p>
              </div>

              {/* Achievements */}
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full bg-zinc-700" />
                  ))}
                </div>
              ) : achievements && achievements.length > 0 ? (
                <div className="space-y-2 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                  {achievements.map((achievement, index) => (
                    <div 
                      key={index}
                      className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700 hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">🏆</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{achievement.name}</p>
                          <p className="text-xs text-zinc-400 capitalize">{achievement.metric}</p>
                          <p className="text-xs text-zinc-500 mt-1">{formatDate(achievement.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-zinc-500">
                  <p className="text-sm">Saavutusi ei leitud</p>
                </div>
              )}

              {/* Footer Stats */}
              {womData && (
                <div className="mt-4 pt-4 border-t border-zinc-700">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Registreeritud:</span>
                      <span className="text-white font-semibold">{formatDate(womData.registeredAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Uuendatud:</span>
                      <span className="text-white font-semibold">{formatDate(womData.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Click hint */}
              <div className="text-center mt-3">
                <p className="text-xs text-zinc-500">Kliki tagasi pööramiseks</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

