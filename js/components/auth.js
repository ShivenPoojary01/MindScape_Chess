import { auth } from '../firebase-init.js';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

export function initAuth() {
    const loginForm = document.getElementById('mock-login-form');
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const errorText = document.getElementById('login-error');
    const submitBtn = document.getElementById('btn-login-submit');
    const logoutBtn = document.getElementById('btn-admin-logout');

    // Navigation Links (For Ghost Mode)
    const adminNavLink = document.querySelector('[data-page="admin-cms"]');
    const loginNavLink = document.querySelector('[data-page="login"]');

    // --- 1. Listen for Login/Logout State Changes (Ghost Mode) ---
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is LOGGED IN: Show Admin, Hide Login
            if (adminNavLink) adminNavLink.style.display = 'block';
            if (loginNavLink) loginNavLink.style.display = 'none';
            console.log("Admin is logged in:", user.email);
        } else {
            // User is LOGGED OUT: Hide Admin, Show Login
            if (adminNavLink) adminNavLink.style.display = 'none';
            if (loginNavLink) loginNavLink.style.display = 'block';
            console.log("No user logged in.");
            
            // Kick them to the home page if they try to stay on the admin page while logged out
            const activePage = document.querySelector('.page.active');
            if (activePage && (activePage.id === 'admin-cms' || activePage.id === 'dashboard')) {
                document.querySelector('[data-page="home"]').click();
            }
        }
    });

    // --- 2. Handle Login Submit ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Stop page refresh
            
            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();
            
            try {
                submitBtn.innerText = "Authenticating...";
                submitBtn.disabled = true;
                errorText.style.display = 'none';

                // Send credentials to Firebase
                await signInWithEmailAndPassword(auth, email, password);
                
                // Success! Clear form and redirect to Admin CMS
                loginForm.reset();
                document.querySelector('[data-page="admin-cms"]').click();

            } catch (error) {
                console.error("Login failed:", error.code);
                errorText.style.display = 'block';
                // Provide user-friendly error messages
                if (error.code === 'auth/invalid-credential') {
                    errorText.innerText = "Incorrect email or password.";
                } else {
                    errorText.innerText = "Login failed. Please try again.";
                }
            } finally {
                submitBtn.innerText = "Secure Login";
                submitBtn.disabled = false;
            }
        });
    }

    // --- 3. Handle Logout ---
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await signOut(auth);
                // The onAuthStateChanged listener above will automatically handle the UI changes and redirect!
            } catch (error) {
                console.error("Error signing out:", error);
            }
        });
    }
}