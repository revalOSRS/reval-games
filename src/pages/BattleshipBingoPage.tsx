import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type TabType = 'team1' | 'team2' | 'board' | 'tiles' | 'roles'

export default function BattleshipBingoPage() {
  const navigate = useNavigate()
  const { eventId } = useParams()
  const [activeTab, setActiveTab] = useState<TabType>('board')

  // Generate columns A-Z then AA-AD (30 columns total for wider board)
  const columns = Array.from({ length: 30 }, (_, i) => {
    if (i < 26) {
      return String.fromCharCode(65 + i)
    } else {
      return 'A' + String.fromCharCode(65 + (i - 26))
    }
  })
  
  // Generate rows 1-15
  const rows = Array.from({ length: 15 }, (_, i) => i + 1)

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Tabs - Centered at top */}
      <div className="flex justify-center items-center gap-2 py-4 px-4">
        <Button
          variant={activeTab === 'team1' ? 'default' : 'outline'}
          onClick={() => setActiveTab('team1')}
          className="flex-shrink-0 min-w-[100px]"
        >
          Team 1
        </Button>
        <Button
          variant={activeTab === 'team2' ? 'default' : 'outline'}
          onClick={() => setActiveTab('team2')}
          className="flex-shrink-0 min-w-[100px]"
        >
          Team 2
        </Button>
        <Button
          variant={activeTab === 'board' ? 'default' : 'outline'}
          onClick={() => setActiveTab('board')}
          className="flex-shrink-0 min-w-[120px]"
        >
          Board Layout
        </Button>
        <Button
          variant={activeTab === 'tiles' ? 'default' : 'outline'}
          onClick={() => setActiveTab('tiles')}
          className="flex-shrink-0 min-w-[100px]"
        >
          Tile List
        </Button>
        <Button
          variant={activeTab === 'roles' ? 'default' : 'outline'}
          onClick={() => setActiveTab('roles')}
          className="flex-shrink-0 min-w-[120px]"
        >
          Roles & Info
        </Button>
        
        <Button variant="outline" onClick={() => navigate('/events')} className="ml-4">
          Back
        </Button>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col items-center px-4 pb-4">
        {activeTab === 'board' && (
          <div className="w-full max-w-full flex flex-col items-center space-y-4">
            <h2 className="text-3xl font-bold text-center">BOARD LAYOUT</h2>
            
            {/* Board Grid - Much larger and centered */}
            <div className="overflow-auto max-h-[calc(100vh-200px)] w-full flex justify-center">
              <div className="inline-block">
                <div className="flex">
                  {/* Empty corner cell */}
                  <div className="w-16 h-16 flex-shrink-0 border-2 border-input bg-card flex items-center justify-center text-sm font-bold">
                    
                  </div>
                  
                  {/* Column headers A-T */}
                  {columns.map((col) => (
                    <div
                      key={col}
                      className="w-16 h-16 flex-shrink-0 border-2 border-input bg-card flex items-center justify-center text-sm font-bold"
                    >
                      {col}
                    </div>
                  ))}
                </div>

                {/* Board rows */}
                {rows.map((row) => (
                  <div key={row} className="flex">
                    {/* Row header */}
                    <div className="w-16 h-16 flex-shrink-0 border-2 border-input bg-card flex items-center justify-center text-sm font-bold">
                      {row}
                    </div>
                    
                    {/* Board cells */}
                    {columns.map((col) => (
                      <div
                        key={`${col}${row}`}
                        className={cn(
                          "w-16 h-16 flex-shrink-0 border-2 border-input bg-card/30 hover:bg-card/60 cursor-pointer transition-colors p-1.5"
                        )}
                        title={`${col}${row}`}
                      >
                        {/* Icon placeholder with border and padding */}
                        <div className="w-full h-full border border-muted-foreground/30 rounded bg-muted/20 flex items-center justify-center">
                          <div className="w-8 h-8 bg-muted/40 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'team1' && (
          <div className="w-full max-w-4xl space-y-4">
            <h2 className="text-3xl font-bold text-center">TEAM 1</h2>
            <div className="bg-card border border-input rounded-lg p-6">
              <p className="text-muted-foreground text-center">Team 1 details will be displayed here</p>
            </div>
          </div>
        )}

        {activeTab === 'team2' && (
          <div className="w-full max-w-4xl space-y-4">
            <h2 className="text-3xl font-bold text-center">TEAM 2</h2>
            <div className="bg-card border border-input rounded-lg p-6">
              <p className="text-muted-foreground text-center">Team 2 details will be displayed here</p>
            </div>
          </div>
        )}

        {activeTab === 'tiles' && (
          <div className="w-full max-w-4xl space-y-4">
            <h2 className="text-3xl font-bold text-center">TILE LIST</h2>
            <div className="bg-card border border-input rounded-lg p-6">
              <p className="text-muted-foreground text-center">Tile list will be displayed here</p>
            </div>
          </div>
        )}

        {activeTab === 'roles' && (
          <div className="w-full max-w-4xl space-y-4">
            <h2 className="text-3xl font-bold text-center">ROLES & INFO</h2>
            <div className="bg-card border border-input rounded-lg p-6">
              <p className="text-muted-foreground text-center">Roles and game information will be displayed here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

