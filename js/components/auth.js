import { initDashboard } from './dashboard.js';

export function initAuth() {
    const loginForm = document.getElementById('mock-login-form');
    const logoutBtn = document.getElementById('btn-logout');
    
    // Grab all pages and links so we can control them manually
    const pages = document.querySelectorAll('.page');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Stop the page from reloading
            
            // 1. Remove 'active' class from all pages and nav links
            pages.forEach(p => p.classList.remove('active'));
            navLinks.forEach(l => l.classList.remove('active'));
            
            // 2. Directly force the Dashboard page to become active
            const dashboardPage = document.getElementById('dashboard');
            if (dashboardPage) {
                dashboardPage.classList.add('active');
            }

            // 3. Draw the chart now that the dashboard is visible!
            setTimeout(() => {
                initDashboard();
            }, 100); 
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            // To logout, we just click the standard Home link
            const homeLink = document.querySelector('[data-page="home"]');
            if (homeLink) homeLink.click();
        });
    }
}