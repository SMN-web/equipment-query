export async function sessionRedirect(container, expectedRole, options = {}) {
  const { showModalOnFail = false } = options;

  container.innerHTML = `<p>Checking session...</p>`;

  try {
    const res = await fetch('https://se-on.smnglobal.workers.dev/api/session-verify', {
      method: 'GET',
      credentials: 'include', // Send cookies
    });

    if (!res.ok) {
      let errorText = 'Unknown error';
      try {
        const errData = await res.json();
        errorText = errData.error || JSON.stringify(errData);
      } catch {
        errorText = await res.text();
      }
      throw new Error(errorText);
    }

    const userInfo = await res.json();

    container.innerHTML = `<p>Welcome ${userInfo.username}, Role: ${userInfo.role}</p>`;

    if (expectedRole && userInfo.role !== expectedRole) {
      throw new Error(
        `Role mismatch: expected ${expectedRole}, but got ${userInfo.role}`
      );
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
    return true;
  } catch (err) {
    container.innerHTML = `<p style="color:red;">Session Error: ${err.message}</p>`;

    if (showModalOnFail) {
      await showModal(`Authentication error: ${err.message}`);
    }

    return false;
  }
}

function showModal(message) {
  return new Promise(resolve => {
    let modal = document.createElement('div');
    modal.innerHTML = `
      <div style="
        position:fixed;
        top:0; left:0; width:100vw; height:100vh;
        background:rgba(0,0,0,0.5);
        display:flex; align-items:center; justify-content:center;
        z-index:1000;">
        <div style="
          background:#fff; padding:20px; border-radius:6px; max-width:300px;
          text-align:center; font-family: sans-serif;">
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
