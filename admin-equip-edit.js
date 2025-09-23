import { showSpinner, hideSpinner } from './spinner.js';

// --- Labels & Column Logic ---
const headerLabels = {
  slNo: "Sl. No.", plantNo: "Plant No.", regNo: "Reg No.", description: "Description",
  capacity: "Capacity", length: "Length", type: "Type", owner: "Owner",
  train: "Train", location: "Location", engineer: "Engineer", expiryDate: "Expiry Date",
  status: "Status", riggerCHName: "Rigger C/H Name", riggerPhNo: "Rigger Ph. No.",
  operatorName: "Operator Name", operatorPhNo: "Operator Ph. No."
};

function buildColumns(rawCols, type = "crane") {
  let cols = rawCols.filter(c => !['updaterUsername','createdAt','updatedAt'].includes(c));
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
      <div class="equip-list-toolbar">
        <select id="equipEditSelect" class="equip-table-selector">
          <option value="crane">Crane Equipment</option>
          <option value="manlift">Manlift Equipment</option>
        </select>
        <span class="equip-filtered-count" id="equipFilteredCount"></span>
        <span class="equip-row-count-info" id="equipRowCountInfo"></span>
        <button id="edit-clear-filters-btn">Clear Filters</button>
      </div>
      <div class="equip-table-container" id="edit-table-container"></div>
      <div id="edit-modal-bg" style="display:none;position:fixed;z-index:99;top:0;left:0;width:100vw;height:100vh;background:#0008;">
        <div id="edit-modal" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:#fff;padding:2em 2em 2.5em 2em;border-radius:12px;min-width:340px;max-width:99vw;min-height:390px;overflow-x:auto;">
          <div style="width:100%;overflow-x:auto;"><div id="edit-modal-content"></div></div>
          <div class="equip-modal-actions" style="text-align:center;margin-top:18px;">
            <button id="edit-save-btn" style="background:#2359af;color:#fff;font-size:1.1em;padding:9px 22px;margin:0 14px;border-radius:6px;border:none;">Save</button>
            <button id="edit-cancel-btn" style="background:#197ac8;color:#fff;font-size:1.1em;padding:9px 22px;margin:0 14px;border-radius:6px;border:none;">Cancel</button>
            <button id="edit-delete-btn" style="background:#c70b18;color:#fff;font-size:1.07em;padding:9px 22px;margin:0 14px;border-radius:6px;border:none;">Delete</button>
          </div>
        </div>
      </div>
      <div id="confirm-modal-bg" style="display:none;position:fixed;z-index:100;top:0;left:0;width:100vw;height:100vh;background:#0009;">
        <div id="confirm-modal" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:#fff;padding:2.2em 2em 1.6em 2em;border-radius:12px;min-width:315px;max-width:95vw;">
          <div id="confirm-modal-content"></div>
          <div style="text-align:center;margin-top:14px;">
            <button id="confirm-btn" style="background:#136320;color:#fff;font-size:1em;padding:7px 19px;margin:0 17px;border-radius:6px;border:none;">Confirm</button>
            <button id="cancel-btn" style="background:#d4e2ff;font-size:1em;padding:7px 19px;margin:0 17px;border-radius:6px;border:none;">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // ------ DOM Refs ------
  const select = container.querySelector("#equipEditSelect");
  const clearFiltersBtn = container.querySelector("#edit-clear-filters-btn");
  const editTableDiv = container.querySelector("#edit-table-container");
  const equipFilteredCount = container.querySelector("#equipFilteredCount");
  const equipRowCountInfo = container.querySelector("#equipRowCountInfo");
  const modalBg = container.querySelector('#edit-modal-bg');
  const modalContent = container.querySelector('#edit-modal-content');
  const saveBtn = container.querySelector('#edit-save-btn');
  const cancelBtn = container.querySelector('#edit-cancel-btn');
  const deleteBtn = container.querySelector('#edit-delete-btn');
  const confirmBg = container.querySelector('#confirm-modal-bg');
  const confirmContent = container.querySelector('#confirm-modal-content');
  const confirmBtn = container.querySelector('#confirm-btn');
  const cancelConfirmBtn = container.querySelector('#cancel-btn');

  let equipType = "crane", allRows = [], columns = [], filteredRows = [], filterValues = {}, highlightedRow = null;
  let lastFilterFocus = null;  // for keyboard focus

  select.onchange = loadTable;
  clearFiltersBtn.onclick = () => { filterValues = {}; renderTable(); };

  loadTable();

  function loadTable() {
    equipType = select.value;
    showSpinner();
    fetch(`https://ad-eq-li.smnglobal.workers.dev/api/equipment-list?type=${equipType}`).then(r => r.json()).then(data => {
      hideSpinner();
      columns = buildColumns(data.columns, equipType);
      allRows = data.rows.map((r,i)=>({...r,slNo:i+1}));
      renderTable();
    });
  }

  function renderTable() {
    filteredRows = allRows.filter(row =>
      columns.every(col => !filterValues[col] || (row[col]||"").toLowerCase().includes(filterValues[col].toLowerCase()))
    );
    equipFilteredCount.textContent = filteredRows.length;
    equipRowCountInfo.textContent = `Rows: ${filteredRows.length} of ${allRows.length}`;

    const filterRow = columns.map(col => `<th><input class="column-filter" data-col="${col}" value="${filterValues[col]||""}" placeholder="Filter..." /></th>`).join('') + '<th></th>';
    editTableDiv.innerHTML = `
      <table class='equip-list-table'>
        <thead>
          <tr>${columns.map(c => `<th>${headerLabels[c] || c}</th>`).join('')}<th>Edit</th></tr>
          <tr>${filterRow}</tr>
        </thead>
        <tbody>
          ${filteredRows.map((row, rowIdx) =>
            `<tr data-row="${rowIdx}" class="${rowIdx===highlightedRow?'highlight-row':''}">
              ${columns.map(col => `<td>${row[col]??""}</td>`).join('')}
              <td><button class="editRowBtn" data-row="${rowIdx}">Edit</button></td>
            </tr>`
          ).join('')}
        </tbody>
      </table>
    `;

    // --- Filter focus logic ---
    const filterInputs = [...editTableDiv.querySelectorAll('.column-filter')];
    filterInputs.forEach(inp => {
      inp.oninput = e => {
        filterValues[inp.dataset.col] = inp.value;
        lastFilterFocus = { col: inp.dataset.col, pos: inp.selectionStart };
        renderTable();
      };
      inp.onfocus = () => { lastFilterFocus = { col: inp.dataset.col, pos: inp.selectionStart }; };
      inp.onblur = () => {};
    });
    if (lastFilterFocus) {
      const el = filterInputs.find(i => i.dataset.col === lastFilterFocus.col);
      if (el) {
        el.focus();
        if (typeof lastFilterFocus.pos === "number") el.setSelectionRange(lastFilterFocus.pos, lastFilterFocus.pos);
      }
    }
    document.addEventListener("mousedown", e => {
      if (!e.target.classList.contains("column-filter")) lastFilterFocus = null;
    }, {once: true});
    document.addEventListener("touchstart", e => {
      if (!e.target.classList.contains("column-filter")) lastFilterFocus = null;
    }, {once: true});

    // --- Row highlight ---
    editTableDiv.querySelectorAll('tbody tr').forEach(tr => {
      tr.onclick = function(e){
        if (!e.target.closest('button')) {
          highlightedRow = +tr.dataset.row;
          renderTable();
        }
      };
    });
    attachRowEditHandlers();
  }

  function attachRowEditHandlers() {
    editTableDiv.querySelectorAll('.editRowBtn').forEach(btn => {
      btn.onclick = () => {
        const rowIdx = +btn.dataset.row;
        showEditModal(filteredRows[rowIdx]);
      };
    });
  }

  function showEditModal(row) {
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
                  ? `<input type="text" value="${row[col] ?? ''}" readonly style="background:#f8f9fc;color:#919;min-width:98px;max-width:180px;"/>`
                  : `<input type="text" id="edit-input-${col}" value="${row[col] ?? ''}" style="min-width:98px;max-width:290px;"/>`
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
          .then(res => { if (res.success) loadTable(); });
        }
      );
    };
    cancelBtn.onclick = () => { modalBg.style.display = "none"; renderTable(); };
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
          fetch('https://ad-eq-ed.smnglobal.workers.dev/api/equipment-delete', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
            },
            body: JSON.stringify({ equipmentType: equipType, id: row.id, regNo: row.regNo })
          })
          .then(r => r.json())
          .then(res => { if (res.success) loadTable(); });
        }
      );
    };
  }

  function showConfirmModal(html, onConfirm) {
    confirmContent.innerHTML = html;
    confirmBg.style.display = "block";
    confirmBtn.onclick = () => { confirmBg.style.display = "none"; onConfirm(); };
    cancelConfirmBtn.onclick = () => { confirmBg.style.display = "none"; };
  }
}