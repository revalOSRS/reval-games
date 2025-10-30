# Battleship Bingo Data Format

## Files Structure

- `bingo-tiles.json` - Master list of all available tiles
- `boards/` - Individual board configurations for events

## Tile Format

Each tile in `bingo-tiles.json` has:

```json
{
  "id": "unique-tile-id",
  "task": "Human readable task description",
  "category": "pvm|skills|quests|minigames|clues|diaries|pets|collection|slayer|combat",
  "difficulty": "easy|medium|hard|extreme",
  "icon": "Icon_name_from_wiki"
}
```

## Board Format

Each board in `boards/` has:

```json
{
  "boardId": "unique-board-id",
  "name": "Board Display Name",
  "eventDate": "YYYY-MM-DD",
  "description": "Event description",
  "teams": [
    {
      "id": "team-id",
      "name": "Team Name",
      "color": "#hexcolor",
      "members": ["discord_id_1", "discord_id_2"]
    }
  ],
  "grid": {
    "columns": 30,
    "rows": 15
  },
  "tiles": {
    "A1": {
      "tileId": "reference-to-bingo-tiles",
      "assignedTo": "team-id",
      "status": "pending|in-progress|completed",
      "completedBy": "discord_id",
      "completedAt": "ISO8601-timestamp"
    }
  },
  "rules": {
    "pointsPerTile": 1,
    "bonusForRow": 5,
    "bonusForColumn": 5,
    "timeLimit": "duration",
    "allowDuplicates": false
  }
}
```

## Icon URLs

Icons are pulled from OSRS Wiki using the format:
- Items: `https://oldschool.runescape.wiki/images/{name}_detail.png`
- Skills: `https://oldschool.runescape.wiki/images/{name}_icon.png`
- Bosses: `https://oldschool.runescape.wiki/images/{name}.png`

Alternative: WiseOldMan CDN
- `https://wiseoldman.net/img/items/{item_id}.png`

## Categories

- **pvm**: Boss drops, raid items
- **skills**: 99s, level milestones
- **quests**: Quest rewards, quest cape
- **minigames**: Barbarian Assault, Pest Control, etc.
- **clues**: Clue rewards
- **diaries**: Achievement diary rewards
- **pets**: Boss pets, skilling pets
- **collection**: Collection log items
- **slayer**: Slayer drops and items
- **combat**: Combat achievements

## Difficulty Levels

- **easy**: Common drops, low requirements
- **medium**: Uncommon drops, medium requirements
- **hard**: Rare drops, high requirements
- **extreme**: Very rare drops, max requirements, pets


