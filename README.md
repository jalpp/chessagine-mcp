# ChessAgine MCP

<p align="center">
  <img src="/icon.png" alt="ChessAgine" width="200"/>
</p>

A comprehensive Model Context Protocol (MCP) server that provides advanced chess analysis capabilities by implementing [Chess Context Protocol Server](https://github.com/jalpp/chessagineweb/tree/main/chessContextProtocol) and integrating Stockfish engine evaluation, positional theme analysis, opening databases, and chess knowledge for enhanced chess understanding and gameplay improvement.

## Preview

<p align="center">
  <img src="/assets/screenshots/claude2.png" alt="ChessAgine"/>
</p>

## Example Analysis:

```
I'll analyze this position using Chessagine mode, providing deeper chess insights with multiple analytical perspectives.## 🏛️ **CHESSAGINE DEEP POSITION ANALYSIS**

**Position**: `rnbqkb1r/pp3pp1/3p1n2/2pPp2p/2P5/6B1/PP2PPPP/RN1QKBNR w KQkq - 0 6`

---

### 📊 **ENGINE VERDICT**
**Stockfish 15**: **+0.43** (slight White advantage)  
**Best Move**: **Bh4** ⚡ *"The bishop retreats with purpose"*  
**ChessDB Consensus**: Confirms Bh4 as optimal (-0.17 from Black's perspective)

---

### 🎯 **SILMAN IMBALANCE ANALYSIS**

**🏗️ Pawn Structure Imbalance** *(Most Critical)*
- **White**: Perfect pawn skeleton - no weaknesses (0% weakness score)
- **Black**: One backward pawn creating long-term burden (13% weakness score)  
- **Assessment**: *Significant structural advantage to White*

**⚡ Space & Initiative Dynamics**
- **Black**: Superior space control (16 vs 10 points) + better mobility (23 vs 15 squares)
- **White**: Advanced d5 pawn stake creates central presence
- **Assessment**: *Black has tactical compensation for structural deficit*

**👑 King Safety Status**
- Both kings: VERY SAFE (uncastled but secure)
- Critical timing: Both sides must castle soon

---

### 🔬 **DEEP TACTICAL ASSESSMENT**

**The Bh4 Paradox**: *Why retreat when Black has more space?*

1. **Knight Pressure**: Forces Black's well-placed Nf6 to make a critical decision
2. **Pin Preparation**: After potential ...g6, the bishop maintains dangerous diagonal control  
3. **Development Harmony**: Keeps all White pieces coordinated for optimal casting preparation

**Alternative Moves Analysis**:
- **h3**: (-0.43) Weakening, allows Black to consolidate  
- **Nf3**: (-1.17) Blocks the f-pawn, reduces White's central flexibility
- **Nc3/e3**: (-3.28/-3.31) Premature development, ignores tactical demands

---

### 🎲 **PRACTICAL EVALUATION**

**Master Database Reality Check**: 
- *No master games found* - This indicates a rare/unorthodox position
- Black's early ...h5 creates unexplored territory
- **Practical Implication**: Both sides are "on their own" theoretically

**Critical Moment Identification**:
This position represents a **tactical crossroads** where:
- Black's space advantage could become overwhelming if consolidated
- White's structural superiority needs immediate activation
- The next 3-4 moves will determine the middlegame character

---

### 🚀 **STRATEGIC ROADMAP**

**For White (Recommended Path)**:
1. **Bh4** - Force Black's hand immediately
2. Follow with quick development (Nc3, e3, castle)
3. Later target the backward pawn weakness
4. Convert structural advantage in the endgame

**Black's Counter-Strategy**:
- Must maximize piece activity before White consolidates
- Consider ...g6 or ...Be7 to address the bishop pressure
- Use superior mobility to create immediate threats

---

### 🎭 **POSITIONAL PERSONALITY**

This position has the **soul of a Benoni** - Black trading pawn structure for piece activity, but arising from Queen's Gambit roots. The early ...h5 gives it an almost *"Anti-London"* character where Black embraces sharp imbalances from the opening.

**Bottom Line**: White should prefer this position despite the space deficit. The structural advantage combined with the immediate tactical shot Bh4 gives White excellent practical chances. Black must prove the compensation quickly or face a grinding positional disadvantage.

*"In chess, the threat is often stronger than the execution - but here, execution via Bh4 IS the threat."* ⚔️
```

## Features

### 🔧 Core Analysis Tools
- **Stockfish Integration**: Deep engine analysis with configurable search depth
- **Theme Analysis**: Evaluate material, mobility, space, positional factors, and king safety
- **Variation Analysis**: Compare multiple lines and track positional changes
- **Move Validation**: Check move legality and generate board state descriptions

### 📊 Database Integration  
- **Lichess Master Games**: Access master-level opening statistics and games
- **Lichess User Games**: Analyze how positions are played across skill levels
- **ChessDB**: Query extensive game databases for move evaluations and statistics

### 🧠 Knowledge Base
- **Chess Principles**: Silman's imbalances and Fine's 30 principles
- **Endgame Theory**: Essential endgame knowledge and patterns
- **Strategic Concepts**: Comprehensive chess improvement guidelines

### 💬 AI Prompts
- **Position Analysis**: Generate detailed positional analysis using ChessAgine system prompt


## Installation

### Option 1: Using MCPB File (Recommended)

Download the `chessagine-mcp.mcpb` file and install it directly in Claude Desktop:

1. Download the latest release from [GitHub releases](https://github.com/jalpp/chessagine-mcp/releases)
2. Open Claude Desktop
3. Go to Settings → Extentions → Install from file
4. Select the `chessagine-mcp.mcpb` file
5. Restart Claude Desktop

### Option 2: Local Development Setup

#### Prerequisites
- Node.js 20+ 
- npm or yarn package manager

#### Clone and Setup
```bash
git clone https://github.com/jalpp/chessagine-mcp.git
cd chessagine-mcp
npm install
npm run build
```

#### Configure Claude Desktop
Add to your `claude_desktop_config.json`:

**macOS/Linux:**
```json
{
  "mcpServers": {
    "chessagine-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/chessagine-mcp/build/mastra/stdio.js"]
    }
  }
}
```

**Windows:**
```json
{
  "mcpServers": {
    "chessagine-mcp": {
      "command": "node", 
      "args": ["C:\\absolute\\path\\to\\chessagine-mcp\\build\\mastra\\stdio.js"]
    }
  }
}
```

## Usage Examples

### Basic Position Analysis
```
Analyze this position: rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1
```

### Opening Exploration
```
What are the master games for the Sicilian Defense after 1.e4 c5 2.Nf3 d6?
```

### Engine Analysis
```
Run Stockfish analysis on this position at depth 15: r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 4 5
```

### Variation Comparison
```
Compare these variations from the starting position:
1. e4 e5 2.Nf3 Nc6 3.Bb5
2. e4 e5 2.Nf3 Nc6 3.Bc4
3. e4 e5 2.Nf3 Nc6 3.d4
```

### Theme Analysis
```
Analyze how the king safety theme changes in this line: 1.e4 e5 2.f4 exf4 3.Bc4 Qh4+ 4.Kf1
```

## Available Tools

| Tool | Description |
|------|-------------|
| `get-theme-scores` | Analyze positional themes for strategic evaluation |
| `analyze-variation-themes` | Track theme evolution across move sequences |
| `get-theme-progression` | Monitor specific theme development |
| `compare-variations` | Side-by-side variation analysis |
| `find-critical-moments` | Identify key turning points |
| `get-stockfish-analysis` | Deep engine position analysis |
| `get-stockfish-move-analysis` | Post-move position evaluation |
| `is-legal-move` | Move validation |
| `boardstate-to-prompt` | Convert positions to text descriptions |
| `get-chess-knowledgebase` | Access comprehensive chess knowledge |
| `get-lichess-master-games` | Master game database queries |
| `get-lichess-games` | User game statistics |
| `get-chessdb-analysis` | ChessDB position analysis |

## Available Prompts

| Prompt | Description |
|--------|-------------|
| `analyze-position` | Comprehensive positional analysis |


## API Integration

The server integrates with several chess APIs:
- **Lichess Explorer API**: Opening statistics and master games
- **ChessDB API**: Position analysis and move databases
- **Stockfish API**: Engine evaluation and analysis

## Development

### Building from Source
```bash
npm run build:mcp      # Build the project
npm run dev        # Development mode with watch
npm run clean      # Clean build directory
```


## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

- **Discord**: [Join ChessAgine community](https://discord.gg/N2J2sP9yTm)
- **GitHub Issues**: [Report bugs or request features](https://github.com/jalpp/chessagine-mcp/issues)
- **Documentation**: [Full documentation](https://github.com/jalpp/chessagine-mcp)

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Stockfish**: The powerful chess engine powering analysis
- **Lichess**: Open-source chess platform providing game data
- **ChessDB**: Comprehensive chess position database
- **Anthropic**: Model Context Protocol specification and tools

## Authors:
@jalpp 
