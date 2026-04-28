import { Chessboard, FEN } from "https://cdn.jsdelivr.net/npm/cm-chessboard@8/src/Chessboard.js";
import { Chess } from "https://cdn.jsdelivr.net/npm/chess.js@1.0.0-beta.8/+esm";
import { db } from '../firebase-init.js'; 
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js"; 

export async function initLessonBoard() {
    const boardContainer = document.getElementById('lesson-board');
    if (!boardContainer) return;

    let lessonDatabase = {};
    
    const explanationText = document.getElementById('lesson-explanation');
    const lessonTitle = document.getElementById('lesson-title');
    const lessonTag = document.getElementById('lesson-tag');
    const nextBtn = document.getElementById('btn-next-move');
    const prevBtn = document.getElementById('btn-prev-move');
    const categoryBtns = document.querySelectorAll('.category-btn');

    let currentCategory = ''; 
    let currentStep = 0;
    let chess = new Chess(); 
    let board;

    // --- 1. Fetch from Firebase ---
    async function fetchLessonsFromCloud() {
        try {
            explanationText.innerHTML = "<em>Loading secure database...</em>";
            const querySnapshot = await getDocs(collection(db, "lessons"));
            
            querySnapshot.forEach((doc) => {
                lessonDatabase[doc.id] = doc.data(); 
            });

            console.log("Cloud Database Loaded:", lessonDatabase);
            
            if (Object.keys(lessonDatabase).length > 0) {
                // Initialize the UI with the 'Opening' category tag
                renderLessonSubMenu('Opening'); 
            }

        } catch (error) {
            console.error("Error fetching from Firebase:", error);
            explanationText.innerHTML = "<span style='color:red;'>Error connecting to the database.</span>";
        }
    }

    // --- 2. Load a specific lesson ---
    function loadLesson(categoryKey) {
        if (!lessonDatabase[categoryKey]) return; 

        currentCategory = categoryKey;
        currentStep = 0;
        const lesson = lessonDatabase[currentCategory];

        lessonTitle.innerText = lesson.title;
        lessonTag.innerText = lesson.tag;

        chess = new Chess(lesson.fen === 'start' ? FEN.start : lesson.fen);

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
        
        chess = new Chess(lesson.fen === 'start' ? FEN.start : lesson.fen);
        for (let i = 1; i <= currentStep; i++) {
            if(lesson.steps[i].move) { 
                 chess.move(lesson.steps[i].move);
            }
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

    // --- 3.5 Generate the Sub-Menu ---
    function renderLessonSubMenu(selectedTag) {
        const subMenuContainer = document.getElementById('dynamic-lesson-list');
        if (!subMenuContainer) return;
        
        subMenuContainer.innerHTML = ''; 

        const matchingLessons = Object.entries(lessonDatabase).filter(([id, data]) => data.tag === selectedTag);

        if (matchingLessons.length === 0) {
            subMenuContainer.innerHTML = '<p style="color: #a1a1aa; font-size: 0.9rem;">No lessons added to this category yet.</p>';
            return;
        }

        matchingLessons.forEach(([id, data]) => {
            const btn = document.createElement('button');
            // USE THE NEW CSS CLASS HERE!
            btn.className = 'sub-lesson-btn'; 
            btn.innerText = data.title;
            
            btn.addEventListener('click', () => {
                // Remove the active highlight from all sub-buttons
                document.querySelectorAll('.sub-lesson-btn').forEach(b => b.classList.remove('active-lesson'));
                // Add the active highlight to the one we just clicked
                btn.classList.add('active-lesson');
                
                loadLesson(id);
            });

            subMenuContainer.appendChild(btn);
        });

        if (matchingLessons.length > 0) {
            const firstLessonId = matchingLessons[0][0];
            loadLesson(firstLessonId);
            // Highlight the first button by default
            if(subMenuContainer.firstChild) {
                subMenuContainer.firstChild.classList.add('active-lesson');
            }
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
            categoryBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            const selectedTag = e.target.getAttribute('data-tag');
            renderLessonSubMenu(selectedTag);
        });
    });

    // --- 4.5 PGN Loader Logic ---
    const pgnInput = document.getElementById('pgn-input');
    const pgnBtn = document.getElementById('btn-load-pgn');
    const pgnError = document.getElementById('pgn-error');

    if (pgnBtn && pgnInput) {
        pgnBtn.addEventListener('click', () => {
            const pgnText = pgnInput.value.trim();
            pgnError.style.display = 'none'; 

            if (!pgnText) {
                pgnError.innerText = "Please paste a PGN first!";
                pgnError.style.display = 'block';
                return;
            }

            const tempChess = new Chess();
            try {
                tempChess.loadPgn(pgnText);
                const history = tempChess.history({ verbose: true }); 
                const customSteps = [{ move: null, explanation: "Custom PGN loaded! Let's analyze the game." }];
                
                history.forEach((moveObj, index) => {
                    const moveNum = Math.floor(index / 2) + 1;
                    const colorPrefix = index % 2 === 0 ? `${moveNum}.` : `${moveNum}...`;
                    const player = index % 2 === 0 ? "White" : "Black";
                    
                    let feedback = "A solid positional move.";
                    if (moveObj.san.includes('#')) { feedback = `<strong>Checkmate!</strong> ${player} wins the game!`; }
                    else if (moveObj.san.includes('+')) { feedback = `${player} delivers a powerful <strong>Check!</strong>`; }
                    else if (moveObj.flags.includes('c') || moveObj.flags.includes('e')) { feedback = `${player} <strong>captures</strong> an opponent's piece.`; }
                    else if (moveObj.flags.includes('k') || moveObj.flags.includes('q')) { feedback = `${player} <strong>castles</strong>, securing the king and bringing the rook into the game.`; }
                    else if (moveObj.flags.includes('p')) { feedback = `${player} <strong>promotes</strong> their pawn!`; }
                    else if (moveObj.piece === 'p' && moveObj.flags.includes('b')) { feedback = `${player} pushes the pawn two squares to control space.`; }
                    else if (moveObj.piece === 'n' || moveObj.piece === 'b') { feedback = `${player} develops a minor piece into the action.`; }
                    else if (moveObj.piece === 'r' || moveObj.piece === 'q') { feedback = `${player} activates a major piece.`; }

                    customSteps.push({ 
                        move: moveObj.san, 
                        explanation: `<strong>${colorPrefix} ${moveObj.san}</strong><br>${feedback}` 
                    });
                });

                lessonDatabase['custom_pgn'] = {
                    title: "Game Analysis",
                    tag: "Custom PGN",
                    fen: "start",
                    steps: customSteps
                };

                categoryBtns.forEach(b => b.classList.remove('active'));
                loadLesson('custom_pgn');
                
                const subMenuContainer = document.getElementById('dynamic-lesson-list');
                if (subMenuContainer) subMenuContainer.innerHTML = '';

                document.getElementById('learn').scrollIntoView({ behavior: 'smooth' });
                pgnInput.value = "";

            } catch (error) {
                pgnError.innerText = "Invalid PGN format. Make sure it's a standard chess game!";
                pgnError.style.display = 'block';
            }
        });
    }

    // --- 5. Trigger the Cloud Fetch on Load ---
    fetchLessonsFromCloud();
}