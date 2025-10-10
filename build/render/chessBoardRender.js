export const viewBoardArtifact = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chess Board FEN Renderer</title>
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
        }
        .board {
            display: grid;
            grid-template-columns: repeat(8, 60px);
            grid-template-rows: repeat(8, 60px);
            border: 3px solid #333;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
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
        .info {
            margin-top: 20px;
            text-align: center;
            color: #333;
        }
        .fen-input {
            width: 100%;
            padding: 10px;
            margin-bottom: 15px;
            border: 2px solid #ddd;
            border-radius: 5px;
            font-family: monospace;
            font-size: 14px;
        }
        h2 {
            text-align: center;
            color: #333;
            margin-top: 0;
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
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>♔ Chess Position Viewer ♚</h2>
        <input type="text" class="fen-input" id="fenInput" placeholder="Enter FEN notation (e.g., rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1)">
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
        <div class="info" id="info"></div>
    </div>

    <script>
        const pieceSymbols = {
            'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
            'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
        };

        function renderBoard(fen) {
            const board = document.getElementById('chessboard');
            const info = document.getElementById('info');
            board.innerHTML = '';
            
            if (!fen || fen.trim() === '') {
                fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
            }

            const parts = fen.split(' ');
            const position = parts[0];
            const turn = parts[1] || 'w';
            const castling = parts[2] || '-';
            const enPassant = parts[3] || '-';
            const halfmove = parts[4] || '0';
            const fullmove = parts[5] || '1';

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

            const turnText = turn === 'w' ? 'White' : 'Black';
            info.innerHTML = \`<strong>Turn:</strong> \${turnText} | <strong>Castling:</strong> \${castling} | <strong>En Passant:</strong> \${enPassant}<br><strong>Halfmove:</strong> \${halfmove} | <strong>Fullmove:</strong> \${fullmove}\`;
        }

        function createSquare(rank, file, piece) {
            const square = document.createElement('div');
            square.className = 'square ' + ((rank + file) % 2 === 0 ? 'light' : 'dark');
            square.textContent = piece;
            document.getElementById('chessboard').appendChild(square);
        }

        const fenInput = document.getElementById('fenInput');
        fenInput.addEventListener('input', (e) => {
            renderBoard(e.target.value);
        });

        // Initial render with starting position
        renderBoard('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
        fenInput.value = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    </script>
</body>
</html>
`;
