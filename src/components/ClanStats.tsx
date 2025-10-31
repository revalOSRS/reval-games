import { cn } from '@/lib/utils'

interface ClanStat {
  label: string
  value: string | number
  icon: string
  color?: string
}

interface MonthlyAchievement {
  label: string
  value: string | number
  icon: string
}

interface ClanStatsProps {
  totalMembers: number
  avgTotalLevel?: number
  avgTotalXP?: number
  maxedCount?: number
  monthlyStats?: {
    totalEHP: number
    totalEHB: number
    totalClues: number
    totalBosses: number
    totalChambers: number
    totalTombs: number
    totalTheatres: number
  }
}

export function ClanStats({ 
  totalMembers, 
  avgTotalLevel, 
  avgTotalXP, 
  maxedCount,
  monthlyStats 
}: ClanStatsProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(2)}B`
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toLocaleString()
  }

  // First row - General clan stats (removed Maxed %)
  const firstRowStats: ClanStat[] = [
    { label: 'Liikmeid', value: totalMembers, icon: '👥', color: 'text-primary' },
    { label: 'Kesk. Level', value: avgTotalLevel ? Math.round(avgTotalLevel) : '...', icon: '📊', color: 'text-blue-400' },
    { label: 'Kesk. XP', value: avgTotalXP ? formatNumber(avgTotalXP) : '...', icon: '⚡', color: 'text-yellow-400' },
    { label: 'Total EHP', value: monthlyStats ? formatNumber(monthlyStats.totalEHP) : '...', icon: '🎯', color: 'text-green-400' },
    { label: 'Total EHB', value: monthlyStats ? formatNumber(monthlyStats.totalEHB) : '...', icon: '⚔️', color: 'text-red-400' },
    { label: 'Maxed Mängijaid', value: maxedCount !== undefined ? maxedCount : '...', icon: '👑', color: 'text-amber-400' },
  ]

  // Second row - Monthly/Activity stats
  const secondRowStats: MonthlyAchievement[] = monthlyStats ? [
    { label: 'Total Clues', value: formatNumber(monthlyStats.totalClues), icon: '🗺️' },
    { label: 'Total Bosses', value: formatNumber(monthlyStats.totalBosses), icon: '🛡️' },
    { label: 'Total Chambers', value: formatNumber(monthlyStats.totalChambers), icon: '🏛️' },
    { label: 'Total Tombs', value: formatNumber(monthlyStats.totalTombs), icon: '🪦' },
    { label: 'Total Theatres', value: formatNumber(monthlyStats.totalTheatres), icon: '🎭' },
  ] : []

  return (
    <div className="mx-auto max-w-7xl px-6">
      <div className="space-y-3">
        {/* First Row - General Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 max-w-4xl mx-auto">
          {firstRowStats.map((stat, index) => (
            <div 
              key={index}
              className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg p-2.5 hover:border-primary/50 transition-all duration-300 hover:scale-105"
            >
              <div className="text-center">
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className={cn("text-xl font-bold mb-0.5", stat.color)}>
                  {stat.value}
                </div>
                <div className="text-[10px] text-zinc-400">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Second Row - Activity Stats (Smaller, more compact, narrower) */}
        {monthlyStats && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-w-2xl mx-auto">
            {secondRowStats.map((achievement, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-primary/5 to-purple-500/5 border border-zinc-800 rounded-lg p-2 hover:border-primary/50 transition-all duration-300 hover:scale-105"
              >
                <div className="text-center">
                  <div className="text-xl mb-0.5">{achievement.icon}</div>
                  <div className="text-sm font-bold text-white mb-0.5">
                    {achievement.value}
                  </div>
                  <div className="text-[9px] text-zinc-500 leading-tight">{achievement.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

