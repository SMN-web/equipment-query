export function showRiggingLogs(container) {
  container.innerHTML = `
    <div class="demo-card">
      <h3>📓 Rigging Logs</h3>
      <ul>
        <li>Log Entry #1 (demo content)</li>
        <li>Log Entry #2 (demo content)</li>
        <li>...</li>
      </ul>
      <p class="demo-txt">Audit logs, changes, and actions will be listed here.</p>
    </div>
  `;
}
