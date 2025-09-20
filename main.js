import { showLogin } from './login.js';
import { sessionRedirect } from './session.js';

const appDiv = document.getElementById('app');

// Flag to track if modal for session failure shown, to avoid loops
let sessionFailureModalShown = false;

async function router() {
  const hash = window.location.hash || '#login';

  if (hash === '#login') {
    if (!sessionFailureModalShown) {
      const success = await sessionRedirect(appDiv, null, { showModalOnFail: true });
      if (!success) {
        sessionFailureModalShown = true;
        showLogin(appDiv);
      }
    } else {
      // Modal was shown before, just render login UI directly now
      showLogin(appDiv);
    }
  } else if (hash.startsWith('#user')) {
    sessionFailureModalShown = false;
    sessionRedirect(appDiv, 'user').catch(() => (window.location.hash = '#login'));
  } else if (hash.startsWith('#admin')) {
    sessionFailureModalShown = false;
    sessionRedirect(appDiv, 'admin').catch(() => (window.location.hash = '#login'));
  } else if (hash.startsWith('#moderator')) {
    sessionFailureModalShown = false;
    sessionRedirect(appDiv, 'moderator').catch(() => (window.location.hash = '#login'));
  } else {
    window.location.hash = '#login';
  }
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);
router();
