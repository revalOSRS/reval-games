import React from 'react'
import { MemberCard } from '@/components/MemberCard'
import { HeroHeader } from '@/components/hero-section-1'
import { womApi, type WOMGroupMember, type ClanPlayer } from '@/api/wom'
import { membersApi } from '@/api/members'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

// Import rank images
import senatorRank from '@/assets/ranks/senator.png'
import supervisorRank from '@/assets/ranks/supervisor.png'
import superiorRank from '@/assets/ranks/superior.png'
import leaderRank from '@/assets/ranks/leader.png'
import executiveRank from '@/assets/ranks/executive.png'
import monarchRank from '@/assets/ranks/monarch.png'
import saviourRank from '@/assets/ranks/saviour.png'
import defilerRank from '@/assets/ranks/defiler.png'
import trialistRank from '@/assets/ranks/trialist.png'
import administratorRank from '@/assets/ranks/administrator.png'
import deputyOwnerRank from '@/assets/ranks/deputy_owner.png'
import ownerRank from '@/assets/ranks/owner.png'

const rankImageMap: Record<string, string> = {
  'owner': ownerRank,
  'deputy_owner': deputyOwnerRank,
  'administrator': administratorRank,
  'monarch': monarchRank,
  'executive': executiveRank,
  'leader': leaderRank,
  'senator': senatorRank,
  'superior': superiorRank,
  'supervisor': supervisorRank,
  'saviour': saviourRank,
  'defiler': defilerRank,
  'trialist': trialistRank,
}

interface MemberWithData {
  womGroupMember: WOMGroupMember
  playerData?: ClanPlayer
  discordMember?: any
}

type SortOption = 'ehp' | 'ehb' | 'totalLevel' | 'totalXP' | 'rank'

export function MembersPage() {
  const [members, setMembers] = React.useState<MemberWithData[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [sortBy, setSortBy] = React.useState<SortOption>('ehp')

  React.useEffect(() => {
    const fetchMembers = async () => {
      setIsLoading(true)
      try {
        // Fetch both WOM group members and clan players data in parallel
        const [womGroupResponse, clanPlayersResponse, discordMembersResponse] = await Promise.all([
          womApi.getGroupMembers(),
          womApi.getClanPlayers(),
          membersApi.getAllMembers().catch(() => ({ status: 'error', data: [] }))
        ])
        
        if (womGroupResponse.status === 'success' && clanPlayersResponse.status === 'success') {
          // Create a map of player data by username for quick lookup
          const playerDataMap = new Map<string, ClanPlayer>()
          clanPlayersResponse.data.players.forEach(player => {
            playerDataMap.set(player.username.toLowerCase(), player)
          })

          // Create a map of discord members by osrs nickname
          const discordMembersMap = new Map<string, any>()
          if (discordMembersResponse.status === 'success' && Array.isArray(discordMembersResponse.data)) {
            discordMembersResponse.data.forEach((member: any) => {
              if (member.osrs_nickname) {
                discordMembersMap.set(member.osrs_nickname.toLowerCase(), member)
              }
            })
          }

          // Combine the data
          const combinedMembers: MemberWithData[] = womGroupResponse.data.map(womMember => {
            const playerData = playerDataMap.get(womMember.player.username.toLowerCase())
            const discordMember = discordMembersMap.get(womMember.player.username.toLowerCase())
            
            return {
              womGroupMember: womMember,
              playerData,
              discordMember,
            }
          })

          setMembers(combinedMembers)
        }
      } catch (error) {
        console.error('Failed to fetch members:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMembers()
  }, [])

  const filteredMembers = React.useMemo(() => {
    let result = members
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(member => 
        member.womGroupMember.player.displayName.toLowerCase().includes(query) ||
        member.womGroupMember.player.username.toLowerCase().includes(query) ||
        (member.discordMember?.discord_tag && member.discordMember.discord_tag.toLowerCase().includes(query))
      )
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'ehp':
          const ehpA = a.playerData?.stats.ehp || 0
          const ehpB = b.playerData?.stats.ehp || 0
          return ehpB - ehpA
        case 'ehb':
          const ehbA = a.playerData?.stats.ehb || 0
          const ehbB = b.playerData?.stats.ehb || 0
          return ehbB - ehbA
        case 'totalLevel':
          const levelA = a.playerData?.stats.totalLevel || 0
          const levelB = b.playerData?.stats.totalLevel || 0
          return levelB - levelA
        case 'totalXP':
          const xpA = a.playerData?.stats.totalExp || 0
          const xpB = b.playerData?.stats.totalExp || 0
          return xpB - xpA
        case 'rank':
          // Rank hierarchy (lower index = higher rank)
          const rankOrder = ['owner', 'deputy_owner', 'administrator', 'monarch', 'executive', 'leader', 'senator', 'superior', 'supervisor', 'saviour', 'defiler', 'trialist']
          const rankA = rankOrder.indexOf(a.womGroupMember.role)
          const rankB = rankOrder.indexOf(b.womGroupMember.role)
          return rankA - rankB
        default:
          return 0
      }
    })

    return result
  }, [members, searchQuery, sortBy])

  return (
    <>
      <HeroHeader />
      <main className="overflow-hidden">
        <div
          aria-hidden
          className="z-[2] absolute inset-0 pointer-events-none isolate opacity-50 contain-strict hidden lg:block">
          <div className="w-[35rem] h-[80rem] -translate-y-[350px] absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
          <div className="h-[80rem] absolute left-0 top-0 w-56 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
          <div className="h-[80rem] -translate-y-[350px] absolute left-0 top-0 w-56 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
        </div>
        
        <div className="min-h-screen bg-background pt-24 md:pt-36">
          <div className="relative">
            <div aria-hidden className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--background)_75%)]" />
            
            {/* Header */}
            <div className="container mx-auto px-4 py-12">
              <div className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
                  Reval Liikmed
                </h1>
                <p className="text-zinc-400 text-lg">
                  Meie kogukonna parimad OSRS mängijad
                </p>
              </div>

                {/* Search Bar */}
                <div className="max-w-4xl mx-auto mb-6">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Otsi liikmeid..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">
                      🔍
                    </div>
                  </div>
                </div>

                {/* Sorting */}
                <div className="max-w-4xl mx-auto mb-4">
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <span className="text-zinc-400 text-sm">Sorteeri:</span>
                    {[
                      { value: 'ehp', label: 'EHP' },
                      { value: 'ehb', label: 'EHB' },
                      { value: 'totalLevel', label: 'Level' },
                      { value: 'totalXP', label: 'XP' },
                      { value: 'rank', label: 'Rank' },
                    ].map((option) => (
                      <Button
                        key={option.value}
                        variant={sortBy === option.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSortBy(option.value as SortOption)}
                        className={sortBy === option.value
                          ? 'bg-primary text-white hover:bg-primary/90'
                          : 'bg-zinc-800/50 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                        }
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                {!isLoading && (
                  <div className="mt-8 flex justify-center gap-8 text-sm">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{filteredMembers.length}</p>
                      <p className="text-zinc-400">{searchQuery ? 'Näidatud' : 'Clani Liikmeid'}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-400">
                        {members.filter(m => m.womGroupMember.player.status === 'active').length}
                      </p>
                      <p className="text-zinc-400">Aktiivseid</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-400">
                        {members.filter(m => m.playerData && m.playerData.skills.every(skill => skill.level >= 99)).length}
                      </p>
                      <p className="text-zinc-400">Maxed</p>
                    </div>
                  </div>
                )}
            </div>

            {/* Members Grid */}
            <div className="container mx-auto px-4 py-12">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-96">
                      <Skeleton className="w-full h-full rounded-xl bg-zinc-800" />
                    </div>
                  ))}
                </div>
              ) : filteredMembers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredMembers.map((member) => (
                    <MemberCard
                      key={member.womGroupMember.player.id}
                      member={{
                        discord_tag: member.discordMember?.discord_tag || member.womGroupMember.player.displayName,
                        osrs_nickname: member.womGroupMember.player.username,
                        discord_avatar: member.discordMember?.discord_avatar,
                        role: member.womGroupMember.role,
                      }}
                      playerData={member.playerData}
                      rankImage={rankImageMap[member.womGroupMember.role]}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-zinc-500 text-lg">Liikmeid ei leitud</p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="mt-4 text-primary hover:underline"
                    >
                      Tühista otsing
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

