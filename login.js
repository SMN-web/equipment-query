import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

export function showLogin(container) {
  container.innerHTML = `
    <div class="panel">
      <h2>Login</h2>
      <input id="email" type="email" placeholder="Email" />
      <input id="password" type="password" placeholder="Password" />
      <button id="login-btn">Login</button>
      <p id="login-msg"></p>
    </div>
  `;

  container.querySelector('#login-btn').addEventListener('click', async () => {
    const email = container.querySelector('#email').value;
    const password = container.querySelector('#password').value;
    const msg = container.querySelector('#login-msg');

    try {
      const userCredential = await signInWithEmailAndPassword(window.firebaseAuth, email, password);
      const role = userCredential.user.role; // Or fetch from Firestore
      if (role === 'admin') window.location.hash = '#admin';
      else if (role === 'moderator') window.location.hash = '#moderator';
      else window.location.hash = '#user';
    } catch (err) {
      msg.innerText = err.message;
    }
  });
}