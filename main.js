import { showLogin } from './login.js';
import { sessionRedirect } from './session.js';

const appDiv = document.getElementById('app');

function router() {
  const hash = window.location.hash || '#login';

  if (hash === '#login') {
    showLogin(appDiv);
  } else if (hash.startsWith('#user')) {
    sessionRedirect(appDiv, 'user');
  } else if (hash.startsWith('#admin')) {
    sessionRedirect(appDiv, 'admin');
  } else if (hash.startsWith('#moderator')) {
    sessionRedirect(appDiv, 'moderator');
  } else {
    window.location.hash = '#login';
  }
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);
router();
