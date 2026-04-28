import { initDashboard } from './dashboard.js';
import { auth } from '../firebase-init.js'; // Pulling in your new Firebase keys
import { signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

export function initAuth() {
    const loginForm = document.getElementById('mock-login-form');
    const logoutBtn = document.getElementById('btn-logout');
    const errorText = document.getElementById('login-error');
    
    const pages = document.querySelectorAll('.page');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            
            // Get the typed credentials
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const submitBtn = document.getElementById('btn-login-submit');

            try {
                submitBtn.innerText = "Authenticating...";
                submitBtn.disabled = true;
                
                // 🚀 The actual Firebase Login Call!
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                
                console.log("Logged in successfully as:", userCredential.user.email);
                errorText.style.display = 'none';

                // Success! Route to dashboard
                pages.forEach(p => p.classList.remove('active'));
                navLinks.forEach(l => l.classList.remove('active'));
                
                const dashboardPage = document.getElementById('dashboard');
                if (dashboardPage) dashboardPage.classList.add('active');

                setTimeout(() => { initDashboard(); }, 100); 

            } catch (error) {
                // If wrong password or no account exists
                console.error("Login failed:", error.message);
                errorText.innerText = "Invalid Email or Password.";
                errorText.style.display = 'block';
            } finally {
                submitBtn.innerText = "Secure Login";
                submitBtn.disabled = false;
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                // 🚀 Tell Firebase to log us out
                await signOut(auth);
                console.log("Logged out successfully.");
                
                // Route back home
                const homeLink = document.querySelector('[data-page="home"]');
                if (homeLink) homeLink.click();
                
                // Clear the form
                document.getElementById('login-email').value = '';
                document.getElementById('login-password').value = '';
            } catch (error) {
                console.error("Logout error:", error);
            }
        });
    }
}