import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useProfile } from '@/hooks/useProfile'
import { ApiError } from '@/api/client'

function getRankName(totalScore: number): { name: string; color: string } {
  if (totalScore >= 5000) return { name: 'Legend', color: 'bg-gradient-to-r from-yellow-400 to-orange-500' }
  if (totalScore >= 2500) return { name: 'Master', color: 'bg-gradient-to-r from-purple-500 to-pink-500' }
  if (totalScore >= 1000) return { name: 'Expert', color: 'bg-gradient-to-r from-blue-500 to-cyan-500' }
  if (totalScore >= 500) return { name: 'Veteran', color: 'bg-gradient-to-r from-green-500 to-emerald-500' }
  if (totalScore >= 100) return { name: 'Member', color: 'bg-gradient-to-r from-gray-500 to-slate-500' }
  return { name: 'Recruit', color: 'bg-gray-400' }
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

function formatGP(amount: number): string {
  if (amount >= 1000000000) return `${(amount / 1000000000).toFixed(2)}B gp`
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M gp`
  if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K gp`
  return `${amount} gp`
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const { data: profileData, isLoading, error, refetch } = useProfile()
  const [expandedAccount, setExpandedAccount] = useState<number | null>(null)

  const getErrorMessage = (err: Error): string => {
    if (err instanceof ApiError) {
      return err.message
    }
    if (err.message.includes('Kasutaja andmed puuduvad')) {
      return err.message
    }
    return 'Ühenduse viga. Palun proovi hiljem uuesti.'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-lg text-muted-foreground">Laadin profiili...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl">
          <CardContent className="p-8 space-y-4">
            <p className="text-lg text-destructive text-center">
              {getErrorMessage(error)}
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => navigate({ to: '/menu' })}>
                Tagasi menüüsse
              </Button>
              <Button onClick={() => refetch()}>
                Proovi uuesti
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!profileData) return null

  const { member, osrs_accounts, donations, wom } = profileData
  
  // Calculate total score (EHP + EHB) across all accounts
  const totalScore = osrs_accounts.reduce((sum, acc) => sum + acc.ehp + acc.ehb, 0)
  const rank = getRankName(totalScore)
  
  // Find best account
  const bestAccount = osrs_accounts.reduce((best, acc) => {
    const accScore = acc.ehp + acc.ehb
    const bestScore = best ? best.ehp + best.ehb : 0
    return accScore > bestScore ? acc : best
  }, osrs_accounts[0])

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Mängija Profiil</h1>
            <p className="text-muted-foreground mt-1">Sinu RuneScape mängija detailid</p>
          </div>
          <Button variant="outline" onClick={() => navigate({ to: '/menu' })}>
            Tagasi menüüsse
          </Button>
        </div>

        {/* Discord Info Card */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-2xl font-bold text-primary-foreground">
                  {member.discord_tag.charAt(0).toUpperCase()}
                </div>
                <div>
                  <CardTitle className="text-2xl">{member.discord_tag}</CardTitle>
                  <CardDescription className="mt-1">
                    Liikme kood: #{member.member_code}
                  </CardDescription>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className={`${rank.color} text-white px-4 py-2 rounded-lg font-bold text-lg shadow-lg`}>
                  {rank.name}
                </div>
                <Badge variant={member.is_active ? "default" : "secondary"}>
                  {member.is_active ? 'Aktiivne' : 'Mitteaktiivne'}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-primary">{osrs_accounts.length}</p>
                <p className="text-sm text-muted-foreground mt-1">OSRS Kontod</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-green-600">{totalScore.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground mt-1">Kogu Skoor</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{osrs_accounts.reduce((sum, acc) => sum + acc.ehp, 0).toFixed(1)}</p>
                <p className="text-sm text-muted-foreground mt-1">Kogu EHP</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{osrs_accounts.reduce((sum, acc) => sum + acc.ehb, 0).toFixed(1)}</p>
                <p className="text-sm text-muted-foreground mt-1">Kogu EHB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* OSRS Accounts */}
        <Card>
          <CardHeader>
            <CardTitle>RuneScape Kontod</CardTitle>
            <CardDescription>Sinu ühendatud OSRS kontod ja statistika</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {osrs_accounts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Kontosid ei leitud</p>
            ) : (
              osrs_accounts.map((account) => (
                <div key={account.id} className="border rounded-lg overflow-hidden">
                  <div
                    className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => setExpandedAccount(expandedAccount === account.id ? null : account.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                          {account.osrs_nickname.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-lg">{account.osrs_nickname}</p>
                            {account.is_primary && (
                              <Badge variant="default" className="text-xs">Peamine</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            EHP: {account.ehp.toFixed(1)} • EHB: {account.ehb.toFixed(1)} • Skoor: {(account.ehp + account.ehb).toFixed(1)}
                          </p>
                        </div>
                      </div>
                      <svg
                        className={`w-5 h-5 transition-transform ${expandedAccount === account.id ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {expandedAccount === account.id && (
                    <div className="px-4 pb-4 pt-2 border-t bg-muted/20">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                        <div className="bg-background p-3 rounded border">
                          <p className="text-xs text-muted-foreground">Efficient Hours (PvM)</p>
                          <p className="text-xl font-bold text-purple-600">{account.ehb.toFixed(2)}</p>
                        </div>
                        <div className="bg-background p-3 rounded border">
                          <p className="text-xs text-muted-foreground">Efficient Hours (Skilling)</p>
                          <p className="text-xl font-bold text-blue-600">{account.ehp.toFixed(2)}</p>
                        </div>
                        <div className="bg-background p-3 rounded border">
                          <p className="text-xs text-muted-foreground">Loodud</p>
                          <p className="text-sm font-semibold">{new Date(account.created_at).toLocaleDateString('et-EE')}</p>
                        </div>
                      </div>

                      {account === bestAccount && wom.player && (
                        <div className="mt-4 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                          <p className="text-sm font-semibold text-primary mb-2">🏆 WiseOldMan Stats</p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                            <div>
                              <p className="text-muted-foreground">Total XP</p>
                              <p className="font-bold">{formatNumber(wom.player.exp)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Account Type</p>
                              <p className="font-bold capitalize">{wom.player.type}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Build</p>
                              <p className="font-bold capitalize">{wom.player.build}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Donations & Achievements Row */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Donations */}
          <Card>
            <CardHeader>
              <CardTitle>Annetused</CardTitle>
              <CardDescription>Sinu clan cofferisse tehtud annetused</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Kokku kinnitatud</p>
                  <p className="text-2xl font-bold text-green-600">{formatGP(donations.total_approved)}</p>
                </div>
                {donations.total_pending > 0 && (
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <p className="text-sm text-muted-foreground">Ootel</p>
                    <p className="text-2xl font-bold text-yellow-600">{formatGP(donations.total_pending)}</p>
                  </div>
                )}
                {donations.recent.length > 0 && (
                  <div className="space-y-2">
                    <Separator />
                    <p className="text-sm font-semibold">Hiljutised annetused</p>
                    {donations.recent.slice(0, 3).map((donation) => (
                      <div key={donation.id} className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">
                          {new Date(donation.created_at).toLocaleDateString('et-EE')}
                        </span>
                        <span className="font-semibold">{formatGP(donation.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* WOM Achievements */}
          <Card>
            <CardHeader>
              <CardTitle>Saavutused</CardTitle>
              <CardDescription>Hiljutised WiseOldMan saavutused</CardDescription>
            </CardHeader>
            <CardContent>
              {wom.achievements.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Saavutusi ei leitud</p>
              ) : (
                <div className="space-y-2">
                  {wom.achievements.slice(0, 5).map((achievement, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg transition-colors">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        🏆
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{achievement.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(achievement.createdAt).toLocaleDateString('et-EE')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Weekly Gains */}
        {wom.gains && (
          <Card>
            <CardHeader>
              <CardTitle>Nädalased Võidud</CardTitle>
              <CardDescription>Sinu progress viimase nädala jooksul</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-xl font-bold text-green-600">
                    +{wom.gains.data.computed.ehp.gained.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">EHP</p>
                </div>
                <div className="text-center p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <p className="text-xl font-bold text-purple-600">
                    +{wom.gains.data.computed.ehb.gained.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">EHB</p>
                </div>
                <div className="text-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-xl font-bold text-blue-600">
                    +{formatNumber(wom.gains.data.skills.overall?.gained || 0)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">XP</p>
                </div>
                <div className="text-center p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                  <p className="text-xl font-bold text-orange-600">
                    +{Object.values(wom.gains.data.bosses).reduce((sum: number, boss: any) => sum + (boss.gained || 0), 0)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Boss KC</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
