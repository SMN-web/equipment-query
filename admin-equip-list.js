import { showSpinner, hideSpinner } from './spinner.js';

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
  // Make a copy to reorder
  let cols = rawCols.filter(c => c !== 'updaterUsername');
  if (!cols.includes('expiryDate')) cols.push('expiryDate');
  if (!cols.includes('riggerCHName')) cols.push('riggerCHName');
  if (!cols.includes('riggerPhNo')) cols.push('riggerPhNo');
  // Always put serial first
  if (cols[0] !== 'slNo') cols.unshift('slNo');

  // --- REORDER for Crane ---
  if (type === "crane") {
    // Find indices for each
    let idxEng = cols.indexOf('engineer');
    let idxExpiry = cols.indexOf('expiryDate');
    let idxStatus = cols.indexOf('status');
    let idxRiggerName = cols.indexOf('riggerCHName');
    let idxRiggerPh = cols.indexOf('riggerPhNo');
    // Remove if present to reposition
    let arr = cols.filter(c => !['expiryDate', 'status', 'riggerCHName', 'riggerPhNo'].includes(c));
    // Insert expiry after engineer
    arr.splice(idxEng + 1, 0, 'expiryDate');
    // Insert status after expiry
    arr.splice(idxEng + 2, 0, 'status');
    // Insert rigger fields after status
    arr.splice(idxEng + 3, 0, 'riggerCHName', 'riggerPhNo');
    return arr;
  }
  // --- REORDER for Manlift (expiry before status if both exist) ---
  if (type === "manlift") {
    let idxEng = cols.indexOf('engineer');
    let idxExpiry = cols.indexOf('expiryDate');
    let idxStatus = cols.indexOf('status');
    let arr = cols.filter(c => !['expiryDate', 'status'].includes(c));
    arr.splice(idxEng + 1, 0, 'expiryDate');
    arr.splice(idxEng + 2, 0, 'status');
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
    state.filteredRows = [...data];
    box.innerHTML = `
      <div class="equip-table-container">
        <div style="width:100%;overflow-x:auto;">
        <table class="equip-list-table" id="equip-main-table">
          <thead>
            <tr>${columns.map(c => `<th>${headerLabels[c] || c}</th>`).join('')}</tr>
            <tr>${columns.map((c, i) =>
              `<th><input type="text" class="column-filter" data-colidx="${i}" placeholder="Filter..."/></th>`
            ).join('')}</tr>
          </thead>
          <tbody>
            ${state.filteredRows.map(row => tableRowHTML(row, columns)).join('')}
          </tbody>
        </table>
        </div>
      </div>
    `;
    const filterInputs = Array.from(box.querySelectorAll('.column-filter'));
    filterInputs.forEach(input => {
      input.addEventListener('input', function() {
        let curRows = data;
        filterInputs.forEach(inp => {
          if (inp.value.trim()) {
            const idx = +inp.dataset.colidx;
            curRows = curRows.filter(row =>
              (row[columns[idx]] ?? '').toString().toLowerCase().includes(inp.value.trim().toLowerCase())
            );
          }
        });
        state.filteredRows = curRows;
        box.querySelector('tbody').innerHTML = state.filteredRows.map(row => tableRowHTML(row, columns)).join('');
        enableRowHighlighting(box.querySelector('tbody'));
        updateFilteredCount(state.filteredRows.length, state.rows.length);
      });
    });
    enableRowHighlighting(box.querySelector('tbody'));
  }

  function tableRowHTML(row, columns) {
    const dateCols = ["createdAt", "updatedAt", "expiryDate"];
    return `<tr>${columns.map(col => {
      if (col === 'slNo') return `<td>${row.slNo}</td>`;
      if (dateCols.includes(col)) return `<td>${formatLocalDateString(row[col])}</td>`;
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
    const dateCols = ["createdAt", "updatedAt", "expiryDate"];
    let csv = csvHeaders.join(',') + '\n' +
      rows.map(row =>
        columns.map(col =>
          `"${(col==='slNo' ? row.slNo
            : (dateCols.includes(col)
              ? (row[col] ? new Date(row[col]).toISOString().replace('T',' ').slice(0,16) : '')
              : (row[col] ?? '')
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
    const dateCols = ["createdAt", "updatedAt", "expiryDate"];
    let tableHTML = `
      <table class="printable-table">
        <thead>
          <tr>${columns.map(col => `<th>${headerLabels[col] || col}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${rows.map((row, idx) =>
            `<tr${idx % 2 === 1 ? ' class="zebra-row"' : ''}>${
              columns.map(col =>
                `<td>${col==='slNo' ? row.slNo
                  : (dateCols.includes(col) ? formatLocalDateString(row[col]) : row[col] ?? '')}</td>`
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
