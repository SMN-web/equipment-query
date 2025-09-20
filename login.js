export function showLogin(container) {
  container.innerHTML = `
    <h2>Login</h2>
    <form id="loginForm">
      <input type="text" id="usernameOrEmail" placeholder="Username or Email" required />
      <input type="password" id="password" placeholder="Password" required />
      <label><input type="checkbox" id="keepSignedIn" /> Keep me signed in</label><br />
      <button type="submit">Login</button>
      <div id="loginError" style="color:red; white-space: pre-wrap;"></div>
      <textarea id="jwtToken" readonly style="width: 100%; height: 6em; margin-top: 10px; font-family: monospace; display:none;"></textarea>
      <button id="copyTokenBtn" style="display:none; margin-top: 5px;">Copy JWT Token</button>
    </form>
  `;

  const form = container.querySelector('#loginForm');
  const errorDiv = container.querySelector('#loginError');
  const jwtTokenTextarea = container.querySelector('#jwtToken');
  const copyTokenBtn = container.querySelector('#copyTokenBtn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorDiv.textContent = "";
    jwtTokenTextarea.style.display = "none";
    copyTokenBtn.style.display = "none";

    const payload = {
      usernameOrEmail: e.target.usernameOrEmail.value.trim(),
      password: e.target.password.value,
      keepSignedIn: e.target.keepSignedIn.checked,
    };

    try {
      const res = await fetch('https://se-on.smnglobal.workers.dev/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Login failed");

      if (data.token) {
        jwtTokenTextarea.value = data.token;
        jwtTokenTextarea.style.display = "block";
        copyTokenBtn.style.display = "inline-block";
      } else {
        errorDiv.textContent = "Login succeeded but no token returned.";
      }
    } catch (err) {
      errorDiv.textContent = err.message;
    }
  });

  copyTokenBtn.addEventListener('click', () => {
    jwtTokenTextarea.select();
    document.execCommand('copy');
    copyTokenBtn.textContent = "Copied!";
    setTimeout(() => (copyTokenBtn.textContent = "Copy JWT Token"), 2000);
  });
}
