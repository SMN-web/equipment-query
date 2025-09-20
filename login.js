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
      <pre id="sessionResult" style="white-space: pre-wrap; margin-top: 10px; color: blue;"></pre>
    </form>
  `;

  const form = container.querySelector('#loginForm');
  const errorDiv = container.querySelector('#loginError');
  const resultPre = container.querySelector('#loginResult');
  const sessionPre = container.querySelector('#sessionResult');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorDiv.textContent = '';
    resultPre.textContent = '';
    sessionPre.textContent = '';

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

      alert("Cookies visible to JS: " + document.cookie);

      // Show cookies accessible to JS in page
      sessionPre.textContent = "Cookies visible to JS:\n" + document.cookie;

      // Now verify session via backend
      const verifyRes = await fetch('https://se-on.smnglobal.workers.dev//api/session-verify', {
        method: 'GET',
        credentials: 'include',
      });

      if (!verifyRes.ok) {
        const errorData = await verifyRes.json();
        sessionPre.textContent += "\nSession verification error:\n" + (errorData.error || verifyRes.statusText);
      } else {
        const sessionData = await verifyRes.json();
        sessionPre.textContent += "\nSession verified:\n" + JSON.stringify(sessionData, null, 2);
      }

    } catch (err) {
      errorDiv.textContent = err.message;
    }
  });
}
