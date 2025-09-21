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

// Logout function: update status, then reload
window.logout = async function() {
  const token = localStorage.getItem('auth_token');
  if (token) {
    try {
      // Call logout API to update user status server-side
      await fetch('https://lo-ou.smnglobal.workers.dev/api/logout', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token }
      });
    } catch (err) {
      console.error('Logout API error:', err);
    }
    // Remove token and reload UI
    localStorage.removeItem('auth_token');
  }
  location.reload();
};

window.addEventListener('load', initApp);
