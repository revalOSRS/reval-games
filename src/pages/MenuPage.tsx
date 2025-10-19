import { useNavigate } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useLogout } from '@/hooks/useAuth'

export default function MenuPage() {
  const navigate = useNavigate()
  const logout = useLogout()

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        <h1 className="text-4xl font-bold text-center text-foreground">Main Menu</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card 
            className="cursor-pointer hover:border-primary transition-all"
            onClick={() => navigate({ to: '/profile' })}
          >
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>View your player profile and stats</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                View Profile
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:border-primary transition-all"
            onClick={() => navigate({ to: '/events' })}
          >
            <CardHeader>
              <CardTitle>Active Events</CardTitle>
              <CardDescription>Join ongoing clan events and competitions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="default" className="w-full">
                View Events
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button 
            variant="ghost" 
            onClick={logout}
          >
            Välju
          </Button>
        </div>
      </div>
    </div>
  )
}


