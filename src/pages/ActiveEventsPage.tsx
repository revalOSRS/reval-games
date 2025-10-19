import { useNavigate } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// Mock data for now
const mockEvents = [
  {
    id: 1,
    name: 'Battleship Bingo',
    type: 'battleship-bingo',
    description: 'Classic battleship-style bingo game with teams',
    status: 'Active',
    participants: 24,
  },
  {
    id: 2,
    name: 'Battleship Bingo #2',
    type: 'battleship-bingo',
    description: 'Another round of battleship bingo',
    status: 'Starting Soon',
    participants: 12,
  },
]

export default function ActiveEventsPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Active Events</h1>
          <Button variant="outline" onClick={() => navigate({ to: '/menu' })}>
            Back to Menu
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockEvents.map((event) => (
            <Card 
              key={event.id}
              className="cursor-pointer hover:border-primary transition-all"
              onClick={() => navigate({ to: `/event/${event.type}/$eventId`, params: { eventId: event.id.toString() } })}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{event.name}</CardTitle>
                  <span className={`text-xs px-2 py-1 rounded ${
                    event.status === 'Active' 
                      ? 'bg-primary/20 text-primary' 
                      : 'bg-secondary text-secondary-foreground'
                  }`}>
                    {event.status}
                  </span>
                </div>
                <CardDescription>{event.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Participants: <span className="text-foreground font-medium">{event.participants}</span>
                  </p>
                  <Button className="w-full" variant="default">
                    Join Event
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {mockEvents.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No active events at the moment</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}


