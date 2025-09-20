import { showLogin } from './login.js';
// import { sessionRedirect } from './session.js'; // not used initially

const appDiv = document.getElementById('app');

function router() {
  const hash = window.location.hash || '#login';

  // Initially, always show login page without verifying token or redirecting
  if (hash === '#login') {
    showLogin(appDiv);
  } else {
    // For now, prevent redirects: always show login on any other hash
    window.location.hash = '#login';
  }
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);
router();
