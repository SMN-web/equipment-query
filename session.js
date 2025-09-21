import { showSpinner, hideSpinner } from './spinner.js';
import { showLogin } from './login.js';

export async function verifySession(container) {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    showLogin(container);
    return false;
  }
  showSpinner(container);
  try {
    const res = await fetch('https://se-on.smnglobal.workers.dev/api/session-verify', {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token }
    });

    // On any error (including signature change), clear token and redirect to login
    if (!res.ok) {
      localStorage.removeItem('auth_token');
      showLogin(container);
      return false;
    }
    const user = await res.json();
    if (user.error) {
      localStorage.removeItem('auth_token');
      showLogin(container);
      return false;
    }
    switch (user.role) {
      case 'user':
        import('./users.js').then(mod => mod.showUsers(container));
        break;
      case 'admin':
        import('./admin.js').then(mod => mod.showAdminPanel(container));
        break;
      case 'moderator':
        import('./moderator.js').then(mod => mod.showModeratorPanel(container));
        break;
      default:
        localStorage.removeItem('auth_token');
        showLogin(container);
    }
    return true;
  } catch (err) {
    localStorage.removeItem('auth_token');
    showLogin(container);
    return false;
  } finally {
    hideSpinner(container);
  }
}
