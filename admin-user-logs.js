// admin-user-logs.js
export function showUserLogs(container) {
  container.innerHTML = `
    <h3>📓 User Logs</h3>
    <ul class="user-log-list" id="user-logs-list">
      <li>
        <span class="log-username">Loading...</span>
        <span class="log-role"></span>
        <span class="log-status"></span>
        <span class="log-lastseen"></span>
      </li>
    </ul>
  `;
}
