import { showLogin } from './login.js';
import { sessionRedirect } from './session.js';

const appDiv = document.getElementById('app');

function router() {
  const hash = window.location.hash || '#login';
  const token = null; // No localStorage token since we use cookie

  if (hash === '#login') {
    // Always call sessionRedirect to verify cookie token, else show login
    sessionRedirect(appDiv, null).catch(() => showLogin(appDiv));
  } else if (hash.startsWith('#user')) {
    sessionRedirect(appDiv, 'user').catch(() => (window.location.hash = '#login'));
  } else if (hash.startsWith('#admin')) {
    sessionRedirect(appDiv, 'admin').catch(() => (window.location.hash = '#login'));
  } else if (hash.startsWith('#moderator')) {
    sessionRedirect(appDiv, 'moderator').catch(() => (window.location.hash = '#login'));
  } else {
    window.location.hash = '#login';
  }
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);
router();
