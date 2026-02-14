const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/auth';

const container = document.getElementById('container');
const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');
const loading = document.getElementById('loading');
const dashboard = document.getElementById('dashboard');
const forgotLink = document.getElementById('forgot-password-link');
const forgotModal = document.getElementById('forgot-modal');
const closeModal = document.querySelector('.close-modal');

// Panel Toggling
signUpButton.addEventListener('click', () => {
    container.classList.add("right-panel-active");
});

signInButton.addEventListener('click', () => {
    container.classList.remove("right-panel-active");
});

// Password Toggle
document.querySelectorAll('.toggle-password').forEach(icon => {
    icon.addEventListener('click', function () {
        const targetId = this.getAttribute('data-target');
        const input = document.getElementById(targetId);
        if (input.type === 'password') {
            input.type = 'text';
            this.classList.remove('fa-eye-slash');
            this.classList.add('fa-eye');
        } else {
            input.type = 'password';
            this.classList.remove('fa-eye');
            this.classList.add('fa-eye-slash');
        }
    });
});

// Password Strength
const regPasswordInput = document.getElementById('reg-password');
const strengthBar = document.getElementById('strength-bar');
const strengthText = document.getElementById('strength-text');

regPasswordInput.addEventListener('input', () => {
    const val = regPasswordInput.value;
    let strength = 0;
    if (val.length >= 8) strength++;
    if (/[A-Z]/.test(val)) strength++;
    if (/[0-9]/.test(val)) strength++;
    if (/[^A-Za-z0-9]/.test(val)) strength++;

    strengthBar.className = 'strength-bar';
    if (strength < 2) {
        strengthBar.classList.add('strength-red');
        strengthText.textContent = 'Weak';
        strengthText.style.color = 'red';
    } else if (strength < 4) {
        strengthBar.classList.add('strength-orange');
        strengthText.textContent = 'Medium';
        strengthText.style.color = 'orange';
    } else {
        strengthBar.classList.add('strength-green');
        strengthText.textContent = 'Strong';
        strengthText.style.color = 'green';
    }

    strengthBar.style.width = (strength * 25) + '%';
});


// Register
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    showLoading(true);
    document.getElementById('reg-error').textContent = '';

    try {
        const res = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await res.json();

        if (res.ok) {
            alert('Registration Successful! Please Sign In.');
            container.classList.remove("right-panel-active");
            registerForm.reset();
        } else {
            handleErrors(data, 'reg-error');
        }
    } catch (err) {
        document.getElementById('reg-error').textContent = 'Server connection error';
    } finally {
        showLoading(false);
    }
});

// Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value; // Username or Email
    const password = document.getElementById('login-password').value;

    showLoading(true);
    document.getElementById('login-error').textContent = '';

    try {
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }) // 'username' field handles both in backend
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem('token', data.token);
            showDashboard(data.user);
        } else {
            document.getElementById('login-error').textContent = data.msg || 'Login failed';
        }
    } catch (err) {
        document.getElementById('login-error').textContent = 'Server connection error';
    } finally {
        showLoading(false);
    }
});

function handleErrors(data, elementId) {
    const el = document.getElementById(elementId);
    if (data.errors) {
        el.textContent = data.errors.map(err => err.msg).join(', ');
    } else if (data.msg) {
        el.textContent = data.msg;
    } else {
        el.textContent = 'An error occurred';
    }
}

// Dashboard Logic
async function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) return;

    showLoading(true);
    try {
        const res = await fetch(`${API_URL}/profile`, {
            headers: { 'x-auth-token': token }
        });
        const data = await res.json();
        if (res.ok) {
            showDashboard(data);
        } else {
            localStorage.removeItem('token');
        }
    } catch (err) {
        console.error(err);
    } finally {
        showLoading(false);
    }
}

function showDashboard(user) {
    container.classList.add('hidden'); // Hide login container
    dashboard.classList.remove('hidden');
    dashboard.classList.add('visible'); // Show dashboard

    document.getElementById('user-name').textContent = user.username;
    document.getElementById('user-email').textContent = user.email;
    if (user.lastLogin) {
        document.getElementById('user-last-login').textContent = new Date(user.lastLogin).toLocaleString();
    }
}

document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.reload();
});

// Forgot Password Modal
forgotLink.addEventListener('click', (e) => {
    e.preventDefault();
    forgotModal.style.display = 'flex';
});

closeModal.addEventListener('click', () => {
    forgotModal.style.display = 'none';
});

window.onclick = function (event) {
    if (event.target == forgotModal) {
        forgotModal.style.display = "none";
    }
}

document.getElementById('forgotForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('forgot-email').value;
    const msgDiv = document.getElementById('forgot-msg');

    msgDiv.textContent = 'Sending...';
    try {
        const res = await fetch(`${API_URL}/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await res.json();
        msgDiv.textContent = data.msg;
        msgDiv.style.color = res.ok ? 'green' : 'red';
    } catch (err) {
        msgDiv.textContent = 'Error';
    }
});

function showLoading(show) {
    if (show) loading.classList.remove('hidden');
    else loading.classList.add('hidden');
}

// Check auth on load
checkAuth();
