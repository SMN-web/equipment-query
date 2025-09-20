export async function sessionRedirect(container, expectedRole, options = {}) {
  const { noRedirect = false } = options;

  container.innerHTML += `<p>Checking saved cookies...</p>`;

  try {
    const res = await fetch('https://se-on.smnglobal.workers.dev/api/session-verify', {
      method: 'GET',
      credentials: 'include',
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Session verification failed');
    }

    const userInfo = await res.json();

    container.innerHTML += `<p style="color:green;">Cookies retrieved successfully! Welcome, ${userInfo.username} (Role: ${userInfo.role})</p>`;

    // No routing logic here; just return true
    return true;

  } catch (err) {
    container.innerHTML += `<p style="color:red;">Session verification failed: ${err.message}</p>`;
    return false;
  }
}
