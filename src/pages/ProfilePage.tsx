import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useProfile } from '@/hooks/useProfile'
import { ApiError } from '@/api/client'
import { getDiscordAvatarUrl, getDiscordInitials } from '@/lib/discord'

// Helper function to safely convert to number
const safeNumber = (value: any): number => {
  if (typeof value === 'number') return value
  if (typeof value === 'string') return parseFloat(value) || 0
  return 0
}

function getRankInfo(womRank?: string): { name: string; color: string } {
  const rankMap: Record<string, { name: string; color: string }> = {
    owner: { name: 'Owner', color: 'from-red-500 to-orange-500' },
    deputy_owner: { name: 'Deputy Owner', color: 'from-orange-500 to-yellow-500' },
    supervisor: { name: 'Supervisor', color: 'from-purple-500 to-pink-500' },
    coordinator: { name: 'Coordinator', color: 'from-blue-500 to-cyan-500' },
    overseer: { name: 'Overseer', color: 'from-green-500 to-emerald-500' },
    moderator: { name: 'Moderator', color: 'from-indigo-500 to-purple-500' },
    corporal: { name: 'Corporal', color: 'from-cyan-500 to-blue-500' },
    recruit: { name: 'Recruit', color: 'from-gray-500 to-slate-500' },
    member: { name: 'Member', color: 'from-gray-400 to-gray-600' },
  }
  
  if (!womRank) return { name: 'Member', color: 'from-gray-400 to-gray-600' }
  
  return rankMap[womRank.toLowerCase()] || { name: womRank, color: 'from-gray-400 to-gray-600' }
}

function formatNumber(num: any): string {
  const n = safeNumber(num)
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toLocaleString()
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function getErrorMessage(error: Error): string {
  if (error instanceof ApiError) {
    return error.message
  }
  return error.message || 'An error occurred'
}

export default function ProfilePage() {
  const { data, isLoading, error, refetch } = useProfile()

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 md:p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header Card Skeleton */}
          <Card className="border-border/40">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-16 h-16 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-6 w-20 mt-2" />
                  </div>
                </div>
                <Skeleton className="h-9 w-32 rounded-md" />
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-border/40">
                <CardHeader className="pb-3">
                  <Skeleton className="h-3 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-9 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* OSRS Accounts Skeleton */}
          <Card className="border-border/40">
            <CardHeader>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-40 mt-1" />
            </CardHeader>
            <CardContent className="space-y-2">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-md border border-border/40 bg-card/30"
                >
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Activity Skeleton */}
          <Card className="border-border/40">
            <CardHeader>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-48 mt-1" />
            </CardHeader>
            <CardContent className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-md border border-border/40 bg-card/30"
                >
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardHeader>
            <CardTitle className="text-red-500">Error Loading Profile</CardTitle>
            <CardDescription>{getErrorMessage(error as Error)}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => refetch()} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardHeader>
            <CardTitle>Profile Not Found</CardTitle>
            <CardDescription>Profile data is not available</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const { member, osrs_accounts, donations, token_movements } = data
  const primaryAccount = osrs_accounts.find(acc => acc.is_primary) || osrs_accounts[0]
  const rank = getRankInfo(primaryAccount?.wom_rank)

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Card */}
        <Card className="border-border/40">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                {member.discord_avatar ? (
                  <img
                    src={getDiscordAvatarUrl(member.discord_id, member.discord_avatar, 96)}
                    alt={member.discord_tag}
                    className="w-16 h-16 rounded-full border border-border/60"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                    {getDiscordInitials(member.discord_tag)}
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-semibold">{member.discord_tag}</h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Member #{member.member_code}
                  </p>
                  <Badge variant={member.is_active ? "default" : "secondary"} className="mt-2">
                    {member.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              <div className={`bg-gradient-to-r ${rank.color} text-white px-4 py-2 rounded-md font-semibold text-sm shadow-sm`}>
                {rank.name}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Token Balance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {safeNumber(member.token_balance).toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">OSRS Accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {osrs_accounts?.length || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Total Donated</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">
                {formatNumber(donations?.total_approved || 0)}M
              </div>
            </CardContent>
          </Card>
        </div>

        {/* OSRS Accounts */}
        {osrs_accounts && osrs_accounts.length > 0 && (
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle className="text-lg">OSRS Accounts</CardTitle>
              <CardDescription className="text-xs">Your linked accounts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {osrs_accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-3 rounded-md border border-border/40 bg-card/30"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {account.osrs_nickname}
                      {account.is_primary && <span className="ml-2 text-yellow-500">⭐</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      EHP: {safeNumber(account.ehp).toFixed(1)} • EHB: {safeNumber(account.ehb).toFixed(1)}
                    </p>
                  </div>
                  {account.wom_rank && (
                    <Badge variant="outline" className="text-xs">
                      {getRankInfo(account.wom_rank).name}
                    </Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Token Movements */}
        {token_movements && token_movements.length > 0 && (
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <CardDescription className="text-xs">Your latest token movements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {token_movements.slice(0, 5).map((movement) => (
                <div
                  key={movement.id}
                  className="flex items-center justify-between p-3 rounded-md border border-border/40 bg-card/30"
                >
                  <div>
                    <p className="text-sm font-medium">{movement.description}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(movement.created_at)}</p>
                  </div>
                  <div className={`text-sm font-semibold ${
                    movement.amount > 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {movement.amount > 0 ? '+' : ''}
                    {movement.amount}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Donations */}
        {donations?.recent && donations.recent.length > 0 && (
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle className="text-lg">Recent Donations</CardTitle>
              <CardDescription className="text-xs">
                Total Approved: {formatNumber(donations?.total_approved || 0)}M GP
                {donations?.total_pending > 0 && ` • Pending: ${formatNumber(donations.total_pending)}M GP`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {donations.recent.map((donation) => (
                <div
                  key={donation.id}
                  className="flex items-center justify-between p-3 rounded-md border border-border/40 bg-card/30"
                >
                  <div>
                    <p className="text-sm font-medium">{formatNumber(donation.amount)}M GP</p>
                    <p className="text-xs text-muted-foreground">
                      {donation.submitted_at ? formatDate(donation.submitted_at) : formatDate(donation.created_at)}
                    </p>
                  </div>
                  <Badge
                    variant={
                      donation.status === 'approved' ? 'default' :
                      donation.status === 'pending' ? 'secondary' :
                      'destructive'
                    }
                    className="text-xs"
                  >
                    {donation.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
