export function showLogin(container) {
  container.innerHTML = `
    <h2>Login</h2>
    <form id="loginForm">
      <input type="text" id="usernameOrEmail" placeholder="Username or Email" required />
      <input type="password" id="password" placeholder="Password" required />
      <label><input type="checkbox" id="keepSignedIn"/> Keep me signed in</label><br/>
      <button type="submit">Login</button>
      <div id="loginError" style="color:red;"></div>
    </form>
  `;

  document.getElementById('loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    document.getElementById('loginError').textContent = "";

    const payload = {
      usernameOrEmail: e.target.usernameOrEmail.value.trim(),
      password: e.target.password.value,
      keepSignedIn: e.target.keepSignedIn.checked,
    };

    try {
      const res = await fetch('https://lo-in.smnglobal.workers.dev/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Login failed");

      // Default redirect post login (session check will redirect properly)
      window.location.hash = '#user';

      // Use session verify to redirect correctly by role
      import('./session.js').then(mod => mod.sessionRedirect(container, 'user'));
    } catch (err) {
      document.getElementById('loginError').textContent = err.message;
    }
  });
}
