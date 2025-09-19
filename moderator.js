export function renderModerator(container, user) {
  container.innerHTML = `
    <div class="panel" id="moderator-panel">
      <h2>🛡 Moderator Dashboard</h2>
      <p>Welcome, <span id="moderator-email">${user.email}</span>.</p>
      <button id="logout-btn">Logout</button>

      <!-- Main Tabs -->
      <div class="main-tab-buttons">
        <button data-main="moderator-crane-section" class="main-tab active">🚧 Crane</button>
        <button data-main="moderator-manlift-section" class="main-tab">🛗 Manlift</button>
      </div>

      <!-- Sections -->
      <div id="moderator-crane-section" class="main-section">
        <p>Crane management and status forms go here.</p>
      </div>
      <div id="moderator-manlift-section" class="main-section hidden">
        <p>Manlift management and status forms go here.</p>
      </div>
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