import { Chessboard, FEN } from "https://cdn.jsdelivr.net/npm/cm-chessboard@8/src/Chessboard.js";
import { Chess } from "https://cdn.jsdelivr.net/npm/chess.js@1.0.0-beta.8/+esm";

export function initLessonBoard() {
    const boardContainer = document.getElementById('lesson-board');
    if (!boardContainer) return;

    // --- 1. The Lesson Database ---
    // You can expand this endlessly. Add custom FENs for endgames/tactics!
    const lessonDatabase = {
        openings: {
            title: "The Italian Game",
            tag: "Opening",
            fen: FEN.start,
            steps: [
                { move: null, explanation: "The Italian Game begins with 1. e4 e5 2. Nf3 Nc6 3. Bc4. White controls the center and eyes the vulnerable f7 square. Click 'Next Move' to begin." },
                { move: 'e4', explanation: "<strong>1. e4</strong><br>White stakes a claim in the center and opens diagonals." },
                { move: 'e5', explanation: "<strong>1... e5</strong><br>Black responds symmetrically, fighting for the center." },
                { move: 'Nf3', explanation: "<strong>2. Nf3</strong><br>White develops a knight and attacks e5." },
                { move: 'Nc6', explanation: "<strong>2... Nc6</strong><br>Black defends the pawn. 'Knights before bishops'." },
                { move: 'Bc4', explanation: "<strong>3. Bc4</strong><br>The defining move. The stage is set." }
            ]
        },
        middlegame: {
            title: "The Pin",
            tag: "Middle Game",
            fen: FEN.start, // Replace with a custom FEN later!
            steps: [
                { move: null, explanation: "A pin is a situation where a piece cannot move without exposing a more valuable piece behind it. Let's explore how to exploit this." },
                { move: 'd4', explanation: "Placeholder move for Middle Game lesson." }
            ]
        },
        endgame: {
            title: "King & Pawn vs King",
            tag: "Endgame",
            // Notice this custom FEN! It loads a nearly empty board.
            fen: "8/8/8/8/8/4k3/4P3/4K3 w - - 0 1", 
            steps: [
                { move: null, explanation: "The most fundamental endgame. The key to winning or drawing this position is 'The Opposition'. Notice how the kings are facing each other." },
                { move: 'Kd1', explanation: "White takes the opposition." }
            ]
        },
        tactics: {
            title: "The Royal Fork",
            tag: "Tactics",
            fen: FEN.start, // Replace with a custom FEN later!
            steps: [
                { move: null, explanation: "A fork occurs when a single piece attacks two or more enemy pieces simultaneously. Knights are infamous for this." },
                { move: 'Nf3', explanation: "Placeholder move for Tactics lesson." }
            ]
        }
    };

    let currentCategory = 'openings';
    let currentStep = 0;
    let chess = new Chess(); 
    let board;

    const explanationText = document.getElementById('lesson-explanation');
    const lessonTitle = document.getElementById('lesson-title');
    const lessonTag = document.getElementById('lesson-tag');
    const nextBtn = document.getElementById('btn-next-move');
    const prevBtn = document.getElementById('btn-prev-move');
    const categoryBtns = document.querySelectorAll('.category-btn');

    // --- 2. Load a specific lesson ---
    function loadLesson(categoryKey) {
        currentCategory = categoryKey;
        currentStep = 0;
        const lesson = lessonDatabase[currentCategory];

        // Update Text Headers
        lessonTitle.innerText = lesson.title;
        lessonTag.innerText = lesson.tag;

        // Reset the brain with the specific starting FEN of the lesson
        chess = new Chess(lesson.fen === 'start' ? FEN.start : lesson.fen);

        // If the board exists, destroy it and recreate it (cleanest way to handle custom FENs)
        if (board) board.destroy();
        board = new Chessboard(boardContainer, {
            position: chess.fen(),
            assetsUrl: "./assets/",
            style: { cssClass: "default", showCoordinates: true },
            animationDuration: 300
        });

        updateLessonUI();
    }

    // --- 3. Step logic ---
    function updateLessonUI() {
        const lesson = lessonDatabase[currentCategory];
        explanationText.innerHTML = lesson.steps[currentStep].explanation;
        
        // Rebuild the chess game up to the current step from the starting FEN
        chess = new Chess(lesson.fen === 'start' ? FEN.start : lesson.fen);
        for (let i = 1; i <= currentStep; i++) {
            chess.move(lesson.steps[i].move);
        }
        
        board.setPosition(chess.fen(), true);

        prevBtn.disabled = currentStep === 0;
        if (currentStep === lesson.steps.length - 1) {
            nextBtn.innerText = "Complete";
            nextBtn.disabled = true;
        } else {
            nextBtn.innerText = "Next Move";
            nextBtn.disabled = false;
        }
    }

    // --- 4. Event Listeners ---
    nextBtn.addEventListener('click', () => {
        if (currentStep < lessonDatabase[currentCategory].steps.length - 1) {
            currentStep++;
            updateLessonUI();
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentStep > 0) {
            currentStep--;
            updateLessonUI();
        }
    });

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // UI Toggle
            categoryBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            // Load the new lesson
            loadLesson(e.target.getAttribute('data-category'));
        });
    });
    // --- 4.5 PGN Loader Logic ---
    const pgnInput = document.getElementById('pgn-input');
    const pgnBtn = document.getElementById('btn-load-pgn');
    const pgnError = document.getElementById('pgn-error');

    if (pgnBtn && pgnInput) {
        pgnBtn.addEventListener('click', () => {
            const pgnText = pgnInput.value.trim();
            pgnError.style.display = 'none'; // Hide old errors

            if (!pgnText) {
                pgnError.innerText = "Please paste a PGN first!";
                pgnError.style.display = 'block';
                return;
            }

            // Create a temporary brain to test if the PGN is mathematically valid
            const tempChess = new Chess();
            try {
                tempChess.loadPgn(pgnText);
                
                // Ask chess.js for the detailed "verbose" move data
                const history = tempChess.history({ verbose: true }); 
                
                const customSteps = [{ move: null, explanation: "Custom PGN loaded! Let's analyze the game." }];
                
                history.forEach((moveObj, index) => {
                    const moveNum = Math.floor(index / 2) + 1;
                    const colorPrefix = index % 2 === 0 ? `${moveNum}.` : `${moveNum}...`;
                    const player = index % 2 === 0 ? "White" : "Black";
                    
                    // --- The Smart Commentary Generator ---
                    let feedback = "A solid positional move.";
                    
                    if (moveObj.san.includes('#')) {
                        feedback = `<strong>Checkmate!</strong> ${player} wins the game!`;
                    } else if (moveObj.san.includes('+')) {
                        feedback = `${player} delivers a powerful <strong>Check!</strong>`;
                    } else if (moveObj.flags.includes('c') || moveObj.flags.includes('e')) {
                        feedback = `${player} <strong>captures</strong> an opponent's piece.`;
                    } else if (moveObj.flags.includes('k') || moveObj.flags.includes('q')) {
                        feedback = `${player} <strong>castles</strong>, securing the king and bringing the rook into the game.`;
                    } else if (moveObj.flags.includes('p')) {
                        feedback = `${player} <strong>promotes</strong> their pawn!`;
                    } else if (moveObj.piece === 'p' && moveObj.flags.includes('b')) {
                        feedback = `${player} pushes the pawn two squares to control space.`;
                    } else if (moveObj.piece === 'n' || moveObj.piece === 'b') {
                        feedback = `${player} develops a minor piece into the action.`;
                    } else if (moveObj.piece === 'r' || moveObj.piece === 'q') {
                        feedback = `${player} activates a major piece.`;
                    }

                    customSteps.push({ 
                        move: moveObj.san, 
                        explanation: `<strong>${colorPrefix} ${moveObj.san}</strong><br>${feedback}` 
                    });
                });

                // Inject it temporarily into our database
                lessonDatabase['custom_pgn'] = {
                    title: "Game Analysis",
                    tag: "Custom PGN",
                    fen: FEN.start,
                    steps: customSteps
                };

                // Clear the active pill buttons
                categoryBtns.forEach(b => b.classList.remove('active'));
                
                // Load our newly injected custom lesson!
                loadLesson('custom_pgn');
                
                // Scroll the user back up to the board so they can see it
                document.getElementById('learn').scrollIntoView({ behavior: 'smooth' });
                
                // Clear the input
                pgnInput.value = "";

            } catch (error) {
                // If chess.js crashes reading the PGN, it means the user pasted garbage or an illegal game
                pgnError.innerText = "Invalid PGN format. Make sure it's a standard chess game!";
                pgnError.style.display = 'block';
            }
        });
    }

    // --- 5. Initialize First Lesson ---
    loadLesson('openings');
}