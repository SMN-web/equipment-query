export function renderUser(container, user) {
  container.innerHTML = `
    <div class="panel" id="user-panel">
      <h2>👤 User Dashboard</h2>
      <p>Welcome, <span id="user-email">${user.email}</span>.</p>
      <button id="logout-btn">Logout</button>

      <!-- Example content -->
      <div class="main-section">
        <p>Here you can view your assigned equipment, reports, or logs.</p>
      </div>
    </div>
  `;

  // Logout
  container.querySelector('#logout-btn').addEventListener('click', async () => {
    await window.firebaseAuth.signOut();
  });
}