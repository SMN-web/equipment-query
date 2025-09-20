export async function sessionRedirect(container, expectedRole) {
  container.innerHTML = `<p>Checking session...</p>`;

  const token = localStorage.getItem('auth_token');
  container.innerHTML += `<p>Token: ${token ? token.slice(0, 20) + '...' : 'No token in localStorage'}</p>`;
  if (!token) {
    container.innerHTML += `<p>No token found, redirecting to login.</p>`;
    window.location.hash = '#login';
    return;
  }

  try {
    const res = await fetch('https://se-on.smnglobal.workers.dev/api/session-verify', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    container.innerHTML += `<p>Response status: ${res.status}</p>`;

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Session verification failed');
    }

    const userInfo = await res.json();
    container.innerHTML += `<p>Logged in as ${userInfo.username}, role: ${userInfo.role}</p>`;

    if (userInfo.role !== expectedRole) {
      container.innerHTML += `<p>Role mismatch (expected ${expectedRole}), redirecting to login.</p>`;
      window.location.hash = '#login';
      return;
    }

    switch (userInfo.role) {
      case 'user':
        import('./users.js').then((mod) => mod.showUsers(container));
        break;
      case 'admin':
        import('./admin.js').then((mod) => mod.showAdminPanel(container));
        break;
      case 'moderator':
        import('./moderator.js').then((mod) => mod.showModeratorPanel(container));
        break;
      default:
        window.location.hash = '#login';
    }
  } catch (err) {
    container.innerHTML += `<p style="color:red;">Error: ${err.message}</p>`;
    window.location.hash = '#login';
  }
}
