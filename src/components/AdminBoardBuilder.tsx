import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BingoTile, BuffDebuff, getCoordinate, BonusTier, TileCategory, TileDifficulty } from '@/types/bingo'
import { getOSRSIconUrl } from '@/lib/osrsIcons'
import { cn } from '@/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { membersApi, AdminMember } from '@/api/members'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { womApi } from '@/api/members'
import { Skeleton } from '@/components/ui/skeleton'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger, ContextMenuSeparator } from '@/components/ui/context-menu'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type WizardStep = 'board' | 'teams' | 'review'

export default function AdminBoardBuilder() {
  // Wizard state
  const [currentStep, setCurrentStep] = useState<WizardStep>('board')
  
  // Board state
  const [allTiles, setAllTiles] = useState<BingoTile[]>([])
  const [allBuffsDebuffs, setAllBuffsDebuffs] = useState<BuffDebuff[]>([])
  const [gridRows, setGridRows] = useState(15)
  const [gridColumns, setGridColumns] = useState(30)
  const [boardName, setBoardName] = useState('New Board')
  const [boardDescription, setBoardDescription] = useState('')
  const [placedTiles, setPlacedTiles] = useState<Record<string, string>>({}) // coord -> tileId
  const [tileBuffsDebuffs, setTileBuffsDebuffs] = useState<Record<string, string>>({}) // coord -> buffDebuffId
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [draggedTile, setDraggedTile] = useState<string | null>(null)
  const [draggedBuffDebuff, setDraggedBuffDebuff] = useState<string | null>(null)
  const [dragOverCoord, setDragOverCoord] = useState<string | null>(null)

  // Teams state
  const [allMembers, setAllMembers] = useState<AdminMember[]>([])
  const [team1Members, setTeam1Members] = useState<string[]>([]) // discord_ids
  const [team2Members, setTeam2Members] = useState<string[]>([]) // discord_ids
  const [team1Name, setTeam1Name] = useState('Team 1')
  const [team2Name, setTeam2Name] = useState('Team 2')
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [memberSearchQuery, setMemberSearchQuery] = useState('')
  
  // Player stats sheet
  const [selectedPlayer, setSelectedPlayer] = useState<AdminMember | null>(null)
  const [playerStatsOpen, setPlayerStatsOpen] = useState(false)
  const [playerStatsLoading, setPlayerStatsLoading] = useState(false)
  const [playerWOMData, setPlayerWOMData] = useState<any>(null)
  const [playerGainsData, setPlayerGainsData] = useState<any>(null)
  
  // Team comparison
  const [showTeamComparison, setShowTeamComparison] = useState(false)
  const [teamComparisonData, setTeamComparisonData] = useState<any>(null)
  const [loadingComparison, setLoadingComparison] = useState(false)

  // Tile editor state
  const [editingTile, setEditingTile] = useState<BingoTile | null>(null)
  const [tileEditorOpen, setTileEditorOpen] = useState(false)

  useEffect(() => {
    fetch('/data/bingo-tiles.json')
      .then(res => res.json())
      .then(data => setAllTiles(data.tiles))
      .catch(err => console.error('Failed to load tiles:', err))

    fetch('/data/buffs-debuffs.json')
      .then(res => res.json())
      .then(data => {
        const combined = [...data.buffs, ...data.debuffs]
        setAllBuffsDebuffs(combined)
      })
      .catch(err => console.error('Failed to load buffs/debuffs:', err))
  }, [])

  useEffect(() => {
    if (currentStep === 'teams' && allMembers.length === 0) {
      loadMembers()
    }
  }, [currentStep])

  const loadMembers = async () => {
    setLoadingMembers(true)
    try {
      const response = await membersApi.getAllMembers()
      if (response.status === 'success') {
        setAllMembers(response.data)
      }
    } catch (error) {
      console.error('Failed to load members:', error)
      alert('Failed to load members. Please check your admin API key.')
    } finally {
      setLoadingMembers(false)
    }
  }

  const filteredTiles = allTiles.filter(tile => {
    const matchesSearch = tile.task.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tile.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || tile.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const getTileById = (id: string) => allTiles.find(t => t.id === id)
  const getBuffDebuffById = (id: string) => allBuffsDebuffs.find(b => b.id === id)

  const handleDragStart = (tileId: string) => {
    setDraggedTile(tileId)
  }

  const handleDragOver = (e: React.DragEvent, coord: string) => {
    e.preventDefault()
    setDragOverCoord(coord)
  }

  const handleDragLeave = () => {
    setDragOverCoord(null)
  }

  const handleDragEnd = () => {
    setDraggedTile(null)
    setDraggedBuffDebuff(null)
    setDragOverCoord(null)
  }

  const handleDrop = (coord: string) => {
    if (draggedTile) {
      setPlacedTiles(prev => ({
        ...prev,
        [coord]: draggedTile
      }))
      setDraggedTile(null)
      setDragOverCoord(null)
    } else if (draggedBuffDebuff) {
      // Only allow buff/debuff on tiles that have a task
      if (placedTiles[coord]) {
        setTileBuffsDebuffs(prev => ({
          ...prev,
          [coord]: draggedBuffDebuff
        }))
      }
      setDraggedBuffDebuff(null)
      setDragOverCoord(null)
    }
  }

  const handleRemoveTile = (coord: string) => {
    setPlacedTiles(prev => {
      const newTiles = { ...prev }
      delete newTiles[coord]
      return newTiles
    })
    setTileBuffsDebuffs(prev => {
      const newBuffs = { ...prev }
      delete newBuffs[coord]
      return newBuffs
    })
  }

  const handleShuffle = () => {
    const allCoords: string[] = []
    for (let row = 0; row < gridRows; row++) {
      for (let col = 0; col < gridColumns; col++) {
        allCoords.push(getCoordinate(col, row))
      }
    }

    const totalCells = gridRows * gridColumns
    const shuffledTiles = [...allTiles].sort(() => Math.random() - 0.5)
    
    const tilePool: BingoTile[] = []
    while (tilePool.length < totalCells) {
      tilePool.push(...shuffledTiles)
    }
    
    tilePool.sort(() => Math.random() - 0.5)
    
    const newPlacedTiles: Record<string, string> = {}
    
    allCoords.forEach((coord, index) => {
      if (index < tilePool.length) {
        newPlacedTiles[coord] = tilePool[index].id
      }
    })

    setPlacedTiles(newPlacedTiles)
  }

  const handleClearBoard = () => {
    if (confirm('Clear the entire board?')) {
      setPlacedTiles({})
      setTileBuffsDebuffs({})
    }
  }

  const filteredMembers = allMembers.filter(member => {
    const query = memberSearchQuery.toLowerCase()
    return (
      member.discord_tag.toLowerCase().includes(query) ||
      member.member_code.toString().includes(query)
    )
  })

  const availableMembers = filteredMembers.filter(
    member => !team1Members.includes(member.discord_id) && !team2Members.includes(member.discord_id)
  )

  const toggleMemberTeam = (discordId: string, team: 1 | 2) => {
    if (team === 1) {
      if (team1Members.includes(discordId)) {
        setTeam1Members(team1Members.filter(id => id !== discordId))
      } else {
        setTeam1Members([...team1Members, discordId])
        setTeam2Members(team2Members.filter(id => id !== discordId))
      }
    } else {
      if (team2Members.includes(discordId)) {
        setTeam2Members(team2Members.filter(id => id !== discordId))
      } else {
        setTeam2Members([...team2Members, discordId])
        setTeam1Members(team1Members.filter(id => id !== discordId))
      }
    }
  }

  const createEvent = async () => {
    const eventData = {
      board: {
        name: boardName,
        description: boardDescription,
        grid: {
          columns: gridColumns,
          rows: gridRows
        },
        tiles: Object.entries(placedTiles).reduce((acc, [coord, tileId]) => {
          acc[coord] = {
            tileId,
            assignedTo: null,
            status: 'pending',
            buffDebuffId: tileBuffsDebuffs[coord]
          } as any
          return acc
        }, {} as Record<string, any>)
      },
      teams: [
        {
          name: team1Name,
          members: team1Members
        },
        {
          name: team2Name,
          members: team2Members
        }
      ]
    }

    console.log('Creating event:', eventData)
    // TODO: Send to API endpoint to create the event
    alert('Event creation will be implemented with backend endpoint')
  }

  const handleEditTile = (tile: BingoTile) => {
    setEditingTile({ ...tile })
    setTileEditorOpen(true)
  }

  const handleSaveTile = () => {
    if (!editingTile) return

    const updatedTiles = allTiles.map(t => t.id === editingTile.id ? editingTile : t)
    setAllTiles(updatedTiles)
    
    // Export updated tiles as JSON file for download
    const json = JSON.stringify({ tiles: updatedTiles }, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bingo-tiles.json'
    a.click()
    URL.revokeObjectURL(url)

    setTileEditorOpen(false)
    setEditingTile(null)
  }

  const handleDeleteTile = (tileId: string) => {
    if (!confirm('Are you sure you want to delete this tile?')) return
    
    const updatedTiles = allTiles.filter(t => t.id !== tileId)
    setAllTiles(updatedTiles)
    
    // Export updated tiles as JSON file for download
    const json = JSON.stringify({ tiles: updatedTiles }, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bingo-tiles.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const addBonusTier = () => {
    if (!editingTile) return
    const newTier: BonusTier = {
      threshold: '',
      points: 0,
      requirementValue: 0
    }
    setEditingTile({
      ...editingTile,
      bonusTiers: [...(editingTile.bonusTiers || []), newTier]
    })
  }

  const removeBonusTier = (index: number) => {
    if (!editingTile) return
    const newTiers = editingTile.bonusTiers?.filter((_, i) => i !== index) || []
    setEditingTile({
      ...editingTile,
      bonusTiers: newTiers.length > 0 ? newTiers : undefined
    })
  }

  const updateBonusTier = (index: number, field: keyof BonusTier, value: any) => {
    if (!editingTile || !editingTile.bonusTiers) return
    const newTiers = [...editingTile.bonusTiers]
    newTiers[index] = { ...newTiers[index], [field]: value }
    setEditingTile({
      ...editingTile,
      bonusTiers: newTiers
    })
  }

  const canProceedToTeams = () => {
    return boardName.trim() !== '' && Object.keys(placedTiles).length > 0
  }

  const canCreateEvent = () => {
    return team1Members.length > 0 && team2Members.length > 0
  }

  const openPlayerStats = async (member: AdminMember) => {
    setSelectedPlayer(member)
    setPlayerStatsOpen(true)
    setPlayerStatsLoading(true)
    setPlayerWOMData(null)
    setPlayerGainsData(null)

    try {
      // Get member's primary OSRS account from the profile
      const profile = await membersApi.getPlayerProfile(member.discord_id, member.member_code)
      const primaryAccount = profile.data.osrs_accounts.find(acc => acc.is_primary) || profile.data.osrs_accounts[0]
      
      if (primaryAccount) {
        // Fetch WOM comprehensive data and gains in parallel
        const [womData, gainsData] = await Promise.all([
          womApi.getComprehensiveData(primaryAccount.osrs_nickname),
          womApi.getPlayerGains(primaryAccount.osrs_nickname, 'week')
        ])
        setPlayerWOMData(womData.data)
        setPlayerGainsData(gainsData.data)
      }
    } catch (error) {
      console.error('Failed to load player stats:', error)
    } finally {
      setPlayerStatsLoading(false)
    }
  }

  const loadTeamComparison = async () => {
    if (team1Members.length === 0 && team2Members.length === 0) return
    
    setLoadingComparison(true)
    try {
      const team1Stats = await Promise.all(
        team1Members.map(async (discordId) => {
          const member = allMembers.find(m => m.discord_id === discordId)
          if (!member) return null
          try {
            const profile = await membersApi.getPlayerProfile(discordId, member.member_code)
            const primaryAccount = profile.data.osrs_accounts.find(acc => acc.is_primary) || profile.data.osrs_accounts[0]
            if (!primaryAccount) return null
            const womData = await womApi.getComprehensiveData(primaryAccount.osrs_nickname)
            return { member, womData: womData.data }
          } catch {
            return null
          }
        })
      )

      const team2Stats = await Promise.all(
        team2Members.map(async (discordId) => {
          const member = allMembers.find(m => m.discord_id === discordId)
          if (!member) return null
          try {
            const profile = await membersApi.getPlayerProfile(discordId, member.member_code)
            const primaryAccount = profile.data.osrs_accounts.find(acc => acc.is_primary) || profile.data.osrs_accounts[0]
            if (!primaryAccount) return null
            const womData = await womApi.getComprehensiveData(primaryAccount.osrs_nickname)
            return { member, womData: womData.data }
          } catch {
            return null
          }
        })
      )

      // Calculate aggregated stats
      const team1Valid = team1Stats.filter(Boolean)
      const team2Valid = team2Stats.filter(Boolean)

      const calculateTeamStats = (teamStats: any[]) => {
        const totalExp = teamStats.reduce((sum, p) => sum + (p.womData?.player?.exp || 0), 0)
        const totalEhp = teamStats.reduce((sum, p) => sum + (p.womData?.player?.ehp || 0), 0)
        const totalEhb = teamStats.reduce((sum, p) => sum + (p.womData?.player?.ehb || 0), 0)
        const avgCombat = teamStats.length > 0 
          ? teamStats.reduce((sum, p) => sum + (p.womData?.player?.combatLevel || 0), 0) / teamStats.length 
          : 0

        return { totalExp, totalEhp, totalEhb, avgCombat, playerCount: teamStats.length }
      }

      setTeamComparisonData({
        team1: calculateTeamStats(team1Valid),
        team2: calculateTeamStats(team2Valid)
      })
    } catch (error) {
      console.error('Failed to load team comparison:', error)
    } finally {
      setLoadingComparison(false)
    }
  }

  useEffect(() => {
    if (currentStep === 'teams' && (team1Members.length > 0 || team2Members.length > 0)) {
      loadTeamComparison()
    }
  }, [team1Members, team2Members, currentStep])


  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-64 border-r border-border/40 flex flex-col bg-card/30 overflow-y-auto">
        <div className="p-4 border-b border-border/40 flex-shrink-0">
          <h2 className="text-lg font-bold">Event Creator</h2>
          <p className="text-xs text-muted-foreground">Battleship Bingo</p>
        </div>

        {/* Wizard Steps */}
        <div className="p-4 border-b border-border/40 flex-shrink-0 space-y-2">
          <div 
            className={cn(
              "p-2 rounded border transition-colors",
              currentStep === 'board' 
                ? "border-primary bg-primary/10 text-primary" 
                : "border-border/40 text-muted-foreground"
            )}
          >
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                currentStep === 'board' ? "bg-primary text-primary-foreground" : "bg-muted"
              )}>
                1
              </div>
              <span className="text-sm font-medium">Create Board</span>
            </div>
          </div>
          <div 
            className={cn(
              "p-2 rounded border transition-colors",
              currentStep === 'teams' 
                ? "border-primary bg-primary/10 text-primary" 
                : "border-border/40 text-muted-foreground"
            )}
          >
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                currentStep === 'teams' ? "bg-primary text-primary-foreground" : "bg-muted"
              )}>
                2
              </div>
              <span className="text-sm font-medium">Assemble Teams</span>
            </div>
          </div>
        </div>
        
        {currentStep === 'board' && (
          <>
            <div className="p-4 flex-1 overflow-y-auto space-y-4 border-b border-border/40">
            <div>
              <h3 className="font-semibold text-sm mb-3">Board Settings</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium mb-1 block">Board Name</label>
                  <Input
                    value={boardName}
                    onChange={(e) => setBoardName(e.target.value)}
                    placeholder="Enter board name"
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Description</label>
                  <Input
                    value={boardDescription}
                    onChange={(e) => setBoardDescription(e.target.value)}
                    placeholder="Enter description"
                    className="h-8 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium mb-1 block">Rows</label>
                    <Input
                      type="number"
                      min="5"
                      max="50"
                      value={gridRows}
                      onChange={(e) => setGridRows(parseInt(e.target.value) || 15)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">Columns</label>
                    <Input
                      type="number"
                      min="5"
                      max="50"
                      value={gridColumns}
                      onChange={(e) => setGridColumns(parseInt(e.target.value) || 30)}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
            </div>

            <div className="border-t border-border/40 p-4 space-y-3 flex-1 overflow-y-auto">
            <h3 className="font-semibold text-sm">Buffs & Debuffs</h3>
            <p className="text-xs text-muted-foreground">Drag onto tiles</p>
            
            {/* Buffs Section */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-green-500 flex items-center gap-1">
                <span>✨</span>
                <span>Buffs ({allBuffsDebuffs.filter(e => e.type === 'buff').length})</span>
              </div>
              {allBuffsDebuffs.filter(e => e.type === 'buff').map(effect => (
                <div
                  key={effect.id}
                  draggable
                  onDragStart={() => setDraggedBuffDebuff(effect.id)}
                  onDragEnd={handleDragEnd}
                  className="p-2 rounded border border-green-500/30 bg-green-500/10 hover:bg-green-500/20 cursor-move text-xs transition-all hover:scale-[1.02] space-y-1"
                  title={effect.description}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">✨</span>
                    <span className="font-medium">{effect.name}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-tight">{effect.description}</p>
                </div>
              ))}
            </div>

            {/* Debuffs Section */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-red-500 flex items-center gap-1">
                <span>💀</span>
                <span>Debuffs ({allBuffsDebuffs.filter(e => e.type === 'debuff').length})</span>
              </div>
              {allBuffsDebuffs.filter(e => e.type === 'debuff').map(effect => (
                <div
                  key={effect.id}
                  draggable
                  onDragStart={() => setDraggedBuffDebuff(effect.id)}
                  onDragEnd={handleDragEnd}
                  className="p-2 rounded border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 cursor-move text-xs transition-all hover:scale-[1.02] space-y-1"
                  title={effect.description}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">💀</span>
                    <span className="font-medium">{effect.name}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-tight">{effect.description}</p>
                </div>
              ))}
              </div>
            </div>
          </>
        )}

        <div className="p-4 border-t border-border/40 space-y-2 flex-shrink-0 mt-auto">
          {currentStep === 'board' && (
            <>
              <Button onClick={handleShuffle} variant="secondary" className="w-full" size="sm">
                🔀 Shuffle Board
              </Button>
              <Button onClick={handleClearBoard} variant="destructive" className="w-full" size="sm">
                🗑️ Clear Board
              </Button>
              <Button 
                onClick={() => setCurrentStep('teams')} 
                variant="default" 
                className="w-full" 
                size="sm"
                disabled={!canProceedToTeams()}
              >
                Next: Create Teams →
              </Button>
            </>
          )}
          {currentStep === 'teams' && (
            <>
              <Button onClick={() => setCurrentStep('board')} variant="outline" className="w-full" size="sm">
                ← Back to Board
              </Button>
              <Button 
                onClick={createEvent} 
                variant="default" 
                className="w-full" 
                size="sm"
                disabled={!canCreateEvent()}
              >
                🎯 Create Event
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Center - Board Preview OR Team Builder */}
      {currentStep === 'board' && (
      <div className="flex-1 flex flex-col overflow-hidden bg-muted/5">
          <div className="p-3 border-b border-border/40 flex-shrink-0 bg-background/50">
            <h2 className="text-base font-semibold">Board Preview</h2>
            <p className="text-xs text-muted-foreground">Drag tiles from the right panel</p>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <div className="inline-block">
              {/* Column Headers */}
              <div className="flex">
                <div className="w-12 h-12 flex-shrink-0" />
                {Array.from({ length: gridColumns }, (_, i) => {
                  const col = String.fromCharCode(65 + (i % 26)) + (i >= 26 ? String.fromCharCode(65 + Math.floor(i / 26) - 1) : '')
                  return (
                    <div key={i} className="w-12 h-12 flex-shrink-0 flex items-center justify-center text-xs font-bold border border-border/40 bg-card">
                      {col}
                    </div>
                  )
                })}
              </div>

              {/* Board Rows */}
              {Array.from({ length: gridRows }, (_, rowIdx) => (
                <div key={rowIdx} className="flex">
                  <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center text-xs font-bold border border-border/40 bg-card">
                    {rowIdx + 1}
                  </div>

                  {Array.from({ length: gridColumns }, (_, colIdx) => {
                    const coord = getCoordinate(colIdx, rowIdx)
                    const tileId = placedTiles[coord]
                    const tile = tileId ? getTileById(tileId) : null
                    const buffDebuffId = tileBuffsDebuffs[coord]
                    const buffDebuff = buffDebuffId ? getBuffDebuffById(buffDebuffId) : null

                    return (
                      <div
                        key={colIdx}
                        className={cn(
                          "w-12 h-12 flex-shrink-0 border border-border/40 relative group cursor-pointer transition-all",
                          tile 
                            ? "bg-card hover:bg-accent/30 hover:border-accent-foreground/40 hover:shadow-lg" 
                            : "bg-muted/20 hover:bg-accent/50 hover:border-accent-foreground/60 hover:scale-105",
                          dragOverCoord === coord && (draggedTile || draggedBuffDebuff) && "!bg-accent !border-accent-foreground !scale-110 !shadow-xl ring-2 ring-accent-foreground/50",
                          buffDebuff && buffDebuff.type === 'buff' && "ring-2 ring-green-500/50 shadow-green-500/20 shadow-lg",
                          buffDebuff && buffDebuff.type === 'debuff' && "ring-2 ring-red-500/50 shadow-red-500/20 shadow-lg"
                        )}
                        onDragOver={(e) => handleDragOver(e, coord)}
                        onDragLeave={handleDragLeave}
                        onDrop={() => handleDrop(coord)}
                        title={tile?.task ? `${tile.task}${buffDebuff ? `\n${buffDebuff.type === 'buff' ? '✨' : '💀'} ${buffDebuff.name}` : ''}` : coord}
                      >
                        {tile && (
                          <>
                            <img
                              src={getOSRSIconUrl(tile.icon)}
                              alt={tile.task}
                              className="w-full h-full object-contain p-1"
                              onError={(e) => {
                                e.currentTarget.src = 'https://oldschool.runescape.wiki/images/Coins_detail.png'
                              }}
                            />
                            {buffDebuff && (
                              <div className={cn(
                                "absolute top-0 left-0 w-4 h-4 rounded-br flex items-center justify-center text-[10px]",
                                buffDebuff.type === 'buff' ? "bg-green-500" : "bg-red-500"
                              )} title={buffDebuff.name}>
                                {buffDebuff.type === 'buff' ? '✨' : '💀'}
                              </div>
                            )}
                            <button
                              onClick={() => handleRemoveTile(coord)}
                              className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-bl"
                            >
                              ×
                            </button>
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Team Builder View */}
      {currentStep === 'teams' && (
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Assemble Teams</h2>
                <p className="text-sm text-muted-foreground">Assign members to the two competing teams</p>
              </div>
              {(team1Members.length > 0 || team2Members.length > 0) && (
                <Button
                  onClick={() => setShowTeamComparison(!showTeamComparison)}
                  variant="outline"
                  size="sm"
                >
                  {showTeamComparison ? '📊 Hide' : '📊 Compare'} Teams
                </Button>
              )}
            </div>

            {/* Team Comparison Card */}
            {showTeamComparison && teamComparisonData && (
              <Card className="border-primary/30 bg-primary/5">
                <CardHeader>
                  <CardTitle>Team Comparison</CardTitle>
                  <CardDescription>Aggregated stats for both teams</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingComparison ? (
                    <div className="space-y-4">
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-40 w-full" />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <div className="text-xs text-muted-foreground">Total Players</div>
                          <div className="flex justify-between text-sm">
                            <span className="text-blue-500 font-bold">{teamComparisonData.team1.playerCount}</span>
                            <span className="text-muted-foreground">vs</span>
                            <span className="text-red-500 font-bold">{teamComparisonData.team2.playerCount}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-xs text-muted-foreground">Total XP</div>
                          <div className="flex justify-between text-sm">
                            <span className="text-blue-500 font-bold">{(teamComparisonData.team1.totalExp / 1000000).toFixed(1)}M</span>
                            <span className="text-muted-foreground">vs</span>
                            <span className="text-red-500 font-bold">{(teamComparisonData.team2.totalExp / 1000000).toFixed(1)}M</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-xs text-muted-foreground">Total EHP</div>
                          <div className="flex justify-between text-sm">
                            <span className="text-blue-500 font-bold">{teamComparisonData.team1.totalEhp.toFixed(0)}</span>
                            <span className="text-muted-foreground">vs</span>
                            <span className="text-red-500 font-bold">{teamComparisonData.team2.totalEhp.toFixed(0)}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-xs text-muted-foreground">Total EHB</div>
                          <div className="flex justify-between text-sm">
                            <span className="text-blue-500 font-bold">{teamComparisonData.team1.totalEhb.toFixed(0)}</span>
                            <span className="text-muted-foreground">vs</span>
                            <span className="text-red-500 font-bold">{teamComparisonData.team2.totalEhb.toFixed(0)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Comparison Charts */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="border-border/40">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm">Experience Comparison</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ResponsiveContainer width="100%" height={200}>
                              <BarChart data={[
                                { name: team1Name, value: teamComparisonData.team1.totalExp / 1000000, fill: '#3b82f6' },
                                { name: team2Name, value: teamComparisonData.team2.totalExp / 1000000, fill: '#ef4444' }
                              ]}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <RechartsTooltip 
                                  contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                                />
                                <Bar dataKey="value" name="Total XP (M)" />
                              </BarChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>

                        <Card className="border-border/40">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm">EHP vs EHB</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ResponsiveContainer width="100%" height={200}>
                              <BarChart data={[
                                { name: 'EHP', team1: teamComparisonData.team1.totalEhp, team2: teamComparisonData.team2.totalEhp },
                                { name: 'EHB', team1: teamComparisonData.team1.totalEhb, team2: teamComparisonData.team2.totalEhb }
                              ]}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <RechartsTooltip 
                                  contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                                />
                                <Legend />
                                <Bar dataKey="team1" name={team1Name} fill="#3b82f6" />
                                <Bar dataKey="team2" name={team2Name} fill="#ef4444" />
                              </BarChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Team 1 */}
              <Card className="border-blue-500/30 bg-blue-500/5">
                <CardHeader>
                  <Input
                    value={team1Name}
                    onChange={(e) => setTeam1Name(e.target.value)}
                    className="text-lg font-bold bg-transparent border-none p-0 h-auto focus-visible:ring-0"
                    placeholder="Team 1 Name"
                  />
                  <CardDescription>{team1Members.length} members</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {team1Members.map(discordId => {
                      const member = allMembers.find(m => m.discord_id === discordId)
                      if (!member) return null
                      return (
                        <div
                          key={member.discord_id}
                          className="flex items-center justify-between p-2 bg-background/50 rounded border border-border/40"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-bold">
                              {member.discord_tag[0]}
                            </div>
                            <div>
                              <div className="text-sm font-medium">{member.discord_tag}</div>
                              <div className="text-xs text-muted-foreground">#{member.member_code}</div>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openPlayerStats(member)}
                              className="h-6 text-xs"
                            >
                              📊 Stats
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleMemberTeam(member.discord_id, 1)}
                              className="h-6 text-xs"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                    {team1Members.length === 0 && (
                      <div className="text-center text-sm text-muted-foreground py-8">
                        No members assigned yet
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Team 2 */}
              <Card className="border-red-500/30 bg-red-500/5">
                <CardHeader>
                  <Input
                    value={team2Name}
                    onChange={(e) => setTeam2Name(e.target.value)}
                    className="text-lg font-bold bg-transparent border-none p-0 h-auto focus-visible:ring-0"
                    placeholder="Team 2 Name"
                  />
                  <CardDescription>{team2Members.length} members</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {team2Members.map(discordId => {
                      const member = allMembers.find(m => m.discord_id === discordId)
                      if (!member) return null
                      return (
                        <div
                          key={member.discord_id}
                          className="flex items-center justify-between p-2 bg-background/50 rounded border border-border/40"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-xs font-bold">
                              {member.discord_tag[0]}
                            </div>
                            <div>
                              <div className="text-sm font-medium">{member.discord_tag}</div>
                              <div className="text-xs text-muted-foreground">#{member.member_code}</div>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openPlayerStats(member)}
                              className="h-6 text-xs"
                            >
                              📊 Stats
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleMemberTeam(member.discord_id, 2)}
                              className="h-6 text-xs"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                    {team2Members.length === 0 && (
                      <div className="text-center text-sm text-muted-foreground py-8">
                        No members assigned yet
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Available Members */}
            <Card>
              <CardHeader>
                <CardTitle>Available Members ({availableMembers.length})</CardTitle>
                <CardDescription>Click a member to add them to a team</CardDescription>
                <Input
                  placeholder="Search members..."
                  value={memberSearchQuery}
                  onChange={(e) => setMemberSearchQuery(e.target.value)}
                  className="mt-2"
                />
              </CardHeader>
              <CardContent>
                {loadingMembers ? (
                  <div className="text-center py-8 text-muted-foreground">Loading members...</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                    {availableMembers.map(member => (
                      <div
                        key={member.discord_id}
                        className="p-3 bg-card/50 rounded border border-border/40 hover:border-accent-foreground/40 transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                            {member.discord_tag[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{member.discord_tag}</div>
                            <div className="text-xs text-muted-foreground">#{member.member_code}</div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleMemberTeam(member.discord_id, 1)}
                              className="flex-1 h-7 text-xs border-blue-500/30 hover:bg-blue-500/10"
                            >
                              → {team1Name}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleMemberTeam(member.discord_id, 2)}
                              className="flex-1 h-7 text-xs border-red-500/30 hover:bg-red-500/10"
                            >
                              → {team2Name}
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openPlayerStats(member)}
                            className="w-full h-6 text-xs"
                          >
                            📊 View Stats
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Right Sidebar - Tile List (only on board step) */}
      {currentStep === 'board' && (
      <div className="w-80 border-l border-border/40 overflow-hidden flex flex-col bg-card/20">
          <div className="p-4 border-b border-border/40 space-y-3 flex-shrink-0">
            <h3 className="font-semibold text-sm">Available Tiles ({filteredTiles.length})</h3>
            <Input
              placeholder="Search tiles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 text-sm"
            />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="pvm">PvM</SelectItem>
                <SelectItem value="skills">Skills</SelectItem>
                <SelectItem value="raids">Raids</SelectItem>
                <SelectItem value="pets">Pets</SelectItem>
                <SelectItem value="quests">Quests</SelectItem>
                <SelectItem value="clues">Clues</SelectItem>
                <SelectItem value="minigames">Minigames</SelectItem>
                <SelectItem value="slayer">Slayer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            <div className="space-y-1">
              {filteredTiles.map(tile => (
                <ContextMenu key={tile.id}>
                  <ContextMenuTrigger asChild>
                    <div
                      draggable
                      onDragStart={(e) => {
                        handleDragStart(tile.id)
                        const dragGhost = document.createElement('div')
                        dragGhost.style.width = '48px'
                        dragGhost.style.height = '48px'
                        dragGhost.style.position = 'absolute'
                        dragGhost.style.top = '-1000px'
                        
                        const img = document.createElement('img')
                        img.src = getOSRSIconUrl(tile.icon)
                        img.style.width = '48px'
                        img.style.height = '48px'
                        img.style.objectFit = 'contain'
                        
                        dragGhost.appendChild(img)
                        document.body.appendChild(dragGhost)
                        
                        e.dataTransfer.setDragImage(dragGhost, 24, 24)
                        e.dataTransfer.effectAllowed = 'copy'
                        
                        setTimeout(() => {
                          document.body.removeChild(dragGhost)
                        }, 0)
                      }}
                      onDragEnd={handleDragEnd}
                      className="flex items-center gap-2 p-2 rounded border border-border/40 bg-card hover:bg-accent hover:border-accent-foreground/20 cursor-move transition-all hover:scale-[1.02] hover:shadow-md"
                    >
                      <img
                        src={getOSRSIconUrl(tile.icon)}
                        alt={tile.task}
                        className="w-8 h-8 object-contain flex-shrink-0"
                        onError={(e) => {
                          e.currentTarget.src = 'https://oldschool.runescape.wiki/images/Coins_detail.png'
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">{tile.task}</div>
                        <div className="text-xs text-muted-foreground">
                          <span className={cn(
                            "px-1 rounded text-[10px]",
                            tile.difficulty === 'easy' && "bg-green-500/20 text-green-500",
                            tile.difficulty === 'medium' && "bg-yellow-500/20 text-yellow-500",
                            tile.difficulty === 'hard' && "bg-orange-500/20 text-orange-500",
                            tile.difficulty === 'extreme' && "bg-red-500/20 text-red-500"
                          )}>
                            {tile.difficulty}
                          </span>
                          {tile.bonusTiers && tile.bonusTiers.length > 0 && (
                            <span className="ml-1 px-1 rounded text-[10px] bg-blue-500/20 text-blue-500">
                              🎯 Tiered
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </ContextMenuTrigger>
                  <ContextMenuContent className="w-48">
                    <ContextMenuItem onClick={() => handleEditTile(tile)}>
                      ✏️ Edit Tile
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem onClick={() => handleDeleteTile(tile.id)} className="text-red-500">
                      🗑️ Delete Tile
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ))}
            </div>
          </div>
      </div>
      )}

      {/* Player Stats Sheet */}
      <Sheet open={playerStatsOpen} onOpenChange={setPlayerStatsOpen}>
        <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
          {selectedPlayer && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-lg font-bold">
                    {selectedPlayer.discord_tag[0]}
                  </div>
                  <div>
                    <div>{selectedPlayer.discord_tag}</div>
                    <SheetDescription className="text-xs">
                      Member #{selectedPlayer.member_code}
                    </SheetDescription>
                  </div>
                </SheetTitle>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {playerStatsLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                  </div>
                ) : playerWOMData ? (
                  <>
                    {/* Player Overview */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">OSRS Player Stats</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <div className="text-muted-foreground text-xs">Username</div>
                            <div className="font-medium">{playerWOMData.player?.displayName || 'N/A'}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground text-xs">Combat Level</div>
                            <div className="font-medium">{playerWOMData.player?.combatLevel || 'N/A'}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground text-xs">Total XP</div>
                            <div className="font-medium">{(playerWOMData.player?.exp || 0).toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground text-xs">Total Level</div>
                            <div className="font-medium">
                              {playerWOMData.latestSnapshot?.data?.skills 
                                ? Object.values(playerWOMData.latestSnapshot.data.skills).reduce((sum: number, skill: any) => sum + (skill.level || 0), 0)
                                : 'N/A'}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground text-xs">EHP</div>
                            <div className="font-medium">{playerWOMData.player?.ehp?.toFixed(1) || '0'}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground text-xs">EHB</div>
                            <div className="font-medium">{playerWOMData.player?.ehb?.toFixed(1) || '0'}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Top Skills */}
                    {playerWOMData.latestSnapshot?.data?.skills && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">Top Skills</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {Object.entries(playerWOMData.latestSnapshot.data.skills)
                              .filter(([key]) => key !== 'overall')
                              .sort(([, a]: any, [, b]: any) => (b.experience || 0) - (a.experience || 0))
                              .slice(0, 5)
                              .map(([skill, data]: [string, any]) => (
                                <div key={skill} className="flex items-center justify-between p-2 bg-muted/20 rounded">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium capitalize">{skill}</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-xs text-muted-foreground">
                                      Level {data.level || 1}
                                    </span>
                                    <span className="text-xs font-mono">
                                      {(data.experience || 0).toLocaleString()} XP
                                    </span>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Boss Kills */}
                    {playerWOMData.latestSnapshot?.data?.bosses && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">Boss Kills</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {Object.entries(playerWOMData.latestSnapshot.data.bosses)
                              .filter(([, data]: any) => (data.kills || 0) > 0)
                              .sort(([, a]: any, [, b]: any) => (b.kills || 0) - (a.kills || 0))
                              .slice(0, 10)
                              .map(([boss, data]: [string, any]) => (
                                <div key={boss} className="flex items-center justify-between p-2 bg-muted/20 rounded">
                                  <span className="text-sm font-medium capitalize">
                                    {boss.replace(/_/g, ' ')}
                                  </span>
                                  <span className="text-sm font-mono">
                                    {(data.kills || 0).toLocaleString()} KC
                                  </span>
                                </div>
                              ))}
                            {Object.values(playerWOMData.latestSnapshot.data.bosses).every((data: any) => (data.kills || 0) === 0) && (
                              <div className="text-center text-sm text-muted-foreground py-4">
                                No boss kills recorded
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Skills Distribution Radar */}
                    {playerWOMData.latestSnapshot?.data?.skills && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">Skills Distribution (Top 6)</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <RadarChart data={
                              Object.entries(playerWOMData.latestSnapshot.data.skills)
                                .filter(([key]) => key !== 'overall')
                                .sort(([, a]: any, [, b]: any) => (b.level || 0) - (a.level || 0))
                                .slice(0, 6)
                                .map(([skill, data]: [string, any]) => ({
                                  skill: skill.charAt(0).toUpperCase() + skill.slice(1),
                                  level: data.level || 1
                                }))
                            }>
                              <PolarGrid stroke="hsl(var(--border))" />
                              <PolarAngleAxis dataKey="skill" tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }} />
                              <PolarRadiusAxis domain={[0, 99]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                              <Radar name="Level" dataKey="level" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.5} />
                            </RadarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    )}

                    {/* Weekly Gains Chart */}
                    {playerGainsData?.data?.skills && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">Weekly XP Gains (Top 5 Skills)</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={250}>
                            <BarChart 
                              data={
                                Object.entries(playerGainsData.data.skills)
                                  .filter(([key]) => key !== 'overall')
                                  .map(([skill, data]: [string, any]) => ({
                                    skill: skill.charAt(0).toUpperCase() + skill.slice(1),
                                    gained: data.gained || 0
                                  }))
                                  .filter((item: any) => item.gained > 0)
                                  .sort((a: any, b: any) => b.gained - a.gained)
                                  .slice(0, 5)
                              }
                              layout="vertical"
                            >
                              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                              <XAxis type="number" tick={{ fontSize: 12 }} />
                              <YAxis dataKey="skill" type="category" width={80} tick={{ fontSize: 12 }} />
                              <RechartsTooltip 
                                contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                                labelStyle={{ color: 'hsl(var(--foreground))' }}
                                formatter={(value: number) => value.toLocaleString() + ' XP'}
                              />
                              <Bar dataKey="gained" fill="hsl(var(--primary))" />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    )}

                    {/* Boss Gains */}
                    {playerGainsData?.data?.bosses && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">Weekly Boss KC Gains</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {Object.entries(playerGainsData.data.bosses)
                              .filter(([, data]: any) => (data.gained || 0) > 0)
                              .sort(([, a]: any, [, b]: any) => (b.gained || 0) - (a.gained || 0))
                              .slice(0, 8)
                              .map(([boss, data]: [string, any]) => (
                                <div key={boss} className="flex items-center justify-between p-2 bg-muted/20 rounded">
                                  <span className="text-sm font-medium capitalize">
                                    {boss.replace(/_/g, ' ')}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-green-500 font-mono">
                                      +{(data.gained || 0)} KC
                                    </span>
                                    <span className="text-xs text-muted-foreground font-mono">
                                      ({(data.end || 0).toLocaleString()} total)
                                    </span>
                                  </div>
                                </div>
                              ))}
                            {Object.values(playerGainsData.data.bosses).every((data: any) => (data.gained || 0) === 0) && (
                              <div className="text-center text-sm text-muted-foreground py-4">
                                No boss KC gained this week
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Recent Achievements */}
                    {playerWOMData.achievements && playerWOMData.achievements.length > 0 && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">Recent Achievements</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {playerWOMData.achievements.slice(0, 5).map((achievement: any, idx: number) => (
                              <div key={idx} className="p-2 bg-muted/20 rounded">
                                <div className="text-sm font-medium">{achievement.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {achievement.metric} • {new Date(achievement.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                ) : (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center text-sm text-muted-foreground py-8">
                        No OSRS account linked or data not available
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          )}
          </SheetContent>
        </Sheet>

        {/* Tile Editor Dialog */}
        <Dialog open={tileEditorOpen} onOpenChange={setTileEditorOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Tile</DialogTitle>
              <DialogDescription>
                Edit tile properties and bonus tiers. Changes will be downloaded as a new JSON file.
              </DialogDescription>
            </DialogHeader>
            
            {editingTile && (
              <div className="space-y-4 py-4">
                {/* ID */}
                <div className="space-y-2">
                  <Label htmlFor="tile-id">Tile ID</Label>
                  <Input
                    id="tile-id"
                    value={editingTile.id}
                    onChange={(e) => setEditingTile({...editingTile, id: e.target.value})}
                    placeholder="e.g., boss_zulrah_25"
                  />
                </div>

                {/* Task */}
                <div className="space-y-2">
                  <Label htmlFor="tile-task">Task Description</Label>
                  <Textarea
                    id="tile-task"
                    value={editingTile.task}
                    onChange={(e) => setEditingTile({...editingTile, task: e.target.value})}
                    placeholder="e.g., Kill Zulrah 25 times"
                    rows={2}
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="tile-category">Category</Label>
                  <Select
                    value={editingTile.category}
                    onValueChange={(value: TileCategory) => setEditingTile({...editingTile, category: value})}
                  >
                    <SelectTrigger id="tile-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pvm">PvM</SelectItem>
                      <SelectItem value="skills">Skills</SelectItem>
                      <SelectItem value="quests">Quests</SelectItem>
                      <SelectItem value="minigames">Minigames</SelectItem>
                      <SelectItem value="clues">Clues</SelectItem>
                      <SelectItem value="raids">Raids</SelectItem>
                      <SelectItem value="pets">Pets</SelectItem>
                      <SelectItem value="collection">Collection</SelectItem>
                      <SelectItem value="slayer">Slayer</SelectItem>
                      <SelectItem value="combat">Combat</SelectItem>
                      <SelectItem value="agility">Agility</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Difficulty */}
                <div className="space-y-2">
                  <Label htmlFor="tile-difficulty">Difficulty</Label>
                  <Select
                    value={editingTile.difficulty}
                    onValueChange={(value: TileDifficulty) => setEditingTile({...editingTile, difficulty: value})}
                  >
                    <SelectTrigger id="tile-difficulty">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                      <SelectItem value="extreme">Extreme</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Icon */}
                <div className="space-y-2">
                  <Label htmlFor="tile-icon">Icon (OSRS Wiki name)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="tile-icon"
                      value={editingTile.icon}
                      onChange={(e) => setEditingTile({...editingTile, icon: e.target.value})}
                      placeholder="e.g., Zulrah"
                      className="flex-1"
                    />
                    <img
                      src={getOSRSIconUrl(editingTile.icon)}
                      alt="Preview"
                      className="w-10 h-10 object-contain border rounded"
                      onError={(e) => {
                        e.currentTarget.src = 'https://oldschool.runescape.wiki/images/Coins_detail.png'
                      }}
                    />
                  </div>
                </div>

                {/* Base Points */}
                <div className="space-y-2">
                  <Label htmlFor="tile-basepoints">Base Points (optional)</Label>
                  <Input
                    id="tile-basepoints"
                    type="number"
                    value={editingTile.basePoints || ''}
                    onChange={(e) => setEditingTile({...editingTile, basePoints: e.target.value ? parseInt(e.target.value) : undefined})}
                    placeholder="100"
                  />
                </div>

                {/* Bonus Tiers */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Bonus Tiers</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addBonusTier}>
                      + Add Tier
                    </Button>
                  </div>
                  {editingTile.bonusTiers && editingTile.bonusTiers.length > 0 && (
                    <div className="space-y-3 p-3 border rounded">
                      {editingTile.bonusTiers.map((tier, index) => (
                        <div key={index} className="space-y-2 p-2 border rounded bg-muted/20">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Tier {index + 1}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeBonusTier(index)}
                              className="h-6 text-xs text-red-500"
                            >
                              Remove
                            </Button>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <Label className="text-xs">Threshold</Label>
                              <Input
                                value={tier.threshold}
                                onChange={(e) => updateBonusTier(index, 'threshold', e.target.value)}
                                placeholder="Under 1:30"
                                className="h-8 text-xs"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Bonus Points</Label>
                              <Input
                                type="number"
                                value={tier.points}
                                onChange={(e) => updateBonusTier(index, 'points', parseInt(e.target.value) || 0)}
                                placeholder="200"
                                className="h-8 text-xs"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Value (seconds/count)</Label>
                              <Input
                                type="number"
                                value={tier.requirementValue || ''}
                                onChange={(e) => updateBonusTier(index, 'requirementValue', parseFloat(e.target.value) || 0)}
                                placeholder="90"
                                className="h-8 text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setTileEditorOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveTile}>
                💾 Save & Download JSON
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }
