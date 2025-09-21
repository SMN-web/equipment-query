export function showEquipDashboard(container) {
  container.innerHTML = `
    <div class="demo-card">
      <h3>📊 Equipment Dashboard</h3>
      <ul>
        <li>Crane Count: <span class="stat">12</span></li>
        <li>Manlift Count: <span class="stat">9</span></li>
        <li>Available: <span class="stat">16</span></li>
        <li>Under Repair: <span class="stat">3</span></li>
      </ul>
      <p class="demo-txt">Summary stats and visualizations will show here.</p>
    </div>
  `;
}
