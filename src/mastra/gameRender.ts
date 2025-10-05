export const gameRenderHtml = `

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Caro-Kann Main Line Analysis</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            max-width: 800px;
        }
        .board {
            display: grid;
            grid-template-columns: repeat(8, 60px);
            grid-template-rows: repeat(8, 60px);
            border: 3px solid #333;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            margin: 20px auto;
        }
        .square {
            width: 60px;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
            cursor: default;
        }
        .light {
            background-color: #f0d9b5;
        }
        .dark {
            background-color: #b58863;
        }
        .coords {
            display: flex;
            justify-content: space-around;
            margin-top: 5px;
            font-weight: bold;
            color: #333;
        }
        .rank-coords {
            display: flex;
            flex-direction: column;
            justify-content: space-around;
            margin-right: 5px;
            font-weight: bold;
            color: #333;
        }
        .board-wrapper {
            display: flex;
            justify-content: center;
        }
        h2 {
            text-align: center;
            color: #333;
            margin-top: 0;
        }
        .controls {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin: 20px 0;
        }
        button {
            padding: 10px 20px;
            font-size: 16px;
            cursor: pointer;
            border: none;
            border-radius: 5px;
            background: #667eea;
            color: white;
            transition: background 0.3s;
        }
        button:hover {
            background: #5568d3;
        }
        button:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
        .move-info {
            text-align: center;
            margin: 15px 0;
            font-size: 18px;
            font-weight: bold;
            color: #333;
        }
        .analysis {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 8px;
            margin-top: 15px;
            line-height: 1.6;
        }
        .analysis h3 {
            margin-top: 0;
            color: #667eea;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>♔ Caro-Kann Defense - Main Line ♚</h2>
        
        <div class="board-wrapper">
            <div class="rank-coords">
                <div>8</div>
                <div>7</div>
                <div>6</div>
                <div>5</div>
                <div>4</div>
                <div>3</div>
                <div>2</div>
                <div>1</div>
            </div>
            <div>
                <div class="board" id="chessboard"></div>
                <div class="coords">
                    <div>a</div>
                    <div>b</div>
                    <div>c</div>
                    <div>d</div>
                    <div>e</div>
                    <div>f</div>
                    <div>g</div>
                    <div>h</div>
                </div>
            </div>
        </div>

        <div class="move-info" id="moveInfo">Starting Position</div>

        <div class="controls">
            <button id="prevBtn" onclick="previousMove()">◄ Previous</button>
            <button id="resetBtn" onclick="reset()">Reset</button>
            <button id="nextBtn" onclick="nextMove()">Next ►</button>
        </div>

        <div class="analysis" id="analysis"></div>
    </div>

    <script>
        const pieceSymbols = {
            'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
            'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
        };

        const mainLine = [
            {
                fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
                move: 'Starting Position',
                analysis: 'The Caro-Kann Defense begins here. Black will respond to 1.e4 with 1...c6, a solid and reliable defense.'
            },
            {
                fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
                move: '1. e4',
                analysis: 'White opens with the King\'s Pawn, the most popular first move, controlling the center and freeing the bishop and queen.'
            },
            {
                fen: 'rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
                move: '1...c6',
                analysis: 'The Caro-Kann Defense! Black prepares ...d5 while maintaining a solid pawn structure. This is more solid than the Sicilian but less dynamic.'
            },
            {
                fen: 'rnbqkbnr/pp1ppppp/2p5/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq d3 0 2',
                move: '2. d4',
                analysis: 'White establishes a strong pawn center. This is the most common continuation, building a classical center.'
            },
            {
                fen: 'rnbqkbnr/pp2pppp/2p5/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq d6 0 3',
                move: '2...d5',
                analysis: 'Black challenges the center immediately. Unlike the French Defense, the c8-bishop isn\'t blocked in.'
            },
            {
                fen: 'rnbqkbnr/pp2pppp/2p5/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR b KQkq - 1 3',
                move: '3. Nc3',
                analysis: 'The Classical Variation. White develops and puts pressure on d5. This leads to rich middlegame positions.'
            },
            {
                fen: 'rnbqkbnr/pp2pppp/8/2pp4/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 0 4',
                move: '3...dxe4',
                analysis: 'Black captures the pawn. The main alternative is 3...Nf6, but this text move is the main line.'
            },
            {
                fen: 'rnbqkbnr/pp2pppp/8/2pp4/3PP3/2N5/PPP1NPPP/R1BQKB1R b KQkq - 1 4',
                move: '4. Nxe4',
                analysis: 'White recaptures with the knight, maintaining central presence. Now Black must choose how to develop.'
            },
            {
                fen: 'rn1qkbnr/pp2pppp/8/2pp4/3PP1b1/2N5/PPP1NPPP/R1BQKB1R w KQkq - 2 5',
                move: '4...Bf5',
                analysis: 'The key move! Black develops the problematic light-squared bishop outside the pawn chain before playing ...e6. This is what makes the Caro-Kann so attractive.'
            },
            {
                fen: 'rn1qkbnr/pp2pppp/8/2pp4/3PP1b1/2N2N2/PPP2PPP/R1BQKB1R b KQkq - 3 5',
                move: '5. Ng3',
                analysis: 'White attacks the bishop. 5.Nc5 is the alternative, but Ng3 is the main line, forcing Black\'s bishop to make a decision.'
            },
            {
                fen: 'rn1qkbnr/pp2pppp/8/2p5/3Pp1b1/2N2N2/PPP2PPP/R1BQKB1R w KQkq - 0 6',
                move: '5...Bg6',
                analysis: 'The bishop retreats to g6, where it\'s safe and still active. From here, Black will complete development with ...Nd7, ...e6, and castle.'
            }
        ];

        let currentMove = 0;

        function renderBoard(fen) {
            const board = document.getElementById('chessboard');
            board.innerHTML = '';
            
            const position = fen.split(' ')[0];
            const ranks = position.split('/');
            
            for (let rank = 0; rank < 8; rank++) {
                let file = 0;
                const rankStr = ranks[rank];
                
                for (let char of rankStr) {
                    if (char >= '1' && char <= '8') {
                        const emptySquares = parseInt(char);
                        for (let i = 0; i < emptySquares; i++) {
                            createSquare(rank, file, '');
                            file++;
                        }
                    } else {
                        createSquare(rank, file, pieceSymbols[char] || '');
                        file++;
                    }
                }
            }
        }

        function createSquare(rank, file, piece) {
            const square = document.createElement('div');
            square.className = 'square ' + ((rank + file) % 2 === 0 ? 'light' : 'dark');
            square.textContent = piece;
            document.getElementById('chessboard').appendChild(square);
        }

        function updateDisplay() {
            const position = mainLine[currentMove];
            renderBoard(position.fen);
            document.getElementById('moveInfo').textContent = position.move;
            document.getElementById('analysis').innerHTML = <h3>{position.move}</h3><p>{position.analysis}</p>;
            
            document.getElementById('prevBtn').disabled = currentMove === 0;
            document.getElementById('nextBtn').disabled = currentMove === mainLine.length - 1;
        }

        function nextMove() {
            if (currentMove < mainLine.length - 1) {
                currentMove++;
                updateDisplay();
            }
        }

        function previousMove() {
            if (currentMove > 0) {
                currentMove--;
                updateDisplay();
            }
        }

        function reset() {
            currentMove = 0;
            updateDisplay();
        }

        // Initial render
        updateDisplay();
    </script>
</body>
</html>







`