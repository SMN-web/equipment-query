export function showAdminEquipmentSection(container) {
  container.innerHTML = `
    <div class="sub-tab-buttons">
      <button data-target="equip-dashboard" class="equip-subtab active">📊 Dashboard</button>
      <button data-target="equip-upload" class="equip-subtab">⬆ Upload</button>
      <button data-target="equip-list" class="equip-subtab">📋 List</button>
      <button data-target="equip-edit" class="equip-subtab">✏️ Edit</button>
      <button data-target="equip-control" class="equip-subtab">⚙ Control</button>
    </div>
    <div id="admin-equipment-content"></div>
  `;
  loadEquipSubsection('equip-dashboard', container);
  container.querySelectorAll('.equip-subtab').forEach(btn => {
    btn.addEventListener('click', function() {
      container.querySelectorAll('.equip-subtab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      loadEquipSubsection(btn.getAttribute('data-target'), container);
    });
  });
}

function loadEquipSubsection(subsection, container) {
  const contentDiv = container.querySelector('#admin-equipment-content');
  if (subsection === 'equip-dashboard') {
    import('./admin-equip-dashboard.js').then(m => m.showEquipDashboard(contentDiv));
  } else if (subsection === 'equip-upload') {
    import('./admin-equip-upload.js').then(m => m.showEquipUpload(contentDiv));
  } else if (subsection === 'equip-list') {
    import('./admin-equip-list.js').then(m => m.showEquipList(contentDiv));
  } else if (subsection === 'equip-edit') {
    import('./admin-equip-edit.js').then(m => m.showEquipEdit(contentDiv));
  } else if (subsection === 'equip-control') {
    import('./admin-equip-control.js').then(m => m.showEquipControl(contentDiv));
  }
}
