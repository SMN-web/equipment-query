import { showLogin } from './login.js';
import { verifySession } from './session.js';

const appDiv = document.getElementById('app');

function initApp() {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    showLogin(appDiv);
  } else {
    verifySession(appDiv);
  }
}

// Add a logout handler
window.logout = function() {
  localStorage.removeItem('auth_token');
  location.reload();
};

window.addEventListener('load', initApp);
