export function showAdminEquipmentSection(container) {
  container.innerHTML = `
    <div class="sub-tab-buttons">
      <button data-target="equip-dashboard" class="equip-subtab active">📊 Dashboard</button>
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
  } else if (subsection === 'equip-control') {
    // Show the secondary sub-tabs for control functions and load the default subsub-section
    contentDiv.innerHTML = `
      <div class="equip-control-subtabs">
        <button data-subsub="equip-upload" class="equip-control-subtab active">⬆ Upload</button>
        <button data-subsub="equip-list" class="equip-control-subtab">📋 List</button>
        <button data-subsub="equip-edit" class="equip-control-subtab">✏️ Edit</button>
      </div>
      <div id="admin-equipment-control-content"></div>
    `;
    loadEquipControlSubsection('equip-upload', contentDiv);
    contentDiv.querySelectorAll('.equip-control-subtab').forEach(btn => {
      btn.addEventListener('click', function() {
        contentDiv.querySelectorAll('.equip-control-subtab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        loadEquipControlSubsection(btn.getAttribute('data-subsub'), contentDiv);
      });
    });
  }
}

function loadEquipControlSubsection(subsubsection, parentContentDiv) {
  const controlContentDiv = parentContentDiv.querySelector('#admin-equipment-control-content');
  if (subsubsection === 'equip-upload') {
    import('./admin-equip-upload.js').then(m => m.showEquipUpload(controlContentDiv));
  } else if (subsubsection === 'equip-list') {
    import('./admin-equip-list.js').then(m => m.showEquipList(controlContentDiv));
  } else if (subsubsection === 'equip-edit') {
    import('./admin-equip-edit.js').then(m => m.showEquipEdit(controlContentDiv));
  }
}
