export function showAdminUserSection(container) {
  container.innerHTML = `
    <div class="sub-tab-buttons">
      <button data-target="add-user-sub" class="user-subtab active">➕ Add User</button>
      <button data-target="user-control-sub" class="user-subtab">🧑‍💼 User Control</button>
      <button data-target="user-logs-sub" class="user-subtab">📓 User Logs</button>
    </div>
    <div id="admin-user-content"></div>
  `;

  // Load default subtab
  loadUserSubsection('add-user-sub', container);

  // Subtab switching
  container.querySelectorAll('.user-subtab').forEach(btn => {
    btn.addEventListener('click', function() {
      container.querySelectorAll('.user-subtab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      loadUserSubsection(btn.getAttribute('data-target'), container);
    });
  });
}

function loadUserSubsection(subsection, container) {
  const contentDiv = container.querySelector('#admin-user-content');
  if (subsection === 'add-user-sub') {
    import('./admin-add-user.js').then(m => m.showAddUser(contentDiv));
  } else if (subsection === 'user-control-sub') {
    import('./admin-user-control.js').then(m => m.showUserControl(contentDiv));
  } else if (subsection === 'user-logs-sub') {
    import('./admin-user-logs.js').then(m => m.showUserLogs(contentDiv));
  }
}
