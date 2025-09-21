export function showModeratorManliftSection(container) {
  container.innerHTML = `
    <div class="sub-tab-buttons">
      <button data-target="manlift-status-sub" class="manlift-subtab active">📊 Status</button>
      <button data-target="manlift-location-sub" class="manlift-subtab">📍 Location</button>
      <button data-target="manlift-banksman-sub" class="manlift-subtab">🪙 Banksman</button>
    </div>
    <div id="moderator-manlift-content"></div>
  `;
  loadManliftSubsection('manlift-status-sub', container);
  container.querySelectorAll('.manlift-subtab').forEach(btn => {
    btn.addEventListener('click', function() {
      container.querySelectorAll('.manlift-subtab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      loadManliftSubsection(btn.getAttribute('data-target'), container);
    });
  });
}

function loadManliftSubsection(subsection, container) {
  const contentDiv = container.querySelector('#moderator-manlift-content');
  if (subsection === 'manlift-status-sub') {
    import('./moderator-manlift-status.js').then(m => m.showManliftStatus(contentDiv));
  } else if (subsection === 'manlift-location-sub') {
    import('./moderator-manlift-location.js').then(m => m.showManliftLocation(contentDiv));
  } else if (subsection === 'manlift-banksman-sub') {
    import('./moderator-manlift-banksman.js').then(m => m.showManliftBanksman(contentDiv));
  }
}
