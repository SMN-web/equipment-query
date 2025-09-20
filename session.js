export async function sessionRedirect(container, expectedRole) {
  container.innerHTML = `<p>Checking session...</p>`;

  try {
    const res = await fetch('https://se-on.smnglobal.workers.dev/api/session-verify', {
      method: 'GET',
      credentials: 'include'
    });

    container.innerHTML = `<p>Session verify response received: ${res.status}</p>`;

    if (!res.ok) throw new Error(`Session verify returned status ${res.status}`);

    const userInfo = await res.json();
    container.innerHTML = `<p>Logged in as ${userInfo.username} with role ${userInfo.role}</p>`;

    if (userInfo.role !== expectedRole) {
      container.innerHTML += `<p>Role mismatch: expected ${expectedRole}, got ${userInfo.role}</p>`;
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
  } catch (err) {
    container.innerHTML = `<p>Error during session check: ${err.message}</p>`;
    window.location.hash = '#login';
  }
}
