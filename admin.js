export function showAdminPanel(container) {
  container.innerHTML = `
    <div class="panel">
      <h2>Admin Panel</h2>
      <p>Welcome to the admin dashboard.</p>
      <button onclick="logout()" class="logout-btn">Logout</button>
    </div>
  `;
}
