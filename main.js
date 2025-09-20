import { showLogin } from './login.js';
import { sessionRedirect } from './session.js';

const appDiv = document.getElementById('app');

function router() {
  const hash = window.location.hash || '#login';
  const token = localStorage.getItem('auth_token');

  if (hash === '#login') {
    if (token) {
      // If token exists, verify session and redirect automatically
      sessionRedirect(appDiv, null /* accept any role */);
    } else {
      // No token, show login page
      showLogin(appDiv);
    }
  } else if (hash.startsWith('#user')) {
    if (token) {
      sessionRedirect(appDiv, 'user');
    } else {
      window.location.hash = '#login';
    }
  } else if (hash.startsWith('#admin')) {
    if (token) {
      sessionRedirect(appDiv, 'admin');
    } else {
      window.location.hash = '#login';
    }
  } else if (hash.startsWith('#moderator')) {
    if (token) {
      sessionRedirect(appDiv, 'moderator');
    } else {
      window.location.hash = '#login';
    }
  } else {
    window.location.hash = '#login';
  }
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);
router();
