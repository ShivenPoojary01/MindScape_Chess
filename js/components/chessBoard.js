import { Chessboard, FEN, INPUT_EVENT_TYPE } from "https://cdn.jsdelivr.net/npm/cm-chessboard@8/src/Chessboard.js";
import { Chess } from "https://cdn.jsdelivr.net/npm/chess.js@1.0.0-beta.8/+esm";

export function initChessBoard() {
    const boardContainer = document.getElementById('hero-board');
    const evalFill = document.getElementById('eval-fill'); 
    if (!boardContainer || !evalFill) return;

    const chess = new Chess();
    
    // --- THE BLOB WORKER BYPASS ---
    // This fetches the pure engine from the CDN securely, 
    // bypassing any local file corruption issues!
    const workerCode = `importScripts('https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js');`;
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const engine = new Worker(URL.createObjectURL(blob));
    
    engine.postMessage('uci');
    engine.postMessage('isready');

    // --- The Visual Bar Math ---
    function updateEvalBar(scoreInPawns) {
        let percentage = 50 + (scoreInPawns * 5);
        percentage = Math.max(5, Math.min(95, percentage));
        evalFill.style.height = `${percentage}%`;
    }

    // --- Listen to Stockfish ---
    engine.onmessage = function(event) {
        const line = typeof event.data === 'string' ? event.data : event.data.data; 
        
        // Let's keep the tracker on for a second so you can see it working!
        //console.log("Engine thinking:", line); 
        
        if (line && line.includes('score cp')) {
            const match = line.match(/score cp (-?\d+)/);
            if (match) {
                let score = parseInt(match[1]) / 100; 
                if (chess.turn() === 'b') {
                    score = score * -1; 
                }
                updateEvalBar(score);
            }
        } else if (line && line.includes('score mate')) {
            const match = line.match(/score mate (-?\d+)/);
            if (match) {
                let mateIn = parseInt(match[1]);
                let isWhiteWinning = (chess.turn() === 'w' && mateIn > 0) || (chess.turn() === 'b' && mateIn < 0);
                evalFill.style.height = isWhiteWinning ? '100%' : '0%';
            }
        }
    };

    function evaluatePosition() {
        engine.postMessage(`position fen ${chess.fen()}`);
        engine.postMessage('go depth 12');
    }

    const board = new Chessboard(boardContainer, {
        position: chess.fen(),
        assetsUrl: "./assets/",
        style: { cssClass: "default", showCoordinates: true }
    });

    evaluatePosition();

    board.enableMoveInput((event) => {
        if (event.type === INPUT_EVENT_TYPE.moveInputStarted) {
            return true; 
        }
        
        if (event.type === INPUT_EVENT_TYPE.validateMoveInput) {
            try {
                const result = chess.move({
                    from: event.squareFrom,
                    to: event.squareTo,
                    promotion: 'q' 
                });
                
                if (result) {
                    setTimeout(() => {
                        board.setPosition(chess.fen());
                        evaluatePosition(); 
                    }, 50);
                    return true; 
                }
            } catch (error) {
                return false; 
            }
        }
    });

    return board;
}