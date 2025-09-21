import { showSpinner, hideSpinner } from './spinner.js';

export function showAddUser(container) {
  container.innerHTML = `
    <h3>Add New User</h3>
    <form id="add-user-form" autocomplete="off">
      <input id="new-name" type="text" name="name" placeholder="Name" required />
      <input id="new-username" type="text" name="username" placeholder="Username" required />
      <input id="new-email" type="email" name="email" placeholder="Email" required />
      <select id="new-role" name="role" required>
        <option value="" disabled selected>Select Role</option>
        <option value="user">User</option>
        <option value="moderator">Moderator</option>
      </select>
      <input id="new-password" type="password" name="password" placeholder="Password" required />
      <input id="confirm-password" type="password" name="confirm" placeholder="Confirm Password" required />
      <button type="submit">Add User</button>
    </form>
    <p id="add-user-msg"></p>
    <div id="add-user-modal" class="modal hidden">
      <div class="modal-content">
        <h4>Confirm New User Details</h4>
        <div id="modal-details"></div>
        <button id="modal-confirm-btn" class="modal-confirm">Confirm</button>
        <button id="modal-cancel-btn" class="modal-cancel">Cancel</button>
      </div>
    </div>
  `;

  // Modal CSS (can add to <head> or main style.css)
  const style = document.createElement('style');
  style.innerHTML = `
    .modal.hidden { display: none; }
    .modal { position: fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(34,39,56,0.38); display:flex; align-items:center; justify-content:center; z-index:9999; }
    .modal-content { background:#fff; border-radius:14px; padding:31px 26px; box-shadow:0 7px 32px #b4c8f344; min-width: 300px; max-width: 94vw;}
    .modal-content h4 { margin-bottom:16px;}
    .modal-content button { margin:12px 9px 0 0; padding:8px 21px; border-radius:8px; border:none; cursor:pointer;}
    .modal-confirm { background: #44b2fa; color:#fff;}
    .modal-cancel { background: #e2e7ee; color:#333;}
  `;
  document.head.appendChild(style);

  const form = container.querySelector('#add-user-form');
  const msg = container.querySelector('#add-user-msg');
  const modal = container.querySelector('#add-user-modal');
  const modalDetails = container.querySelector('#modal-details');
  const modalConfirm = container.querySelector('#modal-confirm-btn');
  const modalCancel = container.querySelector('#modal-cancel-btn');

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    msg.textContent = '';
    const name = form['new-name'].value.trim();
    const username = form['new-username'].value.trim();
    const email = form['new-email'].value.trim();
    const role = form['new-role'].value;
    const password = form['new-password'].value;
    const confirm = form['confirm-password'].value;

    if (password !== confirm) {
      msg.textContent = "Passwords do not match.";
      return;
    }
    if (!name || !username || !email || !role || !password) {
      msg.textContent = "All fields are required.";
      return;
    }
    modalDetails.innerHTML = `
      <div><strong>Name:</strong> ${name}</div>
      <div><strong>Username:</strong> ${username}</div>
      <div><strong>Email:</strong> ${email}</div>
      <div><strong>Role:</strong> ${role.charAt(0).toUpperCase() + role.slice(1)}</div>
    `;
    modal.classList.remove('hidden');
  });

  modalCancel.addEventListener('click', function() {
    modal.classList.add('hidden');
  });

  modalConfirm.addEventListener('click', async function() {
    modal.classList.add('hidden');
    msg.textContent = "";
    showSpinner(container);

    const token = localStorage.getItem('auth_token');
    const body = {
      name: form['new-name'].value.trim(),
      username: form['new-username'].value.trim(),
      email: form['new-email'].value.trim(),
      role: form['new-role'].value,
      password: form['new-password'].value
    };
    try {
      const res = await fetch('https://ad-ad-us.smnglobal.workers.dev/api/add-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) {
        msg.textContent = data.error || "Failed to add user.";
        return;
      }
      msg.textContent = "User added successfully.";
      form.reset();
    } catch (err) {
      msg.textContent = "Error: " + err.message;
    } finally {
      hideSpinner(container);
    }
  });
}
