export function showUsers(container) {
  container.innerHTML = `
    <h2>User Dashboard</h2>
    <p>Welcome, user!</p>
    <button id="logoutBtn">Logout</button>
  `;

  document.getElementById('logoutBtn').onclick = async () => {
    await fetch('https://lo-ou.smnglobal.workers.dev//api/logout', { method: 'POST', credentials: 'include' });
    window.location.hash = '#login';
  };
}
