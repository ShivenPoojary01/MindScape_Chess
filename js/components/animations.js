export function initAnimations() {
    // We want to make sure GSAP is loaded before we try to use it
    if (typeof gsap === 'undefined') {
        console.warn('GSAP is not loaded!');
        return;
    }

    // 1. Animate the Hero Text (Slides up and fades in)
    gsap.from(".hero-content .badge", { duration: 0.8, y: 20, opacity: 0, ease: "power3.out", delay: 0.1 });
    gsap.from(".hero-content h1", { duration: 0.8, y: 30, opacity: 0, ease: "power3.out", delay: 0.2 });
    gsap.from(".hero-content p", { duration: 0.8, y: 20, opacity: 0, ease: "power3.out", delay: 0.4 });
    gsap.from(".hero-buttons", { duration: 0.8, y: 20, opacity: 0, ease: "power3.out", delay: 0.6 });

    // 2. Animate the Hero Board (Floats in from the right)
    gsap.from(".hero-visual", { duration: 1.2, x: 40, opacity: 0, ease: "power3.out", delay: 0.5 });
    
    // 3. Animate the Navbar (Drops down from the top)
    gsap.from(".navbar", { duration: 1, y: -50, opacity: 0, ease: "power2.out" });

    // 4. Animate Testimonials
    gsap.from(".testimonial-card", { duration: 0.8, y: 30, opacity: 0, stagger: 0.2, ease: "power2.out", delay: 0.8 });
}