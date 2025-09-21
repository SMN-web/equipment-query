import { showSpinner, hideSpinner } from './spinner.js';

export function showLogin(container) {
  container.innerHTML = `
    <div class="login-card">
      <h2>Login</h2>
      <form id="loginForm">
        <label for="usernameOrEmail">Username or Email</label>
        <input id="usernameOrEmail" type="text" required autocomplete="username" />
        <label for="password">Password</label>
        <input id="password" type="password" required autocomplete="current-password" />
        <button type="submit">Login</button>
        <div id="loginError" class="form-error"></div>
      </form>
    </div>
  `;

  const form = container.querySelector('#loginForm');
  const errorDiv = container.querySelector('#loginError');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorDiv.textContent = '';
    showSpinner(container);

    const payload = {
      usernameOrEmail: form.usernameOrEmail.value.trim(),
      password: form.password.value
    };

    try {
      const res = await fetch('https://lo-in.smnglobal.workers.dev/api/login', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      if (data.token) {
        localStorage.setItem('auth_token', data.token);
        location.reload();
      } else {
        errorDiv.textContent = 'Login response missing token.';
      }
    } catch (err) {
      errorDiv.textContent = err.message;
    } finally {
      hideSpinner(container);
    }
  });
}
