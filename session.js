import { showSpinner, hideSpinner } from './spinner.js';

export async function verifySession(container) {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    container.innerHTML = '<p style="color:red;">Not signed in.</p>';
    return false;
  }
  showSpinner(container);
  try {
    const res = await fetch('https://se-on.smnglobal.workers.dev/api/session-verify', {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token }
    });

    if (!res.ok) {
      const errData = await res.json();
      container.innerHTML = `<p style="color:red;">Session error: ${errData.error || res.statusText}</p>`;
      return false;
    }

    const user = await res.json();
    // Role-based redirect/panel
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
        container.innerHTML = `<p style="color:red;">Unrecognized role: ${user.role}</p>`;
    }
    return true;
  } catch (err) {
    container.innerHTML = `<p style="color:red;">Session check failed: ${err.message}</p>`;
    return false;
  } finally {
    hideSpinner(container);
  }
}
