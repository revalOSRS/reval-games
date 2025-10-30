import { useNavigate, useLocation } from '@tanstack/react-router'
import { getStoredUser } from '@/hooks/useAuth'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const ADMIN_DISCORD_ID = '603849391970975744'

interface NavItem {
  name: string
  path: string
  icon: string
}

export function AppSidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const userData = getStoredUser()

  const isAdmin = userData?.profile?.discord_id === ADMIN_DISCORD_ID

  const mainNav: NavItem[] = [
    { name: 'Dashboard', path: '/', icon: '🏠' },
    { name: 'Profile', path: '/profile', icon: '👤' },
    { name: 'Events', path: '/events', icon: '📅' },
  ]

  if (isAdmin) {
    mainNav.push({ name: 'Admin', path: '/admin', icon: '🔧' })
  }

  const handleNavClick = (path: string) => {
    navigate({ to: path as any })
  }

  const getAvatarUrl = () => {
    if (userData?.profile?.discord_avatar && userData?.profile?.discord_id) {
      return `https://cdn.discordapp.com/avatars/${userData.profile.discord_id}/${userData.profile.discord_avatar}.png`
    }
    return `https://cdn.discordapp.com/embed/avatars/${Math.floor(Math.random() * 5)}.png`
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-border/40">
      <SidebarHeader className="border-b border-border/40 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="h-12">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                🎮
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Reval Games</span>
                <span className="truncate text-xs text-muted-foreground">OSRS Events</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    onClick={() => handleNavClick(item.path)}
                    isActive={location.pathname === item.path}
                    tooltip={{ children: item.name, hidden: false }}
                    className="justify-center data-[state=collapsed]:justify-center"
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-border/40 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              className="h-12 justify-center data-[state=collapsed]:justify-center"
              tooltip={{ 
                children: (
                  <div className="text-xs">
                    <div className="font-semibold">{userData?.profile?.discord_tag || 'User'}</div>
                    <div className="text-muted-foreground">
                      {userData?.profile?.member_code ? `#${userData.profile.member_code}` : 'Member'}
                    </div>
                  </div>
                ),
                hidden: false 
              }}
            >
              <img 
                src={getAvatarUrl()}
                alt={userData?.profile?.discord_tag || 'User'}
                className="h-8 w-8 rounded-full flex-shrink-0"
              />
              <div className="grid flex-1 text-left text-xs leading-tight">
                <span className="truncate font-semibold">{userData?.profile?.discord_tag || 'User'}</span>
                <span className="truncate text-[10px] text-muted-foreground">
                  {userData?.profile?.member_code ? `#${userData.profile.member_code}` : 'Member'}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

