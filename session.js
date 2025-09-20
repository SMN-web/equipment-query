export async function sessionRedirect(container, expectedRole) {
  container.innerHTML = `<p>Checking session...</p>`;

  try {
    const res = await fetch('https://se-on.smnglobal.workers.dev/api/session-verify', {
      method: 'GET',
      credentials: 'include', // Send cookies
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Session verification failed');
    }

    const userInfo = await res.json();

    container.innerHTML = `<p>Welcome ${userInfo.username}, Role: ${userInfo.role}</p>`;

    if (expectedRole && userInfo.role !== expectedRole) {
      container.innerHTML += `<p>Role mismatch, redirecting to login...</p>`;
      throw new Error('Role mismatch');
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
        container.innerHTML += `<p>Unknown role, redirecting...</p>`;
        throw new Error('Unknown role');
    }
  } catch (err) {
    container.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
    window.location.hash = '#login';
  }
}
