import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useLogout, getStoredUser } from '@/hooks/useAuth'
import { getDiscordAvatarUrl, getDiscordInitials } from '@/lib/discord'

const ADMIN_DISCORD_ID = '603849391970975744'

export default function Navbar() {
  const navigate = useNavigate()
  const logout = useLogout()
  const userData = getStoredUser()

  const isAdmin = userData?.profile?.discord_id === ADMIN_DISCORD_ID

  const navItems = [
    { name: 'Dashboard', path: '/', icon: '🏠' },
    { name: 'Profile', path: '/profile', icon: '👤' },
    { name: 'Events', path: '/events', icon: '🎮' },
  ]

  if (isAdmin) {
    navItems.push({ name: 'Admin', path: '/admin', icon: '🔧' })
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        {/* Logo / Brand */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary font-bold text-sm">
              R
            </div>
            <div className="hidden md:block">
              <h1 className="text-sm font-semibold">Reval Clan</h1>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: item.path })}
                className="gap-1.5 text-sm font-medium"
              >
                <span className="text-base">{item.icon}</span>
                <span className="hidden sm:inline">{item.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* User Info & Logout */}
        <div className="flex items-center gap-3">
          {userData?.profile && (
            <div className="hidden md:flex items-center gap-2">
              {userData.profile.discord_avatar ? (
                <img
                  src={getDiscordAvatarUrl(userData.profile.discord_id, userData.profile.discord_avatar, 64)}
                  alt={userData.profile.discord_tag}
                  className="h-7 w-7 rounded-full border border-border/60"
                />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs">
                  {getDiscordInitials(userData.profile.discord_tag || 'U')}
                </div>
              )}
              <div className="text-xs">
                <p className="font-medium leading-none">{userData.profile.discord_tag}</p>
                {userData.profile.is_active && (
                  <Badge variant="default" className="mt-1 text-[10px] h-3.5 px-1 py-0">
                    Active
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="gap-1.5 text-sm"
          >
            <span>🚪</span>
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </nav>
  )
}

