export async function sessionRedirect(container, expectedRole) {
  container.innerHTML = `<p>Checking session...</p>`;

  try {
    const res = await fetch('https://se-on.smnglobal.workers.dev/api/session-verify', {
      method: 'GET',
      credentials: 'include'
    });

    if (!res.ok) throw new Error("Session invalid or expired");

    const userInfo = await res.json();

    if (userInfo.role !== expectedRole) {
      window.location.hash = '#login';
      return;
    }

    switch (userInfo.role) {
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
        window.location.hash = '#login';
    }
  } catch {
    window.location.hash = '#login';
  }
}
