// ============================================
// 🔐 MARKAZLASHTIRILGAN AUTHENTICATION TIZIMI
// Oddiy obunachilar va Admin uchun bitta joyda
// ============================================

// ===== AUTH CONSTANTS =====
const AUTH_CONFIG = {
    ADMIN: {
        username: 'admin',
        password: 'admin123'
    },
    STORAGE: {
        user: 'currentUser',
        admin: 'adminLoggedIn',
        userSession: 'userSession'
    }
};

// ===== TAB SWITCHING =====
function switchTab(tabName) {
    // Hide all content
    document.getElementById('userLogin').classList.remove('active');
    document.getElementById('adminLogin').classList.remove('active');
    
    // Remove active from all tabs
    document.querySelectorAll('.login-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected content
    if (tabName === 'user') {
        document.getElementById('userLogin').classList.add('active');
        document.querySelectorAll('.login-tab')[0].classList.add('active');
        document.getElementById('userName').focus();
    } else if (tabName === 'admin') {
        document.getElementById('adminLogin').classList.add('active');
        document.querySelectorAll('.login-tab')[1].classList.add('active');
        document.getElementById('adminUser').focus();
    }
    
    // Clear error/success messages
    clearMessages();
}

// ===== USER LOGIN =====
function userLogin(event) {
    event.preventDefault();
    const errorEl = document.getElementById('userError');
    const successEl = document.getElementById('userSuccess');
    clearMessages();

    // Login via email/password
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        showError(errorEl, 'Iltimos, email va parol kiriting.');
        return;
    }

    try {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const found = users.find(u => u.email === email && u.password === password);
        if (!found) {
            showError(errorEl, 'Email yoki parol noto\'g\'ri.');
            return;
        }

        // Set session
        const userData = { id: found.id, name: found.name || found.email.split('@')[0], email: found.email, type: 'user', loginTime: new Date().toISOString() };
        localStorage.setItem(AUTH_CONFIG.STORAGE.user, JSON.stringify(userData));
        sessionStorage.setItem(AUTH_CONFIG.STORAGE.userSession, 'true');

        successEl.textContent = `✅ Xush kelibsiz, ${userData.name}!`;
        successEl.style.display = 'block';

        setTimeout(() => { window.location.href = 'index.html'; }, 800);
    } catch (e) {
        showError(errorEl, 'Tizim xatosi. Iltimos qayta urinib ko\'ring.');
    }
}

// ===== USER REGISTER =====
function getAllUsers() {
    try { return JSON.parse(localStorage.getItem('users') || '[]'); } catch (e) { return []; }
}

function saveAllUsers(arr) { localStorage.setItem('users', JSON.stringify(arr)); }

function registerUser(event) {
    event.preventDefault();
    const errorEl = document.getElementById('userError');
    const successEl = document.getElementById('userSuccess');
    clearMessages();

    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim().toLowerCase();
    const password = document.getElementById('regPassword').value;
    const password2 = document.getElementById('regPassword2').value;

    if (!email || !password) { showError(errorEl, 'Email va parol talab qilinadi.'); return; }
    if (password.length < 6) { showError(errorEl, 'Parol kamida 6 belgidan iborat bo\'lishi kerak.'); return; }
    if (password !== password2) { showError(errorEl, 'Parollar mos emas.'); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { showError(errorEl, 'Yaroqli email kiriting.'); return; }

    const users = getAllUsers();
    if (users.find(u => u.email === email)) { showError(errorEl, 'Bu email bilan ro\'yxatdan o\'tilgan.'); return; }

    const user = { id: 'user-' + Date.now(), name: name || email.split('@')[0], email, password };
    users.push(user);
    saveAllUsers(users);

    // Auto-login after register
    const userData = { id: user.id, name: user.name, email: user.email, type: 'user', loginTime: new Date().toISOString() };
    localStorage.setItem(AUTH_CONFIG.STORAGE.user, JSON.stringify(userData));
    sessionStorage.setItem(AUTH_CONFIG.STORAGE.userSession, 'true');

    successEl.textContent = '✅ Ro\'yxatdan o\'tish muvaffaqiyatli. Tayyor!';
    successEl.style.display = 'block';
    setTimeout(() => { window.location.href = 'index.html'; }, 900);
}

// ===== ADMIN LOGIN =====
function adminLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('adminUser').value;
    const password = document.getElementById('adminPass').value;
    const errorEl = document.getElementById('adminError');
    const successEl = document.getElementById('adminSuccess');
    
    clearMessages();
    
    // Check credentials
    if (username === AUTH_CONFIG.ADMIN.username && password === AUTH_CONFIG.ADMIN.password) {
        try {
            const adminData = {
                id: 'admin-' + Date.now(),
                username: username,
                loginTime: new Date().toISOString(),
                type: 'admin'
            };
            
            sessionStorage.setItem(AUTH_CONFIG.STORAGE.admin, 'true');
            localStorage.setItem(AUTH_CONFIG.STORAGE.user, JSON.stringify(adminData));
            
            successEl.textContent = '✅ Admin sifatida kirildi! Redirect qilinyapt...';
            successEl.style.display = 'block';
            
            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 1500);
        } catch (e) {
            showError(errorEl, 'Tizim xatosi. Iltimos, qayta urinib ko\'ring.');
        }
    } else {
        showError(errorEl, '❌ Noto\'g\'ri username yoki parol!');
    }
}

// ===== HELPER FUNCTIONS =====
function showError(element, message) {
    element.textContent = message;
    element.style.display = 'block';
}

function clearMessages() {
    document.getElementById('userError').style.display = 'none';
    document.getElementById('userSuccess').style.display = 'none';
    document.getElementById('adminError').style.display = 'none';
    document.getElementById('adminSuccess').style.display = 'none';
}

// ===== GLOBAL AUTH FUNCTIONS (for main.js & admin.js) =====

// Check if user is logged in
function isUserLoggedIn() {
    return sessionStorage.getItem(AUTH_CONFIG.STORAGE.userSession) === 'true';
}

// Check if admin is logged in
function isAdminLoggedIn() {
    return sessionStorage.getItem(AUTH_CONFIG.STORAGE.admin) === 'true';
}

// Get current user data
function getCurrentUser() {
    try {
        const userData = localStorage.getItem(AUTH_CONFIG.STORAGE.user);
        return userData ? JSON.parse(userData) : null;
    } catch (e) {
        return null;
    }
}

// Get current user ID (for ratings, comments, etc)
function getCurrentUserID() {
    const user = getCurrentUser();
    return user ? user.id : 'anonymous-' + Date.now();
}

// Logout user (clear session)
function logout() {
    sessionStorage.removeItem(AUTH_CONFIG.STORAGE.userSession);
    sessionStorage.removeItem(AUTH_CONFIG.STORAGE.admin);
    // Don't clear localStorage - keep user data
    window.location.href = 'login.html';
}

// Logout admin specifically
function adminLogout() {
    sessionStorage.removeItem(AUTH_CONFIG.STORAGE.admin);
    sessionStorage.removeItem(AUTH_CONFIG.STORAGE.userSession);
    window.location.href = 'login.html';
}

// Check and redirect if not logged in (for protected pages)
function requireLogin() {
    if (!isUserLoggedIn() && !isAdminLoggedIn()) {
        window.location.href = 'login.html';
    }
}

// Check and redirect if not admin
function requireAdmin() {
    if (!isAdminLoggedIn()) {
        window.location.href = 'login.html?tab=admin';
    }
}

// ===== PAGE INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    // Create particles if on login page
    const particlesContainer = document.getElementById('particles');
    if (particlesContainer) {
        createParticles();
    }
    
    // Check for tab parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab === 'admin') {
        switchTab('admin');
    }
    
    // Add Enter key support
    const userInputs = ['loginEmail','loginPassword','regEmail','regPassword','regPassword2'];
    const adminInputs = ['adminUser', 'adminPass'];
    
    userInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    // Trigger login or register depending on which form is visible
                    const regFormVisible = document.getElementById('userRegisterForm') && document.getElementById('userRegisterForm').style.display !== 'none';
                    if (regFormVisible) registerUser(new Event('submit')); else userLogin(new Event('submit'));
                }
            });
        }
    });

    // Setup small tab toggling inside user login (login/register)
    window.toggleSubTab = function(which) {
        const loginForm = document.getElementById('userLoginForm');
        const regForm = document.getElementById('userRegisterForm');
        const tabLogin = document.getElementById('subTabLogin');
        const tabReg = document.getElementById('subTabRegister');
        if (which === 'register') {
            loginForm.style.display = 'none'; regForm.style.display = 'block';
            tabLogin.classList.remove('active'); tabReg.classList.add('active');
        } else {
            loginForm.style.display = 'block'; regForm.style.display = 'none';
            tabLogin.classList.add('active'); tabReg.classList.remove('active');
        }
    };
    
    adminInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    adminLogin(new Event('submit'));
                }
            });
        }
    });
});

// ===== PARTICLE ANIMATION (shared with main site) =====
function createParticles() {
    const particleContainer = document.getElementById('particles');
    if (!particleContainer) return;
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.width = Math.random() * 100 + 50 + 'px';
        particle.style.height = particle.style.width;
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (Math.random() * 20 + 20) + 's';
        particleContainer.appendChild(particle);
    }
}
