export function renderLogin(container) {
  container.innerHTML = `
    <div class="panel" id="login-panel">
      <h2>🔐 Login</h2>
      <input id="email" type="email" placeholder="Email" />
      <input id="password" type="password" placeholder="Password" />
      <button id="login-btn">Login</button>
      <p id="login-msg"></p>
    </div>
  `;

  const btn = container.querySelector('#login-btn');
  btn.addEventListener('click', async () => {
    const email = container.querySelector('#email').value;
    const password = container.querySelector('#password').value;
    const msg = container.querySelector('#login-msg');
    try {
      await window.firebaseAuth.signInWithEmailAndPassword(email, password);
      msg.innerText = 'Logging in...';
    } catch (err) {
      msg.innerText = err.message;
    }
  });
}