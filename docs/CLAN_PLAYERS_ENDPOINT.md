# Clan Players Endpoint Implementation

## Backend Endpoint Required

Add this endpoint to your WOM routes (e.g., `routes/wom.js`):

```javascript
// Get detailed player snapshots from latest clan snapshot (PUBLIC - for landing page)
router.get('/clan/players', async (req, res) => {
  try {
    // Get the latest clan snapshot
    const latestClanSnapshot = await db.queryOne(`
      SELECT id, snapshot_date, group_name
      FROM clan_statistics_snapshots
      ORDER BY snapshot_date DESC
      LIMIT 1
    `)
    
    if (!latestClanSnapshot) {
      return res.status(404).json({
        status: 'error',
        message: 'No clan snapshots available yet'
      })
    }
    
    // Get all player snapshots for this clan snapshot
    const playerSnapshots = await db.query(`
      SELECT 
        id, player_id, username, display_name, snapshot_date,
        player_type, player_build, country, status, patron,
        total_exp, total_level, combat_level,
        ehp, ehb, ttm, tt200m,
        registered_at, updated_at, last_changed_at
      FROM player_snapshots
      WHERE clan_snapshot_id = $1
      ORDER BY ehp DESC
    `, [latestClanSnapshot.id])
    
    // Get all related data for these players
    const playerIds = playerSnapshots.map(p => p.id)
    
    if (playerIds.length === 0) {
      return res.status(200).json({
        status: 'success',
        data: {
          clanSnapshot: {
            id: latestClanSnapshot.id,
            snapshotDate: latestClanSnapshot.snapshot_date,
            groupName: latestClanSnapshot.group_name
          },
          players: []
        }
      })
    }
    
    // Fetch all skills, bosses, activities, and computed metrics in parallel
    const [skills, bosses, activities, computed] = await Promise.all([
      db.query(`
        SELECT player_snapshot_id, skill, experience, level, rank, ehp
        FROM player_skills_snapshots
        WHERE player_snapshot_id = ANY($1::int[])
        ORDER BY player_snapshot_id, skill
      `, [playerIds]),
      
      db.query(`
        SELECT player_snapshot_id, boss, kills, rank, ehb
        FROM player_bosses_snapshots
        WHERE player_snapshot_id = ANY($1::int[])
        ORDER BY player_snapshot_id, boss
      `, [playerIds]),
      
      db.query(`
        SELECT player_snapshot_id, activity, score, rank
        FROM player_activities_snapshots
        WHERE player_snapshot_id = ANY($1::int[])
        ORDER BY player_snapshot_id, activity
      `, [playerIds]),
      
      db.query(`
        SELECT player_snapshot_id, metric, value, rank
        FROM player_computed_snapshots
        WHERE player_snapshot_id = ANY($1::int[])
        ORDER BY player_snapshot_id, metric
      `, [playerIds])
    ])
    
    // Group related data by player_snapshot_id
    const skillsByPlayer = new Map()
    const bossesByPlayer = new Map()
    const activitiesByPlayer = new Map()
    const computedByPlayer = new Map()
    
    skills.forEach(skill => {
      if (!skillsByPlayer.has(skill.player_snapshot_id)) {
        skillsByPlayer.set(skill.player_snapshot_id, [])
      }
      skillsByPlayer.get(skill.player_snapshot_id).push({
        skill: skill.skill,
        experience: parseInt(skill.experience),
        level: skill.level,
        rank: skill.rank,
        ehp: parseFloat(skill.ehp)
      })
    })
    
    bosses.forEach(boss => {
      if (!bossesByPlayer.has(boss.player_snapshot_id)) {
        bossesByPlayer.set(boss.player_snapshot_id, [])
      }
      bossesByPlayer.get(boss.player_snapshot_id).push({
        boss: boss.boss,
        kills: boss.kills,
        rank: boss.rank,
        ehb: parseFloat(boss.ehb)
      })
    })
    
    activities.forEach(activity => {
      if (!activitiesByPlayer.has(activity.player_snapshot_id)) {
        activitiesByPlayer.set(activity.player_snapshot_id, [])
      }
      activitiesByPlayer.get(activity.player_snapshot_id).push({
        activity: activity.activity,
        score: activity.score,
        rank: activity.rank
      })
    })
    
    computed.forEach(comp => {
      if (!computedByPlayer.has(comp.player_snapshot_id)) {
        computedByPlayer.set(comp.player_snapshot_id, [])
      }
      computedByPlayer.get(comp.player_snapshot_id).push({
        metric: comp.metric,
        value: parseFloat(comp.value),
        rank: comp.rank
      })
    })
    
    // Combine all data for each player
    const players = playerSnapshots.map(player => ({
      id: player.id,
      playerId: player.player_id,
      username: player.username,
      displayName: player.display_name,
      type: player.player_type,
      build: player.player_build,
      country: player.country,
      status: player.status,
      patron: player.patron,
      stats: {
        totalExp: parseInt(player.total_exp),
        totalLevel: player.total_level,
        combatLevel: player.combat_level,
        ehp: parseFloat(player.ehp),
        ehb: parseFloat(player.ehb),
        ttm: parseFloat(player.ttm),
        tt200m: parseFloat(player.tt200m)
      },
      skills: skillsByPlayer.get(player.id) || [],
      bosses: bossesByPlayer.get(player.id) || [],
      activities: activitiesByPlayer.get(player.id) || [],
      computed: computedByPlayer.get(player.id) || [],
      timestamps: {
        registeredAt: player.registered_at,
        updatedAt: player.updated_at,
        lastChangedAt: player.last_changed_at
      }
    }))
    
    res.status(200).json({
      status: 'success',
      data: {
        clanSnapshot: {
          id: latestClanSnapshot.id,
          snapshotDate: latestClanSnapshot.snapshot_date,
          groupName: latestClanSnapshot.group_name
        },
        players,
        count: players.length
      }
    })
    
  } catch (error) {
    console.error('Error fetching clan players:', error)
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to fetch clan players data' 
    })
  }
})
```

## Frontend Implementation

### New API Types & Functions

Added to `src/api/wom.ts`:
- `PlayerSkill` interface
- `PlayerBoss` interface
- `PlayerActivity` interface
- `PlayerComputed` interface
- `ClanPlayer` interface
- `ClanPlayersResponse` interface
- `getClanPlayers()` API function

### Updated Components

#### 1. **MemberCard Component** (`src/components/MemberCard.tsx`)
- **Refactored to use `ClanPlayer` data** instead of `WOMPlayer`
- **Added Badge System** with automatic detection:
  - 👑 **Maxed** - All skills at 99
  - 🎖️ **Grandmaster** - Total level 2277
  - ⚡ **Efficient** - 500+ EHP
  - ⚔️ **Boss Slayer** - 500+ EHB
  - 🔥 **Inferno** - TzKal-Zuk kills
  - 🏛️ **Raider** - Challenge Mode raids completions
- **Front Card** shows:
  - Total Level
  - Combat Level
  - Total XP
  - EHP
- **Back Card** shows:
  - Achievement badges
  - EHB
  - Time to Max
  - Player Type
  - Build (if not 'main')
  - Country

#### 2. **MembersPage** (`src/pages/MembersPage.tsx`)
- Fetches three data sources in parallel:
  1. WOM Group Members (for roles)
  2. Clan Players (comprehensive stats)
  3. Discord Members (for avatars)
- Combines data intelligently using username matching
- Added **Grandmasters** stat to the stats bar
- Enhanced search to include Discord tags

## Badge Logic

Badges are automatically calculated based on player stats:

```typescript
function getPlayerBadges(player: ClanPlayer): Array<{ label: string; color: string; icon: string }>
```

This function checks:
- All skills for maxed status
- Total level for grandmaster
- EHP/EHB thresholds
- Specific boss completions (Zuk, CM raids)

## Data Flow

1. **Frontend requests** `/wom/clan/players`
2. **Backend queries** latest clan snapshot
3. **Backend fetches** all player data with skills, bosses, activities, computed metrics
4. **Backend combines** data into comprehensive player objects
5. **Frontend receives** complete player profiles
6. **Frontend combines** with Discord data for avatars
7. **Cards display** stats and auto-generate badges

## Benefits

✅ **Single API Call** - One request gets all player data  
✅ **Rich Profiles** - Complete skill, boss, and activity data  
✅ **Smart Badges** - Automatic achievement recognition  
✅ **Discord Integration** - Avatars and tags from Discord  
✅ **Performant** - Parallel queries and efficient data mapping  
✅ **Scalable** - Handles any number of clan members  

## Next Steps

1. **Backend**: Implement the `/wom/clan/players` endpoint as shown above
2. **Testing**: Test with actual data from your database
3. **Optimization**: Add caching if needed (e.g., cache for 5-10 minutes)
4. **Enhancement**: Consider adding more badge types based on achievements

