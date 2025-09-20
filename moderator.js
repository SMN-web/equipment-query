export function showModeratorPanel(container) {
  container.innerHTML = `
    <h2>Moderator Panel</h2>
    <p>Welcome, moderator!</p>
    <button id="logoutBtn">Logout</button>
  `;

  document.getElementById('logoutBtn').onclick = async () => {
    await fetch('https://lo-ou.smnglobal.workers.dev/api/logout', { method: 'POST', credentials: 'include' });
    window.location.hash = '#login';
  };
}
