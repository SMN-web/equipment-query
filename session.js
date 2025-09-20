export async function sessionRedirect(container, expectedRole) {
  container.innerHTML = `<p>Checking session...</p>`;

  const token = localStorage.getItem('auth_token');
  if (!token) {
    container.innerHTML = `<p>No stored token. Redirecting to login.</p>`;
    window.location.hash = '#login';
    return;
  }

  try {
    const res = await fetch('https://se-on.smnglobal.workers.dev/api/session-verify', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    container.innerHTML += `<p>Response status: ${res.status}</p>`;

    if (!res.ok) throw new Error("Session invalid or expired");

    const userInfo = await res.json();

    container.innerHTML += `<p>Session verified. Logged in as ${userInfo.username} with role ${userInfo.role}</p>`;

    if (userInfo.role !== expectedRole) {
      container.innerHTML += `<p style="color:red">Role mismatch: expected ${expectedRole}, got ${userInfo.role}</p>`;
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
    container.innerHTML = `<p style="color:red">Error during session check: ${err.message}</p>`;
    window.location.hash = '#login';
  }
}
