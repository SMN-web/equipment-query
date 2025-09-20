export async function sessionRedirect(container, expectedRole, options = {}) {
  const { showModalOnFail = false } = options;
  container.innerHTML = `<p>Checking session...</p>`;

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

    container.innerHTML = `<p>Welcome ${userInfo.username}, Role: ${userInfo.role}</p>`;

    if (expectedRole && userInfo.role !== expectedRole) {
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
        throw new Error('Unknown role');
    }
    return true; // verification successful

  } catch (err) {
    if (showModalOnFail) {
      await showModal(`Authentication error: ${err.message}`);
    }
    return false; // verification failed
  }
}

// Simple modal helper that returns Promise resolved when user closes modal
function showModal(message) {
  return new Promise((resolve) => {
    let modal = document.createElement('div');
    modal.innerHTML = `
      <div style="
        position:fixed;
        top:0; left:0; width:100vw; height:100vh;
        background:rgba(0,0,0,0.5);
        display:flex; align-items:center; justify-content:center;
        z-index:1000;"
      >
        <div style="
          background:#fff; padding:20px; border-radius:6px; max-width:300px;
          text-align:center;
        ">
          <p>${message}</p>
          <button id="modalOkBtn">OK</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('#modalOkBtn').onclick = () => {
      document.body.removeChild(modal);
      resolve();
    };
  });
}
