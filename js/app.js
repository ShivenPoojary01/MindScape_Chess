import { initThemeToggle } from './components/themeToggle.js';
import { initMobileMenu } from './components/mobileMenu.js';
import { initChessBoard } from './components/chessBoard.js';
import { initLessonBoard, initPGNParser } from './components/lessonBoard.js';
import { initRouter } from './components/router.js';
import { initAnimations } from './components/animations.js'; // <-- Import GSAP logic
import { initAuth } from './components/auth.js';
import { initAdmin } from './components/admin.js';
import { initEvalEngine } from './components/evalEngine.js';


document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initMobileMenu();
    initRouter(); 
    initAuth();
    initChessBoard(); 
    initLessonBoard();
    initPGNParser(); // Wakes up the PGN Engine
    // Fire the animations last so the boards are fully rendered before moving!
    initAnimations(); 
    initAdmin();
    initEvalEngine();
});