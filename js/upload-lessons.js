import { db } from './firebase-init.js';
import { collection, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// The CORRECTED data matching your original perfect UI
const correctedLessons = {
    'italian_game': {
        title: "The Italian Game",
        tag: "Opening",
        fen: "start",
        steps: [
            { move: null, explanation: "The Italian Game begins with 1. e4 e5 2. Nf3 Nc6 3. Bc4. White controls the center and eyes the vulnerable f7 square. Click 'Next Move' to begin." },
            { move: 'e4', explanation: "<strong>1. e4</strong><br>White stakes a claim in the center and opens diagonals." },
            { move: 'e5', explanation: "<strong>1... e5</strong><br>Black responds symmetrically, fighting for the center." },
            { move: 'Nf3', explanation: "<strong>2. Nf3</strong><br>White develops a knight and attacks e5." },
            { move: 'Nc6', explanation: "<strong>2... Nc6</strong><br>Black defends the pawn. 'Knights before bishops'." },
            { move: 'Bc4', explanation: "<strong>3. Bc4</strong><br>The defining move. The stage is set." }
        ]
    },
    'endgame_king_pawn': {
        title: "King & Pawn vs King",
        tag: "Endgame",
        fen: "8/8/8/8/8/4k3/4P3/4K3 w - - 0 1", 
        steps: [
            { move: null, explanation: "The most fundamental endgame. The key to winning or drawing this position is 'The Opposition'. Notice how the kings are facing each other." },
            { move: 'Kd1', explanation: "White takes the opposition." }
        ]
    }
};

export async function uploadLessonsToCloud() {
    console.log("Fixing database...");
    try {
        const lessonsRef = collection(db, "lessons");
        
        for (const [lessonId, lessonData] of Object.entries(correctedLessons)) {
            // This will overwrite the bad data with the good data
            await setDoc(doc(lessonsRef, lessonId), lessonData);
            console.log(`Fixed: ${lessonId}`);
        }
        
        console.log("✅ Database successfully repaired!");
    } catch (error) {
        console.error("Error fixing Firebase:", error);
    }
}