// All Elements
const loginForm = document.getElementById('login-form');
const loginPage = document.getElementById('login-page');
const dashboardPage = document.getElementById('dashboard-page');
const loginError = document.getElementById('login-error');

// Login
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    if (user === 'admin' && pass === 'admin123') {
        loginPage.classList.add('hidden');
        dashboardPage.classList.remove('hidden');
        fetchIssues(); 
    } else {
        loginError.classList.remove('hidden');
    }
});

const API_BASE = 'https://phi-lab-server.vercel.app/api/v1/lab';


let allIssues = [];
let currentFilter = 'All';