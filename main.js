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
      const resp = await fetch('https://lo-ou.smnglobal.workers.dev/api/logout', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        
      });
      if (!resp.ok) {
        const result = await resp.json().catch(() => ({}));
        alert('Logout failed: ' + (result.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Logout API error:', err);
    }
    localStorage.removeItem('auth_token');
  }
  location.reload();
};

window.addEventListener('load', initApp);
