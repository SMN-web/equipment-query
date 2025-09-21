export function showUsers(container) {
  container.innerHTML = `
    <div class="panel">
      <h2>User Panel</h2>
      <p>Welcome to the user dashboard.</p>
      <button onclick="logout()" class="logout-btn">Logout</button>
    </div>
  `;
}
