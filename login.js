export function showLogin(container) {
  container.innerHTML = `
    <h2>Login</h2>
    <form id="loginForm">
      <input type="text" id="usernameOrEmail" placeholder="Username or Email" required />
      <input type="password" id="password" placeholder="Password" required />
      <label><input type="checkbox" id="keepSignedIn"/> Keep me signed in</label><br/>
      <button type="submit">Login</button>
      <div id="loginError" style="color:red; white-space: pre-wrap;"></div>
      <div id="loginSuccess" style="color:green; white-space: pre-wrap; margin-top: 10px;"></div>
    </form>
  `;

  document.getElementById('loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    document.getElementById('loginError').textContent = "";
    document.getElementById('loginSuccess').textContent = "";

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

      // Display JWT token to frontend for debugging/transition
      document.getElementById('loginSuccess').textContent = `Login successful!\nJWT token:\n${data.token}`;

      // Optionally, automatically redirect (comment out if you want to view token)
      // window.location.hash = '#user';

    } catch (err) {
      document.getElementById('loginError').textContent = err.message;
    }
  });
}
