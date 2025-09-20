export async function sessionRedirect(container, expectedRole) {
  container.innerHTML = `<p>Checking session...</p>`;

  const token = localStorage.getItem('auth_token');
  if (!token) {
    container.innerHTML = `<p>No token found. Redirecting to login.</p>`;
    showLogin(container);
    return;
  }

  try {
    const res = await fetch('https://se-on.smnglobal.workers.dev/api/session-verify', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Session verification failed');
    }

    const userInfo = await res.json();

    container.innerHTML = `<p>Welcome ${userInfo.username}, Role: ${userInfo.role}</p>`;

    if (expectedRole && userInfo.role !== expectedRole) {
      container.innerHTML += `<p>Role mismatch, redirecting to login...</p>`;
      localStorage.removeItem('auth_token');
      showLogin(container);
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
        container.innerHTML += `<p>Unknown role, redirecting...</p>`;
        localStorage.removeItem('auth_token');
        showLogin(container);
    }
  } catch (err) {
    container.innerHTML = `<p style="color:red">Session error: ${err.message}</p>`;
    localStorage.removeItem('auth_token');
    showLogin(container);
  }
}
