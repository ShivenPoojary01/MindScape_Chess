// js/components/evalEngine.js

let engine;
let isEngineReady = false;
let currentTurn = 'w'; 

export function initEvalEngine() {
    const stockfishUrl = "https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.0/stockfish.js";
    console.log("Waking up Stockfish AI...");
    
    fetch(stockfishUrl)
        .then(res => res.text())
        .then(script => {
            const blob = new Blob([script], { type: 'application/javascript' });
            engine = new Worker(URL.createObjectURL(blob));
            
            engine.onmessage = function(event) {
                const line = event.data;
                
                // 1. Catch the Evaluation Score
                if (line.includes("info depth") && line.includes("score cp")) {
                    const match = line.match(/score cp (-?\d+)/);
                    if (match) {
                        let centipawns = parseInt(match[1]);
                        if (currentTurn === 'b') centipawns = centipawns * -1;
                        updateEvalBar(centipawns);
                    }
                } else if (line.includes("score mate")) {
                    const match = line.match(/score mate (-?\d+)/);
                    if (match) {
                        let mateIn = parseInt(match[1]);
                        let score = mateIn > 0 ? 10000 : -10000;
                        if (currentTurn === 'b') score = score * -1;
                        updateEvalBar(score); 
                    }
                }

                // 2. NEW: Catch the Principal Variation (Best Move)
                // We ensure it only updates at a depth > 5 so the AI doesn't flash random bad guesses
                if (line.includes("info depth") && line.includes("pv ")) {
                    const depthMatch = line.match(/depth (\d+)/);
                    if (depthMatch && parseInt(depthMatch[1]) >= 5) {
                        // Extracts the very first move from the pv string (e.g., e2e4)
                        const pvMatch = line.match(/pv\s+([a-h][1-8][a-h][1-8][qrbn]?)/);
                        if (pvMatch) {
                            updateBestMoveUI(pvMatch[1]);
                        }
                    }
                }
            };

            engine.postMessage("uci");
            engine.postMessage("ucinewgame");
            isEngineReady = true;
            console.log("Stockfish AI is online and ready.");
        })
        .catch(err => console.error("Engine failed to load:", err));
}

export function evaluatePosition(fen) {
    if (!isEngineReady || !engine) return;
    currentTurn = fen.split(' ')[1]; 
    
    // Hide the recommendation box instantly when a new move is made
    const recUI = document.getElementById('engine-recommendation');
    if (recUI) recUI.classList.remove('visible');
    
    engine.postMessage("stop");
    engine.postMessage(`position fen ${fen}`);
    engine.postMessage("go depth 12"); // Bumped depth slightly for better move accuracy
}

function updateEvalBar(centipawns) {
    const evalFill = document.getElementById('lesson-eval-fill');
    if (!evalFill) return;

    let cappedScore = Math.max(-500, Math.min(500, centipawns));
    let percentage = 50 + (cappedScore / 10);

    evalFill.style.height = `${percentage}%`;
    evalFill.style.transition = "height 0.5s ease-out";
}

// 3. NEW: Inject the Best Move into the DOM
function updateBestMoveUI(rawMove) {
    const recUI = document.getElementById('engine-recommendation');
    if (!recUI) return;

    // Convert raw "e2e4" to clean "e2 → e4"
    const formattedMove = rawMove.slice(0, 2) + " → " + rawMove.slice(2, 4);
    
    // Check if it's a promotion move (like e7e8q)
    const promotion = rawMove.length === 5 ? ` (Promote to ${rawMove[4].toUpperCase()})` : '';

    recUI.innerHTML = `<span class="ai-icon">⚡</span> <span>Engine Recommends: <strong>${formattedMove}${promotion}</strong></span>`;
    recUI.classList.add('visible');
}