export async function sessionRedirect(container, expectedRole) {
  const sessionVerifyUrl = 'https://se-on.smnglobal.workers.dev/api/session-verify'; // <-- Change to your actual backend URL
  container.innerHTML = `<p>Starting session verification...</p>`;

  try {
    container.innerHTML += `<p>Sending request to: ${sessionVerifyUrl}</p>`;

    const res = await fetch(sessionVerifyUrl, {
      method: 'GET',
      credentials: 'include'
    });

    container.innerHTML += `<p>Response status: ${res.status}</p>`;

    if (!res.ok) throw new Error(`Session verify failed with status ${res.status}`);

    const userInfo = await res.json();

    container.innerHTML += `<p>Session verified. Logged in as ${userInfo.username} with role ${userInfo.role}</p>`;

    if (userInfo.role !== expectedRole) {
      container.innerHTML += `<p style="color:red">Role mismatch! Expected: ${expectedRole}, got: ${userInfo.role}</p>`;
      window.location.hash = '#login';
      return;
    }

    // Load appropriate module by role
    switch (userInfo.role) {
      case 'user':
        container.innerHTML += `<p>Loading user dashboard...</p>`;
        import('./users.js').then(mod => mod.showUsers(container));
        break;
      case 'admin':
        container.innerHTML += `<p>Loading admin panel...</p>`;
        import('./admin.js').then(mod => mod.showAdminPanel(container));
        break;
      case 'moderator':
        container.innerHTML += `<p>Loading moderator panel...</p>`;
        import('./moderator.js').then(mod => mod.showModeratorPanel(container));
        break;
      default:
        container.innerHTML += `<p style="color:red">Unknown role: ${userInfo.role}. Redirecting to login.</p>`;
        window.location.hash = '#login';
    }
  } catch (error) {
    container.innerHTML += `<p style="color:red">Error during session check: ${error.message}</p>`;
    window.location.hash = '#login';
  }
}
