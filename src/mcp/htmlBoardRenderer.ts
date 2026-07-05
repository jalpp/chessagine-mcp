/**
 * @file Self-contained, dependency-free HTML renderers for chess positions and games.
 *
 * These do NOT rely on the MCP Apps/UI resource extension (@modelcontextprotocol/ext-apps)
 * used by registerRenderingTools' registered "ui://" resources. Instead, they produce a
 * complete standalone HTML document (inline CSS, inline vanilla JS, no external requests)
 * that any MCP client or agent can take and render on its own -- e.g. by saving it to a
 * .html file and opening it in a browser, or by rendering it as an HTML artifact/preview
 * in clients that support that.
 */
import { Chess } from "chess.js";

const PIECE_UNICODE: Record<string, string> = {
  wp: "♙", wn: "♘", wb: "♗", wr: "♖", wq: "♕", wk: "♔",
  bp: "♟", bn: "♞", bb: "♝", br: "♜", bq: "♛", bk: "♚",
};

const BASE_STYLE = `
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background: #1e1e1e;
    color: #eee;
    display: flex;
    justify-content: center;
    padding: 24px 12px;
    margin: 0;
  }
  h2 { text-align: center; margin: 0 0 12px; font-size: 1.15rem; }
  .wrap { max-width: 480px; width: 100%; }
  .board {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    grid-template-rows: repeat(8, 1fr);
    width: 100%;
    aspect-ratio: 1 / 1;
    border: 3px solid #3a2a1a;
    border-radius: 4px;
    overflow: hidden;
  }
  .sq {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: min(7vw, 34px);
    line-height: 1;
    user-select: none;
  }
  .sq.light { background: #f0d9b5; }
  .sq.dark { background: #b58863; }
  .meta { font-size: 0.85rem; color: #bbb; word-break: break-all; text-align: center; }
  .meta code { color: #ddd; }
`;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function squaresHtmlFromFen(fen: string): string {
  const chess = new Chess(fen);
  const board = chess.board(); // board[0] = rank 8 ... board[7] = rank 1, files a-h left to right
  let squares = "";
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const piece = board[rank][file];
      const isLight = (rank + file) % 2 === 0;
      const pieceChar = piece ? PIECE_UNICODE[`${piece.color}${piece.type}`] ?? "" : "";
      squares += `<div class="sq ${isLight ? "light" : "dark"}">${pieceChar}</div>`;
    }
  }
  return squares;
}

/**
 * Renders a single chess position (FEN) as a complete, standalone HTML document.
 * Throws if the FEN is invalid -- callers should catch and handle gracefully.
 */
export function renderFenBoardHtml(fen: string): string {
  const chess = new Chess(fen); // throws on invalid FEN
  const turn = chess.turn() === "w" ? "White" : "Black";
  const squares = squaresHtmlFromFen(fen);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Chess Position</title>
<style>${BASE_STYLE}</style>
</head>
<body>
  <div class="wrap">
    <h2>&#9812; Chess Position &#9818;</h2>
    <div class="board">${squares}</div>
    <p class="meta">Turn to move: ${turn}</p>
    <p class="meta">FEN: <code>${escapeHtml(fen)}</code></p>
  </div>
</body>
</html>`;
}

/**
 * Renders a full PGN game as a complete, standalone, interactive HTML document with
 * Start/Prev/Next/End controls and a clickable move list. All positions are pre-rendered
 * server-side; the only client-side JS is a small inline script that toggles which
 * pre-rendered board is visible, so it works with no build step and no external requests.
 * Throws if the PGN is invalid -- callers should catch and handle gracefully.
 */
export function renderPgnViewerHtml(pgn: string): string {
  const chess = new Chess();
  chess.loadPgn(pgn); // throws on invalid PGN

  const headers = chess.header();
  const moves = chess.history({ verbose: true });

  const positions: string[] = [];
  positions.push(moves.length > 0 ? moves[0].before : chess.fen());
  for (const move of moves) {
    positions.push(move.after);
  }

  const boardsHtml = positions
    .map((posFen, i) => {
      const isLast = i === positions.length - 1;
      return `<div class="board-frame" data-idx="${i}" style="display:${isLast ? "grid" : "none"}">${squaresHtmlFromFen(posFen)}</div>`;
    })
    .join("\n");

  const moveListHtml = moves
    .map((move, i) => {
      const moveNumber = Math.floor(i / 2) + 1;
      const prefix = move.color === "w" ? `${moveNumber}. ` : "";
      return `<span class="move" data-idx="${i + 1}">${prefix}${escapeHtml(move.san)}</span>`;
    })
    .join(" ");

  const headerEntries = Object.entries(headers).filter(([, v]) => v !== null && v !== undefined && v !== "?");
  const headerHtml = headerEntries.map(([k, v]) => `${escapeHtml(k)}: ${escapeHtml(String(v))}`).join(" &middot; ");

  const initialIdx = positions.length - 1;

  const script = `
  (function () {
    var total = ${positions.length};
    var current = ${initialIdx};
    var frames = document.querySelectorAll(".board-frame");
    var moveEls = document.querySelectorAll(".move");

    function show(i) {
      current = Math.max(0, Math.min(total - 1, i));
      frames.forEach(function (el) {
        el.style.display = (parseInt(el.getAttribute("data-idx"), 10) === current) ? "grid" : "none";
      });
      moveEls.forEach(function (el) {
        el.classList.toggle("active", parseInt(el.getAttribute("data-idx"), 10) === current);
      });
    }

    document.getElementById("btn-start").addEventListener("click", function () { show(0); });
    document.getElementById("btn-prev").addEventListener("click", function () { show(current - 1); });
    document.getElementById("btn-next").addEventListener("click", function () { show(current + 1); });
    document.getElementById("btn-end").addEventListener("click", function () { show(total - 1); });
    moveEls.forEach(function (el) {
      el.addEventListener("click", function () { show(parseInt(el.getAttribute("data-idx"), 10)); });
    });

    show(current);
  })();
  `;

  const extraStyle = `
  .boards { display: grid; }
  .board-frame {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    grid-template-rows: repeat(8, 1fr);
    width: 100%;
    aspect-ratio: 1 / 1;
    border: 3px solid #3a2a1a;
    border-radius: 4px;
    overflow: hidden;
  }
  .controls { display: flex; gap: 8px; justify-content: center; margin: 12px 0; }
  .controls button {
    background: #333; color: #eee; border: 1px solid #555; border-radius: 4px;
    padding: 6px 10px; cursor: pointer; font-size: 0.9rem;
  }
  .controls button:hover { background: #444; }
  .movelist {
    font-size: 0.9rem; line-height: 1.8; text-align: center;
    max-height: 140px; overflow-y: auto; border-top: 1px solid #444; padding-top: 8px;
  }
  .move { cursor: pointer; padding: 1px 3px; border-radius: 3px; }
  .move:hover { background: #333; }
  .move.active { background: #2f6fed; color: #fff; }
  `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>PGN Game Viewer</title>
<style>${BASE_STYLE}${extraStyle}</style>
</head>
<body>
  <div class="wrap">
    <h2>&#9812; Game Viewer &#9818;</h2>
    ${headerHtml ? `<p class="meta">${headerHtml}</p>` : ""}
    <div class="boards">${boardsHtml}</div>
    <div class="controls">
      <button id="btn-start">&#9198; Start</button>
      <button id="btn-prev">&#9664; Prev</button>
      <button id="btn-next">Next &#9654;</button>
      <button id="btn-end">End &#9197;</button>
    </div>
    <div class="movelist">${moveListHtml}</div>
  </div>
  <script>${script}</script>
</body>
</html>`;
}
