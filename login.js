import { sessionRedirect } from './session.js';

export function showLogin(container) {
  container.innerHTML = `
    <h2>Login</h2>
    <form id="loginForm">
      <input id="usernameOrEmail" type="text" placeholder="Username or Email" required />
      <input id="password" type="password" placeholder="Password" required />
      <label><input id="keepSignedIn" type="checkbox" /> Keep me signed in</label><br/>
      <button type="submit">Login</button>
      <pre id="loginResult" style="white-space: pre-wrap; word-break: break-word; margin-top:10px; color: green;"></pre>
      <div id="loginError" style="color:red; white-space: pre-wrap; margin-top: 10px;"></div>
    </form>
  `;

  const form = container.querySelector('#loginForm');
  const errorDiv = container.querySelector('#loginError');
  const resultPre = container.querySelector('#loginResult');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorDiv.textContent = '';
    resultPre.textContent = '';

    const payload = {
      usernameOrEmail: e.target.usernameOrEmail.value.trim(),
      password: e.target.password.value,
      keepSignedIn: e.target.keepSignedIn.checked,
    };

    try {
      const res = await fetch('https://lo-in.smnglobal.workers.dev/api/login', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Login failed');

      if (data.debugSetCookieHeader) {
        resultPre.textContent = 'Cookie header sent by server:\n' + data.debugSetCookieHeader;
      } else {
        resultPre.textContent = 'Login successful. Cookie saved.';
      }

      // Call session verify WITHOUT any routing; just show success message
      await sessionRedirect(container, null, { noRedirect: true });

    } catch (err) {
      errorDiv.textContent = err.message;
    }
  });
}
