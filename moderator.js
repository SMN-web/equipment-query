export function showModeratorPanel(container) {
  container.innerHTML = `
    <div class="panel">
      <h2>Moderator Panel</h2>
      <p>Welcome to the moderator dashboard.</p>
      <button onclick="logout()" class="logout-btn">Logout</button>
    </div>
  `;
}
