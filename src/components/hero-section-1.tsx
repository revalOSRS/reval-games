import React from 'react'
import { Link } from '@tanstack/react-router'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { AnimatedList } from '@/components/ui/animated-list'
import { cn } from '@/lib/utils'
import bannerImage from '@/assets/banner.png'
import senatorRank from '@/assets/ranks/senator.png'
import supervisorRank from '@/assets/ranks/supervisor.png'
import superiorRank from '@/assets/ranks/superior.png'
import leaderRank from '@/assets/ranks/leader.png'
import executiveRank from '@/assets/ranks/executive.png'
import monarchRank from '@/assets/ranks/monarch.png'
import saviourRank from '@/assets/ranks/saviour.png'
import defilerRank from '@/assets/ranks/defiler.png'
import trialistRank from '@/assets/ranks/trialist.png'
import { activityApi, type ActivityEvent, type WOMActivity } from '@/api/activities'
import { womApi } from '@/api/wom'
import { ClanStats } from '@/components/ClanStats'

const transitionVariants = {
    item: {
        hidden: {
            opacity: 0,
            filter: 'blur(12px)',
            y: 12,
        },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: {
                type: 'spring',
                bounce: 0.3,
                duration: 1.5,
            },
        },
    },
} as const

// Helper function to format time ago in Estonian
function formatTimeAgo(dateString: string): string {
    const now = new Date()
    const date = new Date(dateString)
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return 'just nüüd'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes} min tagasi`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h tagasi`
    const days = Math.floor(hours / 24)
    return `${days} päeva tagasi`
}

// Helper function to format WOM activity
function formatWOMActivity(activity: WOMActivity): { icon: string; text: string; iconImage?: string } {
    const displayName = activity.player.displayName
    
    switch (activity.type) {
        case 'joined':
            return { icon: '👋', text: `${displayName} liitus claniga!` }
        case 'left':
            return { icon: '👋', text: `${displayName} lahkus clanist` }
        case 'changed_name':
            return { icon: '✏️', text: `${displayName} vahetas nime` }
        case 'changed_role':
            const roleMap: Record<string, { name: string; image: string }> = {
                'monarch': { name: 'Monarh', image: monarchRank },
                'executive': { name: 'Juhataja', image: executiveRank },
                'leader': { name: 'Liider', image: leaderRank },
                'senator': { name: 'Senaator', image: senatorRank },
                'superior': { name: 'Ülemus', image: superiorRank },
                'supervisor': { name: 'Ülevaataja', image: supervisorRank },
                'saviour': { name: 'Päästja', image: saviourRank },
                'defiler': { name: 'Rüvetaja', image: defilerRank },
                'trialist': { name: 'Prooviline', image: trialistRank }
            }
            
            const roleInfo = activity.role ? roleMap[activity.role] : null
            const roleName = roleInfo?.name || activity.role || 'rolli'
            const roleImage = roleInfo?.image
            
            return { 
                icon: '⭐', 
                text: `${displayName} sai ${roleName} rolli!`,
                iconImage: roleImage
            }
        default:
            return { icon: '📊', text: `${displayName} - ${activity.type}` }
    }
}

export function HeroSection() {
    const [memberCount, setMemberCount] = React.useState<number | null>(null)
    const [activities, setActivities] = React.useState<ActivityEvent[]>([])
    const [clanActivities, setClanActivities] = React.useState<WOMActivity[]>([])
    const [clanStats, setClanStats] = React.useState({
        avgLevel: 0,
        avgXP: 0,
        maxedPercent: 0,
        maxedCount: 0,
        totalEHP: 0,
        totalEHB: 0,
        totalClues: 0,
        totalBosses: 0,
        totalChambers: 0,
        totalTombs: 0,
        totalTheatres: 0,
    })

    React.useEffect(() => {
        // Fetch clan statistics from WOM
        const fetchStats = async () => {
            try {
                const statsResponse = await womApi.getClanStatistics()

                if (statsResponse.status === 'success' && statsResponse.data) {
                    const data = statsResponse.data
                    setMemberCount(data.totalMembers)
                    
                    setClanStats({
                        avgLevel: Math.round(data.averageLevel),
                        avgXP: Math.round(data.averageXP),
                        maxedPercent: data.maxedPlayers.percentage,
                        maxedCount: data.maxedPlayers.count,
                        totalEHP: data.totalStats.ehp,
                        totalEHB: data.totalStats.ehb,
                        totalClues: data.totalStats.clues,
                        totalBosses: data.totalStats.bossKills,
                        totalChambers: data.totalStats.cox,
                        totalTombs: data.totalStats.toa,
                        totalTheatres: data.totalStats.tob,
                    })
                }
            } catch (error) {
                console.error('Failed to fetch clan statistics:', error)
            }
        }

        fetchStats()
    }, [])

    React.useEffect(() => {
        // Fetch activity events
        const fetchActivities = async () => {
            const response = await activityApi.getRecentActivities()
            if (response.status === 'success') {
                // Reverse array so newest items appear at top
                setActivities([...response.data].reverse())
            }
        }

        // Initial fetch
        fetchActivities()

        // Poll every 60 seconds (1 minute) for new activities
        const interval = setInterval(fetchActivities, 60000)

        return () => clearInterval(interval)
    }, [])

    React.useEffect(() => {
        // Fetch WOM clan activities
        const fetchClanActivities = async () => {
            const response = await activityApi.getClanActivity(7)
            if (response.status === 'success') {
                // Reverse array so newest items appear at top
                setClanActivities([...response.data].reverse())
            }
        }

        // Initial fetch
        fetchClanActivities()

        // Poll every 30 seconds for new clan activities
        const interval = setInterval(fetchClanActivities, 30000)

        return () => clearInterval(interval)
    }, [])

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
                <section>
                    <div className="relative pt-24 md:pt-36">
                        <div aria-hidden className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--background)_75%)]" />
                        <div className="mx-auto max-w-7xl px-6">
                            <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                                <AnimatedGroup variants={transitionVariants}>
                                    <h1
                                        className="mt-4 max-w-4xl mx-auto text-balance text-6xl md:text-7xl lg:mt-8 xl:text-[5.25rem]">
                                        REVAL
                                    </h1>
                                </AnimatedGroup>

                                {/* Clan Statistics */}
                                <AnimatedGroup variants={transitionVariants}>
                                    <div className="mt-8">
                                        <ClanStats
                                            totalMembers={memberCount || 0}
                                            avgTotalLevel={clanStats.avgLevel}
                                            avgTotalXP={clanStats.avgXP}
                                            maxedPercent={clanStats.maxedPercent}
                                            maxedCount={clanStats.maxedCount}
                                            monthlyStats={{
                                                totalEHP: clanStats.totalEHP,
                                                totalEHB: clanStats.totalEHB,
                                                totalClues: clanStats.totalClues,
                                                totalBosses: clanStats.totalBosses,
                                                totalChambers: clanStats.totalChambers,
                                                totalTombs: clanStats.totalTombs,
                                                totalTheatres: clanStats.totalTheatres
                                            }}
                                        />
                                    </div>
                                </AnimatedGroup>

                                <AnimatedGroup
                                    variants={{
                                        container: {
                                            visible: {
                                                transition: {
                                                    staggerChildren: 0.05,
                                                    delayChildren: 0.75,
                                                },
                                            },
                                        },
                                        ...transitionVariants,
                                    }}
                                    className="mt-12 flex flex-col items-center justify-center gap-2 md:flex-row">
                                    <div
                                        key={1}
                                        className="bg-foreground/10 rounded-[14px] border p-0.5">
                                        <Button
                                            asChild
                                            size="lg"
                                            className="rounded-xl px-5 text-base">
                                            <a href="https://discord.gg/7Fe5sWs4Su" target="_blank" rel="noopener noreferrer">
                                                <span className="text-nowrap">Liitu Discordiga</span>
                                            </a>
                                        </Button>
                                    </div>
                                    <Button
                                        key={2}
                                        asChild
                                        size="lg"
                                        variant="ghost"
                                        className="h-10.5 rounded-xl px-5">
                                        <Link to="/login">
                                            <span className="text-nowrap">Sisene Mängukoopasse</span>
                                        </Link>
                                    </Button>
                                </AnimatedGroup>
                            </div>
                        </div>

                        <AnimatedGroup
                            variants={{
                                container: {
                                    visible: {
                                        transition: {
                                            staggerChildren: 0.05,
                                            delayChildren: 0.75,
                                        },
                                    },
                                },
                                ...transitionVariants,
                            }}>
                            <div className="relative mt-8 px-2 sm:mt-12 md:mt-20">
                                <div
                                    aria-hidden
                                    className="bg-gradient-to-b to-background absolute inset-0 z-10 from-transparent from-35%"
                                />
                                
                                {/* Container to position lists relative to image */}
                                <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                                    {/* WOM Clan Activity - Below on mobile, left side on xl screens */}
                                    <div className="mb-8 xl:mb-0 xl:absolute xl:left-0 xl:bottom-0 xl:-translate-x-full xl:flex xl:items-end xl:justify-center xl:pointer-events-none xl:h-full" style={{ width: 'auto' }}>
                                        <style dangerouslySetInnerHTML={{ __html: `
                                            @media (min-width: 1280px) {
                                                .xl\\:wom-list-container {
                                                    width: calc((100vw - 1152px) / 2) !important;
                                                }
                                            }
                                        `}} />
                                        <div className="relative mx-auto w-full max-w-md xl:pb-8 xl:pl-4 xl:pointer-events-auto xl:w-80 xl:wom-list-container">
                                            <div
                                                aria-hidden
                                                className="absolute inset-0 z-10"
                                            />
                                            <AnimatedList delay={2000} className="w-full">
                                                {clanActivities.length > 0 ? (
                                                    clanActivities.map((activity) => {
                                                        const formatted = formatWOMActivity(activity)
                                                        return (
                                                            <ActivityItem 
                                                                key={`${activity.playerId}-${activity.createdAt}`}
                                                                icon={formatted.icon}
                                                                text={formatted.text}
                                                                time={formatTimeAgo(activity.createdAt)}
                                                                iconImage={formatted.iconImage}
                                                            />
                                                        )
                                                    })
                                                ) : (
                                                    // Placeholder while loading
                                                    <>
                                                        <ActivityItem icon="📊" text="Laeb clani aktiivsust..." time="just nüüd" />
                                                        <ActivityItem icon="🎮" text="WOM sünkroonimine..." time="just nüüd" />
                                                    </>
                                                )}
                                            </AnimatedList>
                                        </div>
                                    </div>

                                    {/* Central Banner Image - Large and Centered */}
                                    <div className="inset-shadow-2xs ring-background dark:inset-shadow-white/20 bg-background relative overflow-hidden rounded-2xl border shadow-lg shadow-zinc-950/15 ring-1">
                                        <img
                                            className="bg-background relative rounded-2xl w-full h-auto"
                                            src={bannerImage}
                                            alt="Reval Banner"
                                        />
                                    </div>

                                    {/* Dink Activity - Below on mobile, right side on xl screens */}
                                    <div className="mt-8 xl:mt-0 xl:absolute xl:right-0 xl:bottom-0 xl:translate-x-full xl:flex xl:items-end xl:justify-center xl:pointer-events-none xl:h-full" style={{ width: 'auto' }}>
                                        <style dangerouslySetInnerHTML={{ __html: `
                                            @media (min-width: 1280px) {
                                                .xl\\:animated-list-container {
                                                    width: calc((100vw - 1152px) / 2) !important;
                                                }
                                            }
                                        `}} />
                                        <div className="relative mx-auto w-full max-w-md xl:pb-8 xl:pr-4 xl:pointer-events-auto xl:w-80 xl:animated-list-container">
                                            <div
                                                aria-hidden
                                                className="absolute inset-0 z-10"
                                            />
                                            <AnimatedList delay={2000} className="w-full">
                                                {activities.length > 0 ? (
                                                    activities.map((activity) => (
                                                        <ActivityItem 
                                                            key={activity.id}
                                                            icon={activity.icon}
                                                            text={activity.text}
                                                            time={formatTimeAgo(activity.created_at)}
                                                        />
                                                    ))
                                                ) : (
                                                    // Placeholder while loading
                                                    <>
                                                        <ActivityItem icon="🎮" text="Waiting for clan activity..." time="just nüüd" />
                                                        <ActivityItem icon="⚔️" text="Join us in-game!" time="just nüüd" />
                                                        <ActivityItem icon="💬" text="Check out our Discord" time="just nüüd" />
                                                    </>
                                                )}
                                            </AnimatedList>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </AnimatedGroup>
                    </div>
                </section>
                <section className="bg-background pb-8 pt-32 md:pt-48 md:pb-12">
                    <div className="m-auto max-w-5xl px-6">
                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-foreground mb-4">Reval OSRS Clan</h3>
                            <p className="text-muted-foreground mb-8">
                                Eesti parim Old School RuneScape kogukond
                            </p>
                            <div className="flex flex-col md:flex-row justify-center items-center gap-6 text-sm text-muted-foreground">
                                <Link to="/liikmed" className="hover:text-primary transition-colors">
                                    Liikmed
                            </Link>
                                <a href="https://discord.gg/7Fe5sWs4Su" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                                    Discord
                                </a>
                                <span className="text-zinc-600">
                                    © 2025 Reval Clan
                                </span>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}

const menuItems = [
    { name: 'Liikmed', href: '/liikmed' },
    { name: 'Kiirusjooksud', href: '#link' },
    { name: 'Auhinnad', href: '#link' },
    { name: 'Info', href: '#link' },
]

export const HeroHeader = () => {
    const [menuState, setMenuState] = React.useState(false)
    const [isScrolled, setIsScrolled] = React.useState(false)

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])
    return (
        <header>
            <nav
                data-state={menuState && 'active'}
                className="fixed z-20 w-full px-2 group">
                <div className={cn('mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12', isScrolled && 'bg-background/50 max-w-4xl rounded-2xl border backdrop-blur-lg lg:px-5')}>
                    <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
                        <div className="flex w-full justify-between lg:w-auto">
                            <Link
                                href="/"
                                aria-label="home"
                                className="flex items-center space-x-2">
                                <Logo />
                            </Link>

                            <button
                                onClick={() => setMenuState(!menuState)}
                                aria-label={menuState == true ? 'Close Menu' : 'Open Menu'}
                                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden">
                                <Menu className="in-data-[state=active]:rotate-180 group-data-[state=active]:scale-0 group-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                                <X className="group-data-[state=active]:rotate-0 group-data-[state=active]:scale-100 group-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
                            </button>
                        </div>

                        <div className="absolute inset-0 m-auto hidden size-fit lg:block">
                            <ul className="flex gap-8 text-sm">
                                {menuItems.map((item, index) => (
                                    <li key={index}>
                                        {item.href.startsWith('#') ? (
                                            <a
                                            href={item.href}
                                            className="text-muted-foreground hover:text-accent-foreground block duration-150">
                                            <span>{item.name}</span>
                                            </a>
                                        ) : (
                                            <Link
                                                to={item.href}
                                                className="text-muted-foreground hover:text-accent-foreground block duration-150">
                                                <span>{item.name}</span>
                                        </Link>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-background group-data-[state=active]:block lg:group-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
                            <div className="lg:hidden">
                                <ul className="space-y-6 text-base">
                                    {menuItems.map((item, index) => (
                                        <li key={index}>
                                            {item.href.startsWith('#') ? (
                                                <a
                                                href={item.href}
                                                className="text-muted-foreground hover:text-accent-foreground block duration-150">
                                                <span>{item.name}</span>
                                                </a>
                                            ) : (
                                                <Link
                                                    to={item.href}
                                                    className="text-muted-foreground hover:text-accent-foreground block duration-150">
                                                    <span>{item.name}</span>
                                            </Link>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                                <Button
                                    asChild
                                    variant="outline"
                                    size="sm"
                                    className={cn(isScrolled && 'lg:hidden')}>
                                    <Link to="/login">
                                        <span>Login</span>
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    size="sm"
                                    className={cn(isScrolled ? 'lg:inline-flex' : 'hidden')}>
                                    <Link to="/login">
                                        <span>Login</span>
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
}

const Logo = ({ className }: { className?: string }) => {
    return (
        <span className={cn('text-2xl font-bold text-primary', className)}>
            Reval
        </span>
    )
}

const ActivityItem = ({ icon, text, time, iconImage }: { icon: string; text: string; time: string; iconImage?: string }) => {
    return (
        <div className="flex items-center gap-4 p-4 bg-card/50 backdrop-blur-sm rounded-lg border border-border/40">
            {iconImage ? (
                <img src={iconImage} alt="rank" className="w-8 h-8 object-contain" />
            ) : (
                <span className="text-3xl">{icon}</span>
            )}
            <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{text}</p>
                <p className="text-xs text-muted-foreground">{time}</p>
            </div>
        </div>
    )
}