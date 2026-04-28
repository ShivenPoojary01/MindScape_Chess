import { db } from '../firebase-init.js';
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

export function initAdmin() {
    const adminForm = document.getElementById('lesson-upload-form');
    const statusText = document.getElementById('admin-upload-status');
    const submitBtn = document.getElementById('btn-publish-lesson');

    if (!adminForm) return;

    adminForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // 1. Grab all the raw data from the inputs
        const title = document.getElementById('admin-lesson-title').value;
        const categorySelect = document.getElementById('admin-lesson-category');
        const tag = categorySelect.options[categorySelect.selectedIndex].text; // e.g., "Openings"
        const lessonId = document.getElementById('admin-lesson-id').value.trim();
        const fen = document.getElementById('admin-lesson-fen').value.trim();
        const initialText = document.getElementById('admin-initial-text').value;
        const movesDataRaw = document.getElementById('admin-moves-data').value;

        // 2. Parse the Moves Data
        const steps = [];
        
        // The first step is always the initial board setup (no move, just text)
        steps.push({ move: null, explanation: initialText });

        // Split the big textarea by line, then split each line by the "|" character
        const moveLines = movesDataRaw.split('\n');
        moveLines.forEach(line => {
            if (line.trim() !== '') {
                const parts = line.split('|');
                if (parts.length >= 2) {
                    // We bold the move automatically so the client doesn't have to write HTML!
                    const moveText = parts[0].trim();
                    const explanationText = parts[1].trim();
                    steps.push({
                        move: moveText,
                        explanation: `<strong>${moveText}</strong><br>${explanationText}`
                    });
                }
            }
        });

        // 3. Build the final Database Object
        const newLesson = {
            title: title,
            tag: tag,
            fen: fen,
            steps: steps
        };

        // 4. Send it to Firestore!
        try {
            submitBtn.innerText = "Publishing to Cloud...";
            submitBtn.disabled = true;
            statusText.style.color = "var(--text-primary)";
            statusText.innerText = "Uploading...";

            // This creates (or overwrites) the document with the exact ID they typed
            await setDoc(doc(db, "lessons", lessonId), newLesson);

            statusText.style.color = "#10B981"; // Success green
            statusText.innerText = `✅ Lesson '${title}' successfully published!`;
            
            // Clear the form for the next one
            adminForm.reset();

        } catch (error) {
            console.error("Error publishing lesson:", error);
            statusText.style.color = "#EF4444"; // Error red
            statusText.innerText = "❌ Error publishing lesson. Check console.";
        } finally {
            submitBtn.innerText = "Publish to Cloud Database";
            submitBtn.disabled = false;
        }
    });
}