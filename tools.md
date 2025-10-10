## Available Tools

| Tool | Description |
|------|-------------|
| **Position Analysis** |
| `get-theme-scores` | Analyze positional themes for strategic evaluation |
| `analyze-variation-themes` | Track theme evolution across move sequences |
| `get-theme-progression` | Monitor specific theme development |
| `compare-variations` | Side-by-side variation analysis |
| `find-critical-moments` | Identify key turning points |
| **Engine & Evaluation** |
| `get-stockfish-analysis` | Deep engine position analysis |
| `get-stockfish-move-analysis` | Post-move position evaluation |
| `is-legal-move` | Move validation |
| `boardstate-to-prompt` | Convert positions to text descriptions |
| **Knowledge & Database** |
| `get-chess-knowledgebase` | Access comprehensive chess knowledge |
| `get-lichess-master-games` | Master game database queries |
| `get-lichess-games` | User game statistics |
| `get-chessdb-analysis` | ChessDB position analysis |
| **Visualization** |
| `generate-chess-board-view-artifact-using-html` | Render chess board in HTML |
| `generate-dynamic-gameview-html` | Create interactive game viewer |
| **Puzzle Training** |
| `fetch-chess-puzzle` | Fetch puzzles from Lichess (filter by theme/rating) |
| `get-puzzle-themes` | List all available puzzle themes |
| **Game Analysis** |
| `fetch-lichess-games` | Fetch user's 20 most recent games |
| `fetch-lichess-game` | Fetch specific game by URL or ID |
| `generate-game-review` | Generate detailed game review with themes |
| `parse-pgn-into-fens` | Convert PGN to FEN position list |

## Available Prompts

| Prompt | Description |
|--------|-------------|
| `analyze-position` | Comprehensive positional analysis |

## Puzzle Training Features

ChessAgine MCP now includes access to Lichess's extensive puzzle database with:

- **3+ Million Puzzles**: Tactical problems for all skill levels
- **150+ Themes**: Fork, pin, skewer, mate patterns, endgames, and more
- **Rating Filter**: Find puzzles matching your skill level (500-3000+)
- **Theme Combinations**: Query multiple themes simultaneously
- **Instant Feedback**: Validate solutions with engine analysis

### Popular Puzzle Themes
- **Tactical Motifs**: fork, pin, skewer, discoveredAttack, deflection
- **Checkmate Patterns**: mateIn1, mateIn2, mateIn3, backRankMate, smotheredMate
- **Endgame Skills**: pawnEndgame, rookEndgame, queenEndgame, promotion
- **Strategic Elements**: zugzwang, clearance, interference, attraction

## Game Review System

The new game review system provides comprehensive analysis:

- **Theme Progression**: Track material, mobility, space, positional play, and king safety
- **Critical Moments**: Automatically identify turning points in the game
- **Visual Analytics**: Generate charts and graphs of theme evolution
- **Format Options**: JSON data or human-readable text reports
- **Configurable Threshold**: Adjust sensitivity for detecting critical moments

## API Integration

The server integrates with several chess APIs:
- **Lichess Explorer API**: Opening statistics and master games
- **Lichess Puzzle API**: Tactical puzzle database with 3M+ positions
- **Lichess Game API**: User game history and specific game fetching
- **ChessDB API**: Position analysis and move databases
- **Stockfish API**: Engine evaluation and analysis

## Acknowledgments

- **Stockfish**: The powerful chess engine powering analysis
- **Lichess**: Open-source chess platform providing game data and puzzles
- **ChessDB**: Comprehensive chess position database
- **Anthropic**: Model Context Protocol specification and tools