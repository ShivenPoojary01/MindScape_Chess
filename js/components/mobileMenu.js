export function initMobileMenu() {
    const hamburgerBtn = document.getElementById('mobile-menu-btn');
    const navMenu = document.getElementById('nav-menu');

    if (!hamburgerBtn || !navMenu) return;

    hamburgerBtn.addEventListener('click', () => {
        // Toggles the dropdown menu visibility
        navMenu.classList.toggle('active');
    });
}