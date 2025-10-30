# Database Schema Documentation
## Battleship Bingo Event System

This document outlines the database schema required for implementing the Battleship Bingo event system.

---

## Overview

The Battleship Bingo game combines elements of Battleship and Bingo. Two teams compete by placing ships on a shared bingo board, completing OSRS tasks to claim tiles, and bombing enemy ship locations. The system requires tracking events, teams, boards, tiles, ships, player progress, and active buffs/debuffs.

---

## Core Tables

### 1. `events`
**Purpose:** Generic event tracking for all game types

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique event identifier |
| `event_type` | VARCHAR(50) | NOT NULL | Type of event (e.g., 'battleship_bingo', 'future_game_type') |
| `name` | VARCHAR(255) | NOT NULL | Event display name |
| `description` | TEXT | | Event description |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'upcoming' | 'upcoming', 'active', 'paused', 'completed', 'cancelled' |
| `start_time` | TIMESTAMP | NOT NULL | Event start date/time |
| `end_time` | TIMESTAMP | NOT NULL | Event end date/time |
| `created_by_discord_id` | VARCHAR(50) | NOT NULL | Discord ID of event creator/admin |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update timestamp |
| `metadata` | JSONB | | Flexible field for event-specific data |

**Indexes:**
- `idx_events_status` on `status`
- `idx_events_event_type` on `event_type`
- `idx_events_start_time` on `start_time`

---

### 2. `battleship_bingo_events`
**Purpose:** Specific data for Battleship Bingo events

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique bingo event identifier |
| `event_id` | UUID | FOREIGN KEY → events(id), UNIQUE, NOT NULL | Reference to parent event |
| `board_config` | JSONB | NOT NULL | Stores the master board configuration (columns, rows, tile assignments) |
| `rules_config` | JSONB | NOT NULL | Stores game rules (points per tile, time limits, etc.) |
| `winning_team_id` | UUID | FOREIGN KEY → teams(id), NULLABLE | ID of the winning team (NULL if not finished) |
| `total_tiles` | INTEGER | NOT NULL | Total number of tiles on the board |
| `completed_tiles` | INTEGER | DEFAULT 0 | Count of all completed tiles |

**Indexes:**
- `idx_bb_events_event_id` on `event_id`
- `idx_bb_events_winning_team` on `winning_team_id`

**Example `board_config` JSON:**
```json
{
  "columns": 30,
  "rows": 15,
  "tiles": {
    "A1": "boss_zulrah_25",
    "A2": "clue_hard_30",
    "B1": "raids_cox_10"
  }
}
```

**Example `rules_config` JSON:**
```json
{
  "pointsPerTile": 100,
  "bonusForShipDestroyed": 500,
  "bonusForFullBoard": 2000,
  "maxShipsPerTeam": 5,
  "minShipSize": 3,
  "maxShipSize": 6,
  "bombsPerDay": 10,
  "requireProof": true,
  "allowTileStealing": false
}
```

---

### 3. `teams`
**Purpose:** Track teams participating in events

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique team identifier |
| `event_id` | UUID | FOREIGN KEY → events(id), NOT NULL | Associated event |
| `name` | VARCHAR(100) | NOT NULL | Team name |
| `color` | VARCHAR(7) | NOT NULL | Hex color code (e.g., '#FF0000') |
| `score` | INTEGER | DEFAULT 0 | Current team score |
| `ships_remaining` | INTEGER | DEFAULT 0 | Number of intact ships |
| `tiles_completed` | INTEGER | DEFAULT 0 | Number of completed tiles |
| `bombs_remaining` | INTEGER | DEFAULT 0 | Available bombs for this period |
| `last_bomb_reset` | TIMESTAMP | | Last time bombs were refilled |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation timestamp |

**Indexes:**
- `idx_teams_event_id` on `event_id`
- `idx_teams_score` on `score` DESC

---

### 4. `team_members`
**Purpose:** Track which players are on which teams

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique membership identifier |
| `team_id` | UUID | FOREIGN KEY → teams(id), NOT NULL | Team reference |
| `discord_id` | VARCHAR(50) | NOT NULL | Player's Discord ID |
| `member_code` | VARCHAR(20) | | Player's member code |
| `role` | VARCHAR(20) | DEFAULT 'member' | 'captain', 'member' |
| `individual_score` | INTEGER | DEFAULT 0 | Personal contribution to team score |
| `tiles_completed` | INTEGER | DEFAULT 0 | Personal tiles completed |
| `joined_at` | TIMESTAMP | DEFAULT NOW() | When player joined team |

**Indexes:**
- `idx_team_members_team_id` on `team_id`
- `idx_team_members_discord_id` on `discord_id`
- `unique_team_member` UNIQUE on (`team_id`, `discord_id`)

---

### 5. `battleship_bingo_ships`
**Purpose:** Track ship placements on the board (game-specific)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique ship identifier |
| `event_id` | UUID | FOREIGN KEY → battleship_bingo_events(id), NOT NULL | Event reference |
| `team_id` | UUID | FOREIGN KEY → teams(id), NOT NULL | Owning team |
| `ship_name` | VARCHAR(100) | | Optional ship name |
| `size` | INTEGER | NOT NULL | Number of tiles this ship occupies |
| `coordinates` | JSONB | NOT NULL | Array of tile coordinates (e.g., ["A1", "A2", "A3"]) |
| `segments_destroyed` | INTEGER | DEFAULT 0 | Number of hit segments |
| `is_sunk` | BOOLEAN | DEFAULT FALSE | Whether ship is completely destroyed |
| `is_hidden` | BOOLEAN | DEFAULT TRUE | Whether ship location is visible to enemy |
| `placed_at` | TIMESTAMP | DEFAULT NOW() | When ship was placed |
| `destroyed_at` | TIMESTAMP | | When ship was fully destroyed |

**Indexes:**
- `idx_bb_ships_event_id` on `event_id`
- `idx_bb_ships_team_id` on `team_id`
- `idx_bb_ships_is_sunk` on `is_sunk`

**Example `coordinates` JSON:**
```json
["A1", "A2", "A3", "A4", "A5"]
```

---

### 6. `battleship_bingo_tiles`
**Purpose:** Track the state of each tile on the board (game-specific)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique tile state identifier |
| `event_id` | UUID | FOREIGN KEY → battleship_bingo_events(id), NOT NULL | Event reference |
| `coordinate` | VARCHAR(10) | NOT NULL | Tile coordinate (e.g., "A1", "B15") |
| `task_id` | VARCHAR(100) | NOT NULL | Reference to task from bingo-tiles.json |
| `status` | VARCHAR(20) | DEFAULT 'unclaimed' | 'unclaimed', 'claimed', 'in_progress', 'pending_review', 'completed', 'bombed' |
| `claimed_by_team_id` | UUID | FOREIGN KEY → teams(id) | Team that claimed this tile |
| `completed_by_discord_id` | VARCHAR(50) | | Final player who completed/submitted the task |
| `contributors` | JSONB | | Array of all contributing players with their contribution details |
| `buff_debuff_id` | VARCHAR(100) | | Optional buff/debuff from buffs-debuffs.json |
| `base_points` | INTEGER | DEFAULT 100 | Base points for completing the tile |
| `bonus_tier_achieved` | VARCHAR(50) | | Which bonus tier was achieved (e.g., "Under 1:30", "1000 KC") |
| `completion_value` | DECIMAL(10,2) | | Actual value achieved (e.g., 87.5 for time in seconds, 1543 for KC) |
| `total_points_awarded` | INTEGER | DEFAULT 0 | Total points given (base + bonus tier + buff/debuff modifiers) |
| `is_ship_segment` | BOOLEAN | DEFAULT FALSE | Whether this tile is part of a ship |
| `ship_id` | UUID | FOREIGN KEY → battleship_bingo_ships(id) | If part of ship, which ship |
| `is_bombed` | BOOLEAN | DEFAULT FALSE | Whether enemy has bombed this tile |
| `bombed_by_team_id` | UUID | FOREIGN KEY → teams(id) | Team that bombed this tile |
| `proof_url` | TEXT | | URL to proof screenshot/video |
| `claimed_at` | TIMESTAMP | | When tile was claimed |
| `completed_at` | TIMESTAMP | | When tile was completed |
| `bombed_at` | TIMESTAMP | | When tile was bombed |
| `metadata` | JSONB | | Additional data (progress tracking, notes, etc.) |

**Indexes:**
- `idx_bb_tiles_event_id` on `event_id`
- `idx_bb_tiles_coordinate` on `event_id`, `coordinate` (UNIQUE)
- `idx_bb_tiles_status` on `status`
- `idx_bb_tiles_claimed_team` on `claimed_by_team_id`
- `idx_bb_tiles_ship_id` on `ship_id`

**Example `contributors` JSON for collaborative tiles:**
```json
[
  {
    "discord_id": "603849391970975744",
    "discord_tag": "enzyax",
    "contribution": "Odium Ward Shard 1",
    "proof_url": "https://...",
    "contributed_at": "2025-01-15T14:30:00Z",
    "contribution_percentage": 33
  },
  {
    "discord_id": "123456789012345678",
    "discord_tag": "player2",
    "contribution": "Odium Ward Shard 2",
    "proof_url": "https://...",
    "contributed_at": "2025-01-15T16:45:00Z",
    "contribution_percentage": 33
  },
  {
    "discord_id": "987654321098765432",
    "discord_tag": "player3",
    "contribution": "Odium Ward Shard 3",
    "proof_url": "https://...",
    "contributed_at": "2025-01-15T18:20:00Z",
    "contribution_percentage": 34
  }
]
```

**Note on `completed_by_discord_id`:** This field represents the player who submitted the final completion/assembled the final item, but the `contributors` field tracks all players who helped achieve it.

**Note on Bonus Tiers:**
- Tile definitions (including `basePoints` and `bonusTiers`) are stored in `bingo-tiles.json`
- When a tile is completed, the backend:
  1. Reads the tile definition from JSON
  2. Evaluates which bonus tier (if any) was achieved based on `completion_value`
  3. Calculates total points: `base_points + bonus_tier_points + buff_modifiers`
  4. Stores `bonus_tier_achieved` and `total_points_awarded` in the database
- This approach keeps tile definitions flexible while preserving achievement history

**Example with Bonus Tier:**
If a player completes "Zulrah Speedrun" in 1:25 (85 seconds):
```json
{
  "task_id": "zulrah_speedrun",
  "base_points": 100,
  "bonus_tier_achieved": "Under 1:30",
  "completion_value": 85.0,
  "total_points_awarded": 300,
  "metadata": {
    "all_tiers_available": [
      {"threshold": "Under 2:30", "points": 50},
      {"threshold": "Under 2:00", "points": 100},
      {"threshold": "Under 1:30", "points": 200}
    ],
    "tier_achieved_index": 2
  }
}
```

---

### 7. `battleship_bingo_tile_progress`
**Purpose:** Track individual player progress on tiles (game-specific)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique progress record |
| `tile_id` | UUID | FOREIGN KEY → battleship_bingo_tiles(id), NOT NULL | Tile being worked on |
| `discord_id` | VARCHAR(50) | NOT NULL | Player making progress |
| `progress_amount` | INTEGER | DEFAULT 0 | Amount completed (e.g., 15/25 kills, or 1 shard obtained) |
| `progress_percentage` | INTEGER | DEFAULT 0 | 0-100 percentage |
| `contribution_type` | VARCHAR(100) | | Type of contribution (e.g., "shard_1", "kill_count", "item_obtained") |
| `current_best_value` | DECIMAL(10,2) | | Best value achieved so far (for tiered tasks, e.g., fastest time) |
| `proof_url` | TEXT | | URL to proof for this specific contribution |
| `notes` | TEXT | | Optional notes from player |
| `last_updated` | TIMESTAMP | DEFAULT NOW() | Last progress update |

**Indexes:**
- `idx_bb_progress_tile_id` on `tile_id`
- `idx_bb_progress_discord_id` on `discord_id`
- `unique_bb_player_tile_progress` UNIQUE on (`tile_id`, `discord_id`)

---

### 8. `battleship_bingo_active_effects`
**Purpose:** Track active buffs/debuffs on teams or tiles (game-specific)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique buff/debuff instance |
| `event_id` | UUID | FOREIGN KEY → battleship_bingo_events(id), NOT NULL | Event reference |
| `effect_id` | VARCHAR(100) | NOT NULL | Reference to buff/debuff from JSON |
| `type` | VARCHAR(10) | NOT NULL | 'buff' or 'debuff' |
| `applied_to_type` | VARCHAR(20) | NOT NULL | 'team', 'tile', 'player' |
| `applied_to_id` | VARCHAR(100) | NOT NULL | ID of team/tile/player |
| `triggered_by_tile_id` | UUID | FOREIGN KEY → battleship_bingo_tiles(id) | Tile that triggered this |
| `triggered_by_discord_id` | VARCHAR(50) | | Player who triggered this |
| `is_active` | BOOLEAN | DEFAULT TRUE | Whether effect is currently active |
| `expires_at` | TIMESTAMP | | When effect expires (NULL if permanent) |
| `activated_at` | TIMESTAMP | DEFAULT NOW() | When effect started |
| `deactivated_at` | TIMESTAMP | | When effect ended |
| `metadata` | JSONB | | Effect-specific data (e.g., charges remaining) |

**Indexes:**
- `idx_bb_effects_event_id` on `event_id`
- `idx_bb_effects_is_active` on `is_active`
- `idx_bb_effects_applied_to` on `applied_to_type`, `applied_to_id`
- `idx_bb_effects_expires_at` on `expires_at`

---

### 9. `battleship_bingo_bomb_actions`
**Purpose:** Log all bombing attempts (game-specific)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique bomb action |
| `event_id` | UUID | FOREIGN KEY → battleship_bingo_events(id), NOT NULL | Event reference |
| `bombing_team_id` | UUID | FOREIGN KEY → teams(id), NOT NULL | Team that bombed |
| `target_coordinate` | VARCHAR(10) | NOT NULL | Coordinate bombed |
| `bombed_by_discord_id` | VARCHAR(50) | NOT NULL | Player who initiated bomb |
| `result` | VARCHAR(20) | NOT NULL | 'hit', 'miss', 'sunk_ship', 'blocked' |
| `ship_id` | UUID | FOREIGN KEY → battleship_bingo_ships(id) | Ship that was hit (if any) |
| `points_awarded` | INTEGER | DEFAULT 0 | Points earned from bombing |
| `bombed_at` | TIMESTAMP | DEFAULT NOW() | When bomb occurred |
| `metadata` | JSONB | | Additional data (e.g., buff effects applied) |

**Indexes:**
- `idx_bb_bombs_event_id` on `event_id`
- `idx_bb_bombs_team_id` on `bombing_team_id`
- `idx_bb_bombs_result` on `result`
- `idx_bb_bombs_bombed_at` on `bombed_at` DESC

---

### 10. `event_log`
**Purpose:** Audit log for all significant event actions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique log entry |
| `event_id` | UUID | FOREIGN KEY → events(id), NOT NULL | Associated event |
| `action_type` | VARCHAR(50) | NOT NULL | 'tile_claimed', 'tile_completed', 'ship_placed', 'bomb_fired', 'buff_activated', etc. |
| `actor_discord_id` | VARCHAR(50) | | Player who performed action |
| `team_id` | UUID | FOREIGN KEY → teams(id) | Associated team |
| `details` | JSONB | NOT NULL | Action-specific details |
| `created_at` | TIMESTAMP | DEFAULT NOW() | When action occurred |

**Indexes:**
- `idx_event_log_event_id` on `event_id`
- `idx_event_log_action_type` on `action_type`
- `idx_event_log_created_at` on `created_at` DESC

---

## Relationships Diagram

```
events
  ↓ (1:1)
battleship_bingo_events
  ↓ (1:N)
├─ teams
│   ↓ (1:N)
│   team_members
│
├─ battleship_bingo_ships
│   ↓ (1:N)
│   battleship_bingo_tiles (via ship_id)
│
├─ battleship_bingo_tiles
│   ↓ (1:N)
│   ├─ battleship_bingo_tile_progress
│   └─ battleship_bingo_active_effects
│
├─ battleship_bingo_bomb_actions
│
└─ battleship_bingo_active_effects
```

---

## Design Notes

### Why Separate Tables vs. JSON Columns?

**Game-Specific Tables with `battleship_bingo_` Prefix:**

The tables `battleship_bingo_ships`, `battleship_bingo_tiles`, `battleship_bingo_tile_progress`, `battleship_bingo_active_effects`, and `battleship_bingo_bomb_actions` are prefixed to clearly indicate they're specific to this game mode.

**Advantages of Separate Tables:**
- ✅ **Type Safety:** Strong typing with proper constraints
- ✅ **Indexing:** Better query performance with proper indexes
- ✅ **Foreign Keys:** Referential integrity enforced at DB level
- ✅ **Queries:** Easier to write complex queries (JOINs, aggregations)
- ✅ **Scalability:** Better for large datasets (millions of tiles/actions)

**When to Use JSON Columns:**
- Flexible metadata that varies per record
- Infrequently queried nested data
- Configuration objects (e.g., `board_config`, `rules_config`)

**Hybrid Approach Used:**
- Core game entities → Separate prefixed tables
- Configuration & metadata → JSONB columns (`board_config`, `metadata`, `coordinates`)

---

## Key Queries to Support

### 1. Get Current Event Status
```sql
SELECT e.*, bb.*, 
       t.id as team_id, t.name as team_name, t.score,
       COUNT(DISTINCT bt.id) FILTER (WHERE bt.status = 'completed') as tiles_done
FROM events e
JOIN battleship_bingo_events bb ON e.id = bb.event_id
LEFT JOIN teams t ON t.event_id = e.id
LEFT JOIN board_tiles bt ON bt.bb_event_id = bb.id AND bt.claimed_by_team_id = t.id
WHERE e.status = 'active'
GROUP BY e.id, bb.id, t.id;
```

### 2. Get Team Leaderboard
```sql
SELECT t.name, t.score, t.tiles_completed, t.ships_remaining,
       COUNT(tm.id) as member_count
FROM teams t
JOIN team_members tm ON tm.team_id = t.id
WHERE t.event_id = ?
GROUP BY t.id
ORDER BY t.score DESC;
```

### 3. Get Available Tiles for Team
```sql
SELECT t.coordinate, t.task_id, t.buff_debuff_id, t.status,
       t.contributors, t.bonus_tier_achieved, t.completion_value, t.total_points_awarded,
       COUNT(tp.id) as active_contributors,
       SUM(tp.progress_percentage) as total_progress,
       MAX(tp.current_best_value) as best_attempt
FROM battleship_bingo_tiles t
LEFT JOIN battleship_bingo_tile_progress tp ON tp.tile_id = t.id
WHERE t.event_id = ?
  AND t.status IN ('unclaimed', 'claimed', 'in_progress')
  AND (t.claimed_by_team_id IS NULL OR t.claimed_by_team_id = ?)
  AND t.is_bombed = FALSE
GROUP BY t.id
ORDER BY t.coordinate;
```

### 4. Check if Bomb Hit a Ship
```sql
SELECT s.id, s.team_id, s.ship_name, s.size, s.segments_destroyed
FROM battleship_bingo_ships s
WHERE s.event_id = ?
  AND s.coordinates @> ?::jsonb  -- PostgreSQL JSONB contains operator
  AND s.is_sunk = FALSE;
```

### 5. Get Active Buffs/Debuffs
```sql
SELECT e.*, e.effect_id
FROM battleship_bingo_active_effects e
WHERE e.event_id = ?
  AND e.is_active = TRUE
  AND (e.expires_at IS NULL OR e.expires_at > NOW())
  AND e.applied_to_type = 'team'
  AND e.applied_to_id = ?::text;
```

### 6. Get Tile Progress with All Contributors
```sql
SELECT t.coordinate, t.task_id, t.status,
       t.contributors,
       tp.discord_id, tp.contribution_type, tp.progress_amount, 
       tp.progress_percentage, tp.proof_url, tp.last_updated
FROM battleship_bingo_tiles t
LEFT JOIN battleship_bingo_tile_progress tp ON tp.tile_id = t.id
WHERE t.event_id = ?
  AND t.coordinate = ?
ORDER BY tp.last_updated DESC;
```

### 7. Get Player's Individual Contributions Across All Tiles
```sql
SELECT t.coordinate, t.task_id, t.status,
       tp.contribution_type, tp.progress_amount, tp.progress_percentage,
       tp.proof_url, tp.last_updated,
       CASE 
         WHEN t.contributors @> jsonb_build_array(jsonb_build_object('discord_id', ?))
         THEN true 
         ELSE false 
       END as credited_as_contributor
FROM battleship_bingo_tile_progress tp
JOIN battleship_bingo_tiles t ON t.id = tp.tile_id
WHERE t.event_id = ?
  AND tp.discord_id = ?
ORDER BY tp.last_updated DESC;
```

---

## Additional Considerations

### Data Retention
- Keep completed events for historical purposes
- Archive event logs older than 1 year to separate table
- Maintain statistics for each player across all events

### Performance Optimization
- Use database partitioning for `battleship_bingo_tiles` by `event_id`
- Cache active event data in Redis
- Use materialized views for leaderboards

### Security
- Row-level security to prevent teams from seeing enemy ship locations
- API endpoints should validate team ownership before revealing sensitive data
- Encrypt proof URLs or use signed URLs with expiration

---

## Migration Strategy

1. Create `events` and `battleship_bingo_events` tables first
2. Create `teams` and `team_members` tables
3. Create `battleship_bingo_ships` and `battleship_bingo_tiles` tables
4. Create supporting tables (`battleship_bingo_tile_progress`, `battleship_bingo_active_effects`, `battleship_bingo_bomb_actions`, `event_log`)
5. Add foreign key constraints
6. Create indexes
7. Seed with test event data

---

## Tile Completion Workflows

### Collaborative Tile Completion Flow

For tiles that require multiple contributions (e.g., assembling Odium Ward from 3 shards):

1. **Tile Claimed:** Team claims the tile, sets `status = 'claimed'`
2. **Player 1 Contributes:** Inserts into `battleship_bingo_tile_progress` with shard 1
3. **Player 2 Contributes:** Inserts into `battleship_bingo_tile_progress` with shard 2
4. **Player 3 Contributes:** Inserts into `battleship_bingo_tile_progress` with shard 3
5. **Tile Completed:** 
   - Update tile `status = 'completed'`
   - Set `completed_by_discord_id` to the final assembler
   - Populate `contributors` JSONB with all 3 players' details from progress table
   - Calculate `total_points_awarded` (base + buffs)
   - Award points to team
   - Optionally award individual score to all contributors

### Bonus Tier Completion Flow

For tiles with tiered bonuses (e.g., "Zulrah Speedrun - Under 3:00"):

1. **Tile Claimed:** Team claims the tile
2. **Player Attempts:** Updates `current_best_value` in progress table with each attempt
3. **Player Completes:**
   - Backend fetches tile definition from `bingo-tiles.json`
   - Evaluates `completion_value` against all `bonusTiers`
   - Determines highest tier achieved
   - Calculates: `total_points = base_points + bonus_tier_points + buff_modifiers`
4. **Tile Marked Complete:**
   - Sets `bonus_tier_achieved` (e.g., "Under 1:30")
   - Sets `completion_value` (e.g., 85.0 seconds)
   - Sets `total_points_awarded` (e.g., 300)
   - Stores tier details in `metadata` JSONB for audit trail
5. **Points Awarded:** Team score updated with `total_points_awarded`

**Example Backend Logic for Bonus Tier Evaluation:**
```javascript
function calculateTilePoints(tileDefinition, completionValue, activeBuffs) {
  let points = tileDefinition.basePoints || 100
  let tierAchieved = null
  
  // Sort tiers by requirement (descending for times, ascending for counts)
  const sortedTiers = tileDefinition.bonusTiers?.sort((a, b) => 
    a.requirementValue - b.requirementValue
  )
  
  // Find highest tier achieved
  for (const tier of sortedTiers || []) {
    if (completionValue <= tier.requirementValue) { // For time-based
      tierAchieved = tier
      points += tier.points
    }
  }
  
  // Apply buff/debuff modifiers
  points = applyBuffModifiers(points, activeBuffs)
  
  return {
    basePoints: tileDefinition.basePoints,
    bonusTierAchieved: tierAchieved?.threshold,
    totalPoints: points
  }
}
```

### Workflow for Admin Review:
```sql
-- When admin approves a collaborative tile completion:
UPDATE battleship_bingo_tiles
SET status = 'completed',
    completed_by_discord_id = ?,
    completed_at = NOW(),
    contributors = (
      SELECT jsonb_agg(
        jsonb_build_object(
          'discord_id', tp.discord_id,
          'contribution', tp.contribution_type,
          'proof_url', tp.proof_url,
          'contributed_at', tp.last_updated,
          'contribution_percentage', tp.progress_percentage
        )
      )
      FROM battleship_bingo_tile_progress tp
      WHERE tp.tile_id = ?
    )
WHERE id = ?;

-- Award individual scores to all contributors
UPDATE team_members tm
SET individual_score = individual_score + ?,
    tiles_completed = tiles_completed + 1
WHERE tm.discord_id IN (
  SELECT tp.discord_id 
  FROM battleship_bingo_tile_progress tp 
  WHERE tp.tile_id = ?
);
```

### Workflow for Bonus Tier Tile Completion:
```sql
-- When a player completes a tiered tile (e.g., Zulrah speedrun in 85 seconds):

-- 1. Backend evaluates the tier based on tile definition from JSON
-- 2. Calculate total points (base + tier bonus + buffs)
-- 3. Update tile with completion details

UPDATE battleship_bingo_tiles
SET status = 'completed',
    completed_by_discord_id = ?,
    completed_at = NOW(),
    base_points = 100,
    bonus_tier_achieved = 'Under 1:30',
    completion_value = 85.0,
    total_points_awarded = 300,
    metadata = jsonb_set(
      metadata,
      '{bonus_tier_details}',
      '{"tier_index": 2, "all_tiers": [{"threshold": "Under 2:30", "points": 50}, {"threshold": "Under 2:00", "points": 100}, {"threshold": "Under 1:30", "points": 200}]}'::jsonb
    )
WHERE id = ?;

-- 4. Update team score
UPDATE teams
SET score = score + 300,
    tiles_completed = tiles_completed + 1
WHERE id = ?;

-- 5. Award individual score
UPDATE team_members
SET individual_score = individual_score + 300,
    tiles_completed = tiles_completed + 1
WHERE discord_id = ? AND team_id = ?;
```

---

## Design Decisions: Bonus Tier System

### Why Store Tiers in JSON, Not Database?

**Advantages of JSON Storage for Tile Definitions:**
1. **Flexibility:** Easy to add/remove/modify tiles without schema migrations
2. **Versioning:** Can version the JSON file for different events
3. **Readability:** Admins can edit tiles in a simple JSON format
4. **Performance:** Don't need to join across multiple tables for tile info
5. **Portability:** Tile definitions can be shared across environments

**What Goes in Database:**
- **Achievement data:** What tier was actually achieved (`bonus_tier_achieved`, `completion_value`)
- **Points awarded:** Final calculated points (`total_points_awarded`)
- **Audit trail:** Historical record in `metadata` JSONB
- **Player progress:** Current best attempts (`current_best_value` in progress table)

**Calculation Flow:**
```
JSON (Tile Definition) + Database (Completion Value) → Backend Logic → Database (Points & Tier)
```

This hybrid approach provides flexibility in tile design while maintaining complete historical records in the database.

---

## Future Enhancements

- Add `player_achievements` table for unlocking badges/titles
- Add `trade_actions` table if teams can trade tiles
- Add `chat_messages` table for team-specific event chat
- Add `admin_actions` table for admin overrides and manual adjustments
- Consider adding `min_contributors` and `max_contributors` fields to task definitions for tiles requiring collaboration
- Add `tile_definitions_archive` table to store historical tile configs if needed for auditing old events
- Consider adding `personal_best_records` table to track player records across all events (fastest times, highest KC, etc.)

