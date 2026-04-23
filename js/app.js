import { initThemeToggle } from './components/themeToggle.js';
import { initMobileMenu } from './components/mobileMenu.js';
import { initChessBoard } from './components/chessBoard.js';
import { initLessonBoard } from './components/lessonBoard.js';
import { initRouter } from './components/router.js';
import { initAnimations } from './components/animations.js'; // <-- Import GSAP logic
import { initAuth } from './components/auth.js';

document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initMobileMenu();
    initRouter(); 
    initAuth();
    initChessBoard(); 
    initLessonBoard(); 
    
    // Fire the animations last so the boards are fully rendered before moving!
    initAnimations(); 
});