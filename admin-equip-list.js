import { showSpinner, hideSpinner } from './spinner.js';

// Column label mapping
const headerLabels = {
  "slNo": "Sl. No.",
  "plantNo": "Plant No.",
  "regNo": "Reg No.",
  "description": "Description",
  "capacity": "Capacity",
  "length": "Length",
  "type": "Type",
  "owner": "Owner",
  "train": "Train",
  "location": "Location",
  "engineer": "Engineer",
  "expiryDate": "Expiry Date",
  "status": "Status",
  "riggerCHName": "Rigger C/H Name",
  "riggerPhNo": "Rigger Ph. No.",
  "operatorName": "Operator Name",
  "operatorPhNo": "Operator Ph. No.",
  "createdAt": "Created At",
  "updatedAt": "Updated At",
  "updaterName": "Updated By"
};

function buildColumns(rawCols, type="crane") {
  let cols = rawCols.filter(c => c !== 'updaterUsername');
  if (!cols.includes('expiryDate')) cols.push('expiryDate');
  if (!cols.includes('riggerCHName')) cols.push('riggerCHName');
  if (!cols.includes('riggerPhNo')) cols.push('riggerPhNo');
  if (cols[0] !== 'slNo') cols.unshift('slNo');

  if (type === "crane") {
    let idxEng = cols.indexOf('engineer');
    let arr = cols.filter(c => !['expiryDate','status','riggerCHName','riggerPhNo'].includes(c));
    arr.splice(idxEng+1,0,'expiryDate');
    arr.splice(idxEng+2,0,'status');
    arr.splice(idxEng+3,0,'riggerCHName','riggerPhNo');
    return arr;
  }
  if (type === "manlift") {
    let idxEng = cols.indexOf('engineer');
    let arr = cols.filter(c => !['expiryDate','status'].includes(c));
    arr.splice(idxEng+1,0,'expiryDate');
    arr.splice(idxEng+2,0,'status');
    return arr;
  }
  return cols;
}

function formatLocalDateString(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  const dd = String(d.getDate()).padStart(2, '0');
  const mon = d.toLocaleString('en', { month: 'short' });
  const yy = String(d.getFullYear()).slice(-2);
  let hr = d.getHours(), pm = hr >= 12, min = String(d.getMinutes()).padStart(2, '0');
  hr = hr % 12; if (hr === 0) hr = 12;
  const ampm = pm ? "PM" : "AM";
  return `${dd}-${mon}-${yy}, ${hr}:${min} ${ampm}`;
}

// Utility to get unique filtered values for the current column
function getUniqueValues(rows, col) {
  const vals = new Set();
  for (const row of rows) {
    if (row[col] !== undefined && row[col] !== null && row[col] !== "") {
      vals.add(row[col]);
    }
  }
  return [...vals].sort((a, b) => String(a).localeCompare(String(b)));
}

export function showEquipList(container) {
  container.innerHTML = `
    <div class="equip-list-toolbar">
      <div class="equip-table-controls small">
        <select id="equipTableSelect" class="equip-table-selector small">
          <option value="crane">Crane Equipment</option>
          <option value="manlift">Manlift Equipment</option>
        </select>
        <span class="toolbar-gap"></span>
        <span id="filtered-count" class="equip-filtered-count small"></span>
        <span class="toolbar-gap"></span>
        <div class="export-dropdown-wrap">
          <button class="export-main-btn">Export ▼</button>
          <div class="export-dropdown-list">
            <div class="export-dropdown-item" data-format="csv">Export CSV</div>
            <div class="export-dropdown-item" data-format="pdf">Export PDF</div>
          </div>
        </div>
        <button id="clear-filters-btn" class="clear-filters-btn">Clear</button>
      </div>
    </div>
    <div id="equip-table-displayarea"></div>
  `;

  // Export dropdown logic
  const exportBtn = container.querySelector('.export-main-btn');
  const dropdown = container.querySelector('.export-dropdown-list');
  exportBtn.onclick = e => {
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
  };
  document.addEventListener('click', e => {
    if (!exportBtn.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });
  dropdown.querySelectorAll('.export-dropdown-item').forEach(item => {
    item.onclick = () => {
      dropdown.style.display = 'none';
      const format = item.dataset.format;
      runExport(format);
    };
  });

  // Excel-like filter state holds selected values for each column index (filtered values only)
  const filterState = {};

  let state = { type: 'crane', columns: [], rows: [], filteredRows: [] };
  let isLoading = false;

  loadCurrentTable();
  container.querySelector('#equipTableSelect').addEventListener('change', () => loadCurrentTable());

  function loadCurrentTable() {
    if (isLoading) return;
    const type = container.querySelector('#equipTableSelect').value;
    isLoading = true;
    showSpinner(container);
    fetch(`https://ad-eq-li.smnglobal.workers.dev/api/equipment-list?type=${type}`, {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('auth_token') }
    })
    .then(resp => resp.json())
    .then(result => {
      hideSpinner(container);
      isLoading = false;
      if (!result.success) {
        container.querySelector('#equip-table-displayarea').innerHTML = `<div class="equip-fetch-error">Error: ${result.error || 'Failed to fetch data'}.</div>`;
        container.querySelector('#filtered-count').textContent = '';
        return;
      }
      let cols = buildColumns(result.columns, type);
      const rowsWithSlNo = result.rows.map((row, i) => ({...row, slNo: i + 1}));
      state = { type, columns: cols, rows: rowsWithSlNo, filteredRows: [...rowsWithSlNo] };
      renderTable(cols, rowsWithSlNo, container.querySelector('#equip-table-displayarea'), type === 'crane' ? 'Crane Equipment' : 'Manlift Equipment');
      updateFilteredCount(state.filteredRows.length, state.rows.length);
    })
    .catch(() => {
      hideSpinner(container);
      isLoading = false;
      container.querySelector('#equip-table-displayarea').innerHTML = `<div class="equip-fetch-error">Error fetching data.</div>`;
      container.querySelector('#filtered-count').textContent = '';
    });
  }

  function renderTable(columns, data, box, title) {
    state.filteredRows = filterRowsByState(data, filterState, columns);
    box.innerHTML = `
      <div class="equip-table-container">
        <div style="width:100%;overflow-x:auto;">
        <table class="equip-list-table" id="equip-main-table">
          <thead>
            <tr>${columns.map(c => `<th>${headerLabels[c] || c}</th>`).join('')}</tr>
            <tr>${columns.map((c, i) => `
              <th class="excel-filter-cell">
                <div class="excel-filter-btn" data-colidx="${i}">
                  <span class="excel-filter-arrow">&#9662;</span>
                </div>
                <div class="excel-filter-popup" data-filter-popup="${i}" style="display:none">
                  <div class="filter-list-wrap"></div>
                  <button class="close-popup-btn" data-close-colidx="${i}">Close</button>
                </div>
              </th>
            `).join('')}</tr>
          </thead>
          <tbody>
            ${state.filteredRows.map(row => tableRowHTML(row, columns)).join('')}
          </tbody>
        </table>
        </div>
      </div>
    `;
    attachExcelFilterHandlers(box, columns, data);
    attachClearHandler(box);
  }

  function filterRowsByState(data, filterState, columns) {
    let rows = [...data];
    Object.entries(filterState).forEach(([idx, selectedSet]) => {
      if (selectedSet && selectedSet.size > 0 && selectedSet.size !== getUniqueValues(rows, columns[idx]).length) {
        // Only filter if not all selected, and some selected
        rows = rows.filter(row => selectedSet.has(row[columns[idx]]));
      }
    });
    return rows;
  }

  function attachExcelFilterHandlers(box, columns, data) {
    // Open/close filter popup
    box.querySelectorAll('.excel-filter-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        closeAllPopups();
        const idx = +btn.dataset.colidx;
        const popup = box.querySelector(`.excel-filter-popup[data-filter-popup="${idx}"]`);
        const col = columns[idx];
        // Use filtered rows to get unique values so it's context-nested
        const vals = getUniqueValues(state.filteredRows, col);
        if (!(idx in filterState)) filterState[idx] = new Set(vals);
        // Remove selections no longer in filtered
        Array.from(filterState[idx]).forEach(v => {
          if (!vals.includes(v)) filterState[idx].delete(v);
        });
        // If you filter down to 0 items, avoid errors: always allow all if no selection (avoid select none!)
        if (vals.length > 0 && filterState[idx].size === 0) vals.forEach(v => filterState[idx].add(v));
        popup.querySelector('.filter-list-wrap').innerHTML = renderPopupList(idx, vals, filterState[idx]);
        popup.style.display = (popup.style.display === 'block' ? 'none' : 'block');
        // Event for checkboxes:
        popup.querySelectorAll('.excel-filter-checkbox').forEach(chk => {
          chk.onchange = () => {
            const checkedVals = Array.from(popup.querySelectorAll('.excel-filter-checkbox')).filter(x => x.checked).map(x => decodeURIComponent(x.dataset.val));
            filterState[idx] = new Set(checkedVals);
            rerenderFiltered();
          };
        });
        popup.querySelector('.excel-filter-checkbox-all').onchange = function () {
          if (this.checked) {
            filterState[idx] = new Set(vals);
          } else {
            filterState[idx] = new Set([]);
          }
          rerenderFiltered();
        };
      };
    });

    // Global close
    function closeAllPopups() {
      box.querySelectorAll('.excel-filter-popup').forEach(p => p.style.display = 'none');
    }
    document.addEventListener('click', closeAllPopups);
    box.querySelectorAll('.excel-filter-popup').forEach(pop => { pop.onclick = e => e.stopPropagation(); });
    box.querySelectorAll('.close-popup-btn').forEach(btn => {
      btn.onclick = (e) => {
        const idx = btn.dataset.closeColidx;
        box.querySelector(`.excel-filter-popup[data-filter-popup="${idx}"]`).style.display = 'none';
      };
    });

    function rerenderFiltered() {
      // On every filter, rerender table with updated state
      renderTable(columns, data, box.parentNode, state.type === 'crane' ? 'Crane Equipment' : 'Manlift Equipment');
      // Update count too
      updateFilteredCount(state.filteredRows.length, state.rows.length);
    }
  }

  function renderPopupList(idx, vals, selectedSet) {
    let html = `<div style="max-height:240px;overflow:auto;margin-bottom:7px;">
      <label><input class="excel-filter-checkbox-all" type="checkbox" ${selectedSet.size === vals.length ? 'checked' : ''}/> <strong>Select All</strong></label><br/>
      ${vals.map(v =>
        `<label><input class="excel-filter-checkbox" data-val="${encodeURIComponent(v)}" type="checkbox" ${selectedSet.has(v) ? 'checked' : ''}/> ${v}</label><br/>`
      ).join('')}
    </div>`;
    return html;
  }

  function attachClearHandler(box) {
    const clearBtn = container.querySelector('#clear-filters-btn');
    if (!clearBtn) return;
    clearBtn.onclick = () => {
      Object.keys(filterState).forEach(idx => { filterState[idx] = null; });
      renderTable(state.columns, state.rows, container.querySelector('#equip-table-displayarea'), state.type === 'crane' ? 'Crane Equipment' : 'Manlift Equipment');
      updateFilteredCount(state.rows.length, state.rows.length);
    };
  }

  function tableRowHTML(row, columns) {
    return `<tr>${columns.map(col => {
      if (col === 'slNo') return `<td>${row.slNo}</td>`;
      if (col === 'expiryDate') return `<td>${row[col] ?? ''}</td>`;
      if (col === 'createdAt' || col === 'updatedAt')
        return `<td>${formatLocalDateString(row[col])}</td>`;
      return `<td>${row[col] ?? ''}</td>`;
    }).join('')}</tr>`;
  }

  function enableRowHighlighting(tbody) {
    tbody.querySelectorAll('tr').forEach(tr => {
      tr.onclick = function() {
        tbody.querySelectorAll('tr').forEach(r => r.classList.remove('highlighted-row'));
        tr.classList.add('highlighted-row');
      };
    });
  }

  function exportVisibleTableCSV(columns, rows, title) {
    const csvHeaders = columns.map(c => headerLabels[c] || c);
    let csv = csvHeaders.join(',') + '\n' +
      rows.map(row =>
        columns.map(col =>
          `"${(col==='slNo' ? row.slNo
            : (col==='expiryDate'
              ? (row[col] ?? '')
              : (["createdAt","updatedAt"].includes(col)
                ? formatLocalDateString(row[col])
                : (row[col] ?? '')
              )
            )
          ).toString().replace(/"/g, '""')}"`
        ).join(',')
      ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = title.replace(/[^a-z0-9]/gi, '_') + '.csv';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => window.URL.revokeObjectURL(url), 700);
  }

  function printVisibleTable(columns, rows, title) {
    let tableHTML = `
      <table class="printable-table">
        <thead>
          <tr>${columns.map(col => `<th>${headerLabels[col] || col}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${rows.map((row, idx) =>
            `<tr${idx % 2 === 1 ? ' class="zebra-row"' : ''}>${
              columns.map(col =>
                `<td>${col==='slNo'
                  ? row.slNo
                  : col==='expiryDate'
                  ? (row[col] ?? '')
                  : (["createdAt","updatedAt"].includes(col)
                    ? formatLocalDateString(row[col])
                    : (row[col] ?? '')
                  )
                }</td>`
              ).join('')
            }</tr>`
          ).join('')}
        </tbody>
      </table>
      <style>
        @media print {
          @page { size: A3 landscape; margin: 1cm; }
          body { font-size: 11pt; }
        }
        .printable-table { width:100%; border-collapse: collapse; font-size: 11pt; }
        .printable-table th, .printable-table td { border: 1px solid #bbb; padding: 4px 7px; font-size:10pt;}
        .printable-table th { background: #c7f4fd; color: #194879; }
        .printable-table tr.zebra-row { background: #e7f5fc; }
      </style>
    `;
    const popup = window.open('', '', 'width=1100,height=700,scrollbars=1');
    popup.document.write(`
      <html><head>
      <title>${title}</title>
      </head><body>
      <h2 style="margin-bottom:13px;font-size:1.16em;">${title} (Total rows: ${rows.length})</h2>
      ${tableHTML}
      </body></html>
    `);
    popup.document.close();
    setTimeout(() => popup.print(), 350);
  }

  function runExport(format) {
    const columns = state.columns;
    const rows = state.filteredRows;
    const title = state.type === 'crane' ? 'Crane Equipment' : 'Manlift Equipment';
    if (format === "csv") exportVisibleTableCSV(columns, rows, title);
    if (format === "pdf") printVisibleTable(columns, rows, title);
  }

  function updateFilteredCount(filtered, total) {
    container.querySelector('#filtered-count').textContent = `Rows: ${filtered} of ${total}`;
  }
}
