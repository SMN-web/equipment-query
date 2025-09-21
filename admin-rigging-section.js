export function showAdminRiggingSection(container) {
  container.innerHTML = `
    <div class="sub-tab-buttons">
      <button data-target="rigging-details" class="rigging-subtab active">📄 Rigging Details</button>
      <button data-target="rigging-logs" class="rigging-subtab">📓 Rigging Logs</button>
    </div>
    <div id="admin-rigging-content"></div>
  `;
  loadRiggingSubsection('rigging-details', container);
  container.querySelectorAll('.rigging-subtab').forEach(btn => {
    btn.addEventListener('click', function() {
      container.querySelectorAll('.rigging-subtab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      loadRiggingSubsection(btn.getAttribute('data-target'), container);
    });
  });
}

function loadRiggingSubsection(subsection, container) {
  const contentDiv = container.querySelector('#admin-rigging-content');
  if (subsection === 'rigging-details') {
    import('./admin-rigging-details.js').then(m => m.showRiggingDetails(contentDiv));
  } else if (subsection === 'rigging-logs') {
    import('./admin-rigging-logs.js').then(m => m.showRiggingLogs(contentDiv));
  }
}
