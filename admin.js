export function renderAdmin(container, user) {
  container.innerHTML = `
    <div class="panel"export function showAdminPanel(container) {
  container.innerHTML = `
    <h2>Admin Panel</h2>
    <p>Welcome, admin!</p>
    <button id="logoutBtn">Logout</button>
  `;

  document.getElementById('logoutBtn').onclick = async () => {
    await fetch('https://lo-ou.smnglobal.workers.dev/api/logout', { method: 'POST', credentials: 'include' });
    window.location.hash = '#login';
  };
}
 id="admin-panel">
      <h2>👑 Admin Dashboard</h2>
      <button id="logout-btn">Logout</button>

      <div class="main-tab-buttons">
        <button data-main="user-section" class="main-tab active">Users</button>
        <button data-main="equipment-section" class="main-tab">Equipment</button>
        <button data-main="rigging-section" class="main-tab">Rigging</button>
      </div>

      <div id="user-section" class="main-section">User Section Content</div>
      <div id="equipment-section" class="main-section hidden">Equipment Section Content</div>
      <div id="rigging-section" class="main-section hidden">Rigging Section Content</div>
    </div>
  `;

  // Tab switching
  const tabs = container.querySelectorAll('.main-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      container.querySelectorAll('.main-section').forEach(sec => sec.classList.add('hidden'));
      container.querySelector(`#${tab.dataset.main}`).classList.remove('hidden');
    });
  });

  // Logout
  container.querySelector('#logout-btn').addEventListener('click', async () => {
    await window.firebaseAuth.signOut();
  });
}