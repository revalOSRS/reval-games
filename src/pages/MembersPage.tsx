import React from 'react'
import { MemberCard } from '@/components/MemberCard'
import { HeroHeader } from '@/components/hero-section-1'
import { womApi, type WOMGroupMember } from '@/api/wom'
import { Skeleton } from '@/components/ui/skeleton'

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

const rankImageMap: Record<string, string> = {
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

export function MembersPage() {
  const [members, setMembers] = React.useState<WOMGroupMember[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState('')

  React.useEffect(() => {
    const fetchMembers = async () => {
      setIsLoading(true)
      try {
        const response = await womApi.getGroupMembers()
        
        if (response.status === 'success') {
          setMembers(response.data)
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
    if (!searchQuery) return members
    
    const query = searchQuery.toLowerCase()
    return members.filter(member => 
      member.player.displayName.toLowerCase().includes(query) ||
      member.player.username.toLowerCase().includes(query)
    )
  }, [members, searchQuery])

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
                <div className="max-w-md mx-auto">
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

                {/* Stats */}
                {!isLoading && (
                  <div className="mt-8 flex justify-center gap-8 text-sm">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{members.length}</p>
                      <p className="text-zinc-400">Clani Liikmeid</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-400">
                        {members.filter(m => m.player.status === 'active').length}
                      </p>
                      <p className="text-zinc-400">Aktiivseid</p>
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
                      key={member.player.id}
                      member={{
                        discord_tag: member.player.displayName,
                        osrs_nickname: member.player.username,
                        discord_avatar: undefined, // Will be fetched from new BE endpoint
                        role: member.role,
                      }}
                      womData={member.player}
                      achievements={undefined} // Will be fetched from new BE endpoint
                      rankImage={rankImageMap[member.role]}
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

