export function showModeratorCraneSection(container) {
  container.innerHTML = `
    <div class="sub-tab-buttons">
      <button data-target="crane-status-sub" class="crane-subtab active">📊 Status</button>
      <button data-target="crane-location-sub" class="crane-subtab">📍 Location</button>
      <button data-target="crane-rigger-sub" class="crane-subtab">🪝 Rigger</button>
    </div>
    <div id="moderator-crane-content"></div>
  `;
  loadCraneSubsection('crane-status-sub', container);
  container.querySelectorAll('.crane-subtab').forEach(btn => {
    btn.addEventListener('click', function() {
      container.querySelectorAll('.crane-subtab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      loadCraneSubsection(btn.getAttribute('data-target'), container);
    });
  });
}

function loadCraneSubsection(subsection, container) {
  const contentDiv = container.querySelector('#moderator-crane-content');
  if (subsection === 'crane-status-sub') {
    import('./moderator-crane-status.js').then(m => m.showCraneStatus(contentDiv));
  } else if (subsection === 'crane-location-sub') {
    import('./moderator-crane-location.js').then(m => m.showCraneLocation(contentDiv));
  } else if (subsection === 'crane-rigger-sub') {
    import('./moderator-crane-rigger.js').then(m => m.showCraneRigger(contentDiv));
  }
}
