export function showModeratorPanel(container) {
  container.innerHTML = `
    <div id="moderator-panel" class="panel">
      <h2>🛡 Moderator Dashboard</h2>
      <p>Welcome, <span id="moderator-email"></span>.</p>
      <button class="logout-btn" onclick="logout()">Logout</button>
      <div class="main-tab-buttons">
        <button data-main="moderator-crane-section" class="main-tab active">🚧 Crane</button>
        <button data-main="moderator-manlift-section" class="main-tab">🛗 Manlift</button>
      </div>
      <div id="moderator-main-content"></div>
    </div>
  `;
  loadModeratorSection('moderator-crane-section', container);
  container.querySelectorAll('.main-tab').forEach(btn => {
    btn.addEventListener('click', function() {
      container.querySelectorAll('.main-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      loadModeratorSection(btn.getAttribute('data-main'), container);
    });
  });
}

function loadModeratorSection(section, container) {
  const mainContent = container.querySelector('#moderator-main-content');
  if (section === 'moderator-crane-section') {
    import('./moderator-crane-section.js').then(m => m.showModeratorCraneSection(mainContent));
  } else if (section === 'moderator-manlift-section') {
    import('./moderator-manlift-section.js').then(m => m.showModeratorManliftSection(mainContent));
  }
}
