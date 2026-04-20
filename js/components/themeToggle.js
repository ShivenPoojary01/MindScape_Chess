export function initThemeToggle() {
    const toggleBtn = document.getElementById("theme-toggle");
    const htmlEl = document.documentElement;

    if (!toggleBtn) return;

    toggleBtn.addEventListener("click", () => {
        const currentTheme = htmlEl.getAttribute("data-theme");
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        
        // Premium GSAP fade transition
        gsap.to("body", {
            opacity: 0.8,
            duration: 0.15,
            yoyo: true,
            repeat: 1,
            onComplete: () => {
                htmlEl.setAttribute("data-theme", newTheme);
            }
        });
    });
}