import { showSpinner, hideSpinner } from './spinner.js';

const headerLabels = {
  slNo: "Sl. No.",
  plantNo: "Plant No.",
  regNo: "Reg No.",
  description: "Description",
  capacity: "Capacity",
  length: "Length",
  type: "Type",
  owner: "Owner",
  train: "Train",
  location: "Location",
  engineer: "Engineer",
  expiryDate: "Expiry Date",
  status: "Status",
  riggerCHName: "Rigger C/H Name",
  riggerPhNo: "Rigger Ph. No.",
  operatorName: "Operator Name",
  operatorPhNo: "Operator Ph. No."
};

function buildColumns(rawCols, type = "crane") {
  let cols = rawCols.filter(c =>
    c !== 'updaterUsername' && c !== 'createdAt' && c !== 'updatedAt'
  );
  if (!cols.includes('expiryDate')) cols.push('expiryDate');
  if (!cols.includes('riggerCHName')) cols.push('riggerCHName');
  if (!cols.includes('riggerPhNo')) cols.push('riggerPhNo');
  if (cols[0] !== 'slNo') cols.unshift('slNo');

  if (type === "crane") {
    let idxEng = cols.indexOf('engineer');
    let arr = cols.filter(c => !['expiryDate', 'status', 'riggerCHName', 'riggerPhNo'].includes(c));
    arr.splice(idxEng + 1, 0, 'expiryDate');
    arr.splice(idxEng + 2, 0, 'status');
    arr.splice(idxEng + 3, 0, 'riggerCHName', 'riggerPhNo');
    return arr;
  }
  if (type === "manlift") {
    let idxEng = cols.indexOf('engineer');
    let arr = cols.filter(c => !['expiryDate', 'status'].includes(c));
    arr.splice(idxEng + 1, 0, 'expiryDate');
    arr.splice(idxEng + 2, 0, 'status');
    return arr;
  }
  return cols;
}

export function showEquipEdit(container) {
  container.innerHTML = `
    <div class="demo-card">
      <h3>✏️ Edit Equipment</h3>
      <div style="margin-bottom:0.8em;">
        <select id="equipEditSelect" style="font-size:1.08em;padding:6px 13px 6px 8px;min-width:110px;">
          <option value="crane">Crane Equipment</option>
          <option value="manlift">Manlift Equipment</option>
        </select>
        <span id="edit-equip-count" style="color:#0079bb;font-weight:700;font-size:1em;margin-left:1.5em;"></span>
        <span id="edit-status-msg" style="margin-left:2em;color:#a06102;font-size:0.97em;"></span>
      </div>
      <div id="edit-table-container"></div>
      <div id="edit-modal-bg" style="display:none;position:fixed;z-index:99;top:0;left:0;width:100vw;height:100vh;background:#0008;">
        <div id="edit-modal" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:#fff;padding:2em 2em 1.5em 2em;border-radius:12px;min-width:330px;max-width:99vw;box-shadow:0 2px 38px #0032;overflow-x:auto;">
          <div style="width:100%;overflow-x:auto;">
            <div id="edit-modal-content"></div>
          </div>
          <div style="text-align:right;margin-top:18px;white-space:nowrap;">
            <button id="edit-save-btn" style="font-size:1.07em;margin-right:13px;background:#2359af;color:#fff;padding:6px 22px;border:none;border-radius:6px;">Save</button>
            <button id="edit-cancel-btn" style="font-size:1.07em;margin-right:13px;">Cancel</button>
            <button id="edit-delete-btn" style="font-size:1.07em;color:#fff;background:#c11;padding:6px 22px;border:none;border-radius:6px;">Delete</button>
          </div>
        </div>
      </div>
      <div id="confirm-modal-bg" style="display:none;position:fixed;z-index:100;top:0;left:0;width:100vw;height:100vh;background:#0009;">
        <div id="confirm-modal" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:#fff;padding:2.2em 2em 1.6em 2em;border-radius:12px;min-width:315px;max-width:95vw;box-shadow:0 2px 38px #0033;">
          <div id="confirm-modal-content"></div>
          <div style="text-align:right;margin-top:14px;">
            <button id="confirm-btn" style="font-size:1em;margin-right:16px;background:#136320;color:#fff;padding:5px 19px;border:none;border-radius:6px;">Confirm</button>
            <button id="cancel-btn" style="font-size:1em;">Cancel</button>
          </div>
        </div>
      </div>
      <p class="demo-txt">Edit modal disables Plant No and Reg No. All changes go by id and regNo; confirmation before saving/deleting.</p>
    </div>
  `;

  const select = container.querySelector('#equipEditSelect');
  const editTableDiv = container.querySelector('#edit-table-container');
  const modalBg = container.querySelector('#edit-modal-bg');
  const modalContent = container.querySelector('#edit-modal-content');
  const saveBtn = container.querySelector('#edit-save-btn');
  const cancelBtn = container.querySelector('#edit-cancel-btn');
  const deleteBtn = container.querySelector('#edit-delete-btn');
  const countSpan = container.querySelector('#edit-equip-count');
  const statusSpan = container.querySelector('#edit-status-msg');

  // Confirmation modal
  const confirmBg = container.querySelector('#confirm-modal-bg');
  const confirmContent = container.querySelector('#confirm-modal-content');
  const confirmBtn = container.querySelector('#confirm-btn');
  const cancelConfirmBtn = container.querySelector('#cancel-btn');

  let allRows = [], columns = [], equipType = "crane", filteredRows = [], filterValues = {}, editingRow = null;

  select.addEventListener('change', loadTable);
  loadTable();

  function loadTable() {
    equipType = select.value;
    allRows = [];
    columns = [];
    filterValues = {};
    editTableDiv.innerHTML = "Loading...";
    statusSpan.textContent = "";
    fetch(`https://ad-eq-li.smnglobal.workers.dev/api/equipment-list?type=${equipType}`, {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('auth_token') }
    })
    .then(r => r.json())
    .then(data => {
      if (!data.success) throw new Error(data.error || "Failed to fetch.");
      columns = buildColumns(data.columns, equipType);
      // id is included from backend (but NOT displayed)
      allRows = data.rows.map((r, i) => ({...r, slNo: i + 1}));
      filteredRows = [...allRows];
      renderTable();
      countSpan.textContent = `Rows: ${filteredRows.length} of ${allRows.length}`;
    })
    .catch(() => {
      editTableDiv.innerHTML = `<div style="color:#d00;font-weight:500;">Fetch failed.</div>`;
    });
  }

  function renderTable() {
    filteredRows = allRows.filter(row =>
      columns.every(col =>
        !filterValues[col] ||
        (row[col] ?? "").toString().toLowerCase().includes(filterValues[col].toLowerCase())
      )
    );
    countSpan.textContent = `Rows: ${filteredRows.length} of ${allRows.length}`;
    editTableDiv.innerHTML = `
      <div style="overflow-x:auto;">
        <table class="equip-list-table">
          <thead>
            <tr>${columns.map(c => `<th>${headerLabels[c] || c}</th>`).join('')}<th>Edit</th></tr>
            <tr>${columns.map(col =>
              `<th><input data-col="${col}" type="text" class="edit-filter" value="${filterValues[col] || ""}" placeholder="Filter..." style="width:98%;padding:3px;"/> </th>`
            ).join('')}<th></th></tr>
          </thead>
          <tbody>
            ${filteredRows.map((row, rowIdx) =>
              `<tr data-row="${rowIdx}">
                ${columns.map(col => `<td>${row[col] ?? ""}</td>`).join('')}
                <td><button class="editRowBtn" data-row="${rowIdx}">Edit</button></td>
              </tr>`
            ).join('')}
          </tbody>
        </table>
      </div>
    `;
    editTableDiv.querySelectorAll('.edit-filter').forEach(inp => {
      inp.oninput = e => {
        filterValues[inp.dataset.col] = inp.value;
        renderTable();
      };
    });
    attachRowEditHandlers();
  }

  function attachRowEditHandlers() {
    editTableDiv.querySelectorAll('.editRowBtn').forEach(btn => {
      btn.onclick = () => {
        const rowIdx = +btn.dataset.row;
        editingRow = filteredRows[rowIdx];
        showEditModal(editingRow);
      };
    });
  }

  function showEditModal(row) {
    // Keep `id` as a JS property, never shown
    const lockedCols = ['plantNo','regNo'];
    const editableCols = columns.filter(c => !lockedCols.includes(c) && c !== 'slNo');
    modalContent.innerHTML = `
      <div style="overflow-x:auto;">
        <table style="min-width:700px;width:100%;margin-bottom:1.3em;">
          <tr>
            ${columns.map(col => `<th style="text-align:left;font-weight:600;">${headerLabels[col] || col}</th>`).join('')}
          </tr>
          <tr>
            ${columns.map(col =>
              `<td>${
                lockedCols.includes(col)
                  ? `<input type="text" value="${row[col] ?? ''}" readonly style="background:#f8f9fc;color:#919;min-width:105px;"/>`
                  : `<input type="text" id="edit-input-${col}" value="${row[col] ?? ''}" style="min-width:105px;max-width:300px;"/>`
              }</td>`
            ).join('')}
          </tr>
        </table>
      </div>
    `;
    modalBg.style.display = "block";

    saveBtn.onclick = () => {
      const newRow = {...row};
      editableCols.forEach(col => {
        newRow[col] = modalContent.querySelector(`#edit-input-${col}`).value;
      });
      const changedCols = editableCols.filter(col => String(row[col] ?? '') !== String(newRow[col] ?? ''));
      if (changedCols.length === 0) {
        modalBg.style.display = "none";
        statusSpan.textContent = "No changes made.";
        return;
      }
      modalBg.style.display = "none";
      showConfirmModal(
        `<div style="margin-bottom:1em;">Confirm update for Reg No: <b>${row.regNo}</b>?</div>
         <table style="min-width:350px;max-width:100%;margin-bottom:12px;">
          <tr><th>Column</th><th>Old Value</th><th>New Value</th></tr>
          ${changedCols.map(col =>
            `<tr>
              <td style="font-weight:600;">${headerLabels[col] || col}</td>
              <td>${row[col] === "" ? "<i>&nbsp;</i>" : row[col]}</td>
              <td style="color:#2359af;">${newRow[col] === "" ? "<i>&nbsp;</i>" : newRow[col]}</td>
            </tr>`
          ).join('')}
         </table>
        `,
        () => {
          const idx = allRows.findIndex(r => r.id == row.id && r.regNo == row.regNo);
          if (idx >= 0) allRows[idx] = {...row, ...newRow};
          renderTable();
          statusSpan.textContent = "Saving...";
          fetch('https://ad-eq-ed.smnglobal.workers.dev/api/equipment-edit', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
            },
            body: JSON.stringify({
              equipmentType: equipType,
              id: row.id,
              regNo: row.regNo,
              updates: editableCols.reduce((obj, col) => {
                if (row[col] !== newRow[col]) obj[col] = newRow[col];
                return obj;
              }, {})
            })
          })
          .then(r => r.json())
          
         .then(async res => {
  if (!res.success) {
    statusSpan.textContent = "Save failed! " + (res.error || "");
    alert("Backend error: " + (res.error || "unknown"));
    return;
  }
  statusSpan.textContent = "Saved.";
})
        }
      );
    };

    cancelBtn.onclick = () => { modalBg.style.display = "none"; };
    deleteBtn.onclick = () => {
      modalBg.style.display = "none";
      showConfirmModal(
        `<div style="margin-bottom:1em;">Are you sure to delete Reg No: <b>${row.regNo}</b>?</div>
         <table style="min-width:350px;max-width:100%;margin-bottom:12px;">
          <tr>${columns.map(c => `<th>${headerLabels[c] || c}</th>`).join('')}</tr>
          <tr>${columns.map(col => `<td>${row[col] ?? ''}</td>`).join('')}</tr>
         </table>
        `,
        () => {
          statusSpan.textContent = "Deleting...";
          fetch('https://ad-eq-ed.smnglobal.workers.dev/api/equipment-delete', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
            },
            body: JSON.stringify({ equipmentType: equipType, id: row.id, regNo: row.regNo })
          })
          .then(r => r.json())
          .then(res => {
            if (!res.success) throw new Error(res.error);
            allRows = allRows.filter(r => r.id != row.id);
            renderTable();
            statusSpan.textContent = "Deleted.";
          })
          .catch(() => {
            statusSpan.textContent = "Delete failed!";
          });
        }
      );
    };
  }

  function showConfirmModal(html, onConfirm) {
    confirmContent.innerHTML = html;
    confirmBg.style.display = "block";
    confirmBtn.onclick = () => {
      confirmBg.style.display = "none";
      onConfirm();
    };
    cancelConfirmBtn.onclick = () => { confirmBg.style.display = "none"; };
  }
}