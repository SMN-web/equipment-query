export function showUsers(container) {
  container.innerHTML = `
    <div id="user-panel" class="panel">
      <h2>👤 User Dashboard</h2>
      <p>Welcome, <span id="user-email"></span>.</p>
      <button class="logout-btn" onclick="logout()">Logout</button>
    </div>
  `;
  // Add user email display logic if you store it in session/user info
}
