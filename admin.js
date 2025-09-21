export function showAdminPanel(container) {
  container.innerHTML = `
    <div id="admin-panel" class="panel">
      <h2>👑 Admin Dashboard</h2>
      <p id="admin-msg"></p>
      <button class="logout-btn" onclick="logout()">Logout</button>
      <div class="main-tab-buttons">
        <button data-main="user-section" class="main-tab active">👥 Users</button>
        <button data-main="equipment-section" class="main-tab">🛠 Equipment</button>
        <button data-main="rigging-section" class="main-tab">🪝 Rigging</button>
      </div>
      <div id="admin-main-content"></div>
    </div>
  `;

  function sendHeartbeat(token) {
    if (!token) return;
    fetch("https://he-be.smnglobal.workers.dev/api/heartbeat", {
      method: "POST",
      headers: { "Authorization": "Bearer " + token }
    })
    .then(res => res.json())
    .then(data => {
      if (!data.ok) console.error("Heartbeat error:", data.error || data);
      else console.log("Heartbeat success");
    }).catch(err => console.error("Heartbeat network error:", err));
  }

  const token = localStorage.getItem("auth_token");
  // Send heartbeat immediately on panel load
  sendHeartbeat(token);

  // Send heartbeat every 60 seconds while admin panel is loaded
  const heartbeatInterval = setInterval(() => sendHeartbeat(token), 60000);

  // Clear heartbeat on logout or when navigating away, if needed
  window.addEventListener("logout", () => clearInterval(heartbeatInterval));
  // Optionally, tie cleanup to some SPA navigation event if present

  // ... Tab logic as before ...
  loadAdminSubSection('user-section', container);
  container.querySelectorAll('.main-tab').forEach(btn => {
    btn.addEventListener('click', function() {
      container.querySelectorAll('.main-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const section = btn.getAttribute('data-main');
      loadAdminSubSection(section, container);
    });
  });
}

function loadAdminSubSection(section, container) {
  const contentDiv = container.querySelector('#admin-main-content');
  if (section === 'user-section') {
    import('./admin-user-section.js').then(m => m.showAdminUserSection(contentDiv));
  } else if (section === 'equipment-section') {
    import('./admin-equipment-section.js').then(m => m.showAdminEquipmentSection(contentDiv));
  } else if (section === 'rigging-section') {
    import('./admin-rigging-section.js').then(m => m.showAdminRiggingSection(contentDiv));
  }
}
