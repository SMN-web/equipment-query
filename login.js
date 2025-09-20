import { sessionRedirect } from './session.js';

export function showLogin(container) {
  container.innerHTML = `
    <h2>Login</h2>
    <form id="loginForm">
      <input id="usernameOrEmail" type="text" placeholder="Username or Email" required />
      <input id="password" type="password" placeholder="Password" required />
      <label><input id="keepSignedIn" type="checkbox" /> Keep me signed in</label><br/>
      <button type="submit">Login</button>
      <div id="loginError" style="color:red; white-space: pre-wrap; margin-top: 10px;"></div>
    </form>
  `;

  const form = container.querySelector('#loginForm');
  const errorDiv = container.querySelector('#loginError');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    errorDiv.textContent = '';

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
        credentials: 'include', // Important to receive cookie
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Login failed');

      // After login success, call sessionRedirect to load dashboard panel
      await sessionRedirect(container, null);

    } catch (err) {
      errorDiv.textContent = err.message;
    }
  });
}
