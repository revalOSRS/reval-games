import React from 'react'
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
  maxedPercent?: number
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
  maxedPercent,
  maxedCount,
  monthlyStats 
}: ClanStatsProps) {
  const [showMonthly, setShowMonthly] = React.useState(false)

  const formatNumber = (num: number) => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(2)}B`
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toLocaleString()
  }

  const stats: ClanStat[] = [
    { label: 'Liikmeid', value: totalMembers, icon: '👥', color: 'text-primary' },
    { label: 'Kesk. Level', value: avgTotalLevel ? Math.round(avgTotalLevel) : '...', icon: '📊', color: 'text-blue-400' },
    { label: 'Kesk. XP', value: avgTotalXP ? formatNumber(avgTotalXP) : '...', icon: '⚡', color: 'text-yellow-400' },
    { label: 'Total EHP', value: monthlyStats ? formatNumber(monthlyStats.totalEHP) : '...', icon: '🎯', color: 'text-green-400' },
    { label: 'Total EHB', value: monthlyStats ? formatNumber(monthlyStats.totalEHB) : '...', icon: '⚔️', color: 'text-red-400' },
    { label: 'Maxed', value: maxedPercent !== undefined ? `${maxedPercent.toFixed(1)}%` : '...', icon: '🏆', color: 'text-purple-400' },
    { label: 'Maxed Mängijaid', value: maxedCount !== undefined ? maxedCount : '...', icon: '👑', color: 'text-amber-400' },
  ]

  const monthlyAchievements: MonthlyAchievement[] = monthlyStats ? [
    { label: 'Total EHP', value: formatNumber(monthlyStats.totalEHP), icon: '⚡' },
    { label: 'Total EHB', value: formatNumber(monthlyStats.totalEHB), icon: '⚔️' },
    { label: 'Total Clues Finished', value: formatNumber(monthlyStats.totalClues), icon: '🗺️' },
    { label: 'Total Bosses Killed', value: formatNumber(monthlyStats.totalBosses), icon: '🛡️' },
    { label: 'Total Chambers Completed', value: formatNumber(monthlyStats.totalChambers), icon: '🏛️' },
    { label: 'Total Tombs Completed', value: formatNumber(monthlyStats.totalTombs), icon: '🪦' },
    { label: 'Total Theatres Completed', value: formatNumber(monthlyStats.totalTheatres), icon: '🎭' },
  ] : []

  return (
    <div className="mx-auto max-w-7xl px-6">
      {/* Toggle View with Fixed Height */}
      <div 
        className="cursor-pointer group min-h-[200px]"
        onClick={() => setShowMonthly(!showMonthly)}
      >
        {!showMonthly ? (
          // Clan Stats View
          <>
            <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
              {stats.map((stat, index) => (
                <div 
                  key={index}
                  className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg p-4 hover:border-primary/50 transition-all duration-300 hover:scale-105 h-32"
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">{stat.icon}</div>
                    <div className={cn("text-2xl font-bold mb-1", stat.color)}>
                      {stat.value}
                    </div>
                    <div className="text-xs text-zinc-400">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Hint text */}
            <div className="text-center mt-4">
              <p className="text-sm text-zinc-500 group-hover:text-primary transition-colors">
                Kliki rohkema statistika vaatamiseks →
              </p>
            </div>
          </>
        ) : (
          // Monthly Stats View
          <>
            <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
              {monthlyAchievements.map((achievement, index) => (
                <div 
                  key={index}
                  className="bg-gradient-to-br from-primary/5 to-purple-500/5 border border-zinc-800 rounded-lg p-4 hover:border-primary/50 transition-all duration-300 hover:scale-105 h-32"
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">{achievement.icon}</div>
                    <div className="text-2xl font-bold text-white mb-1">
                      {achievement.value}
                    </div>
                    <div className="text-xs text-zinc-400">{achievement.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Hint text */}
            <div className="text-center mt-4">
              <p className="text-sm text-zinc-500 group-hover:text-primary transition-colors">
                ← Kliki clani statistika vaatamiseks
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

