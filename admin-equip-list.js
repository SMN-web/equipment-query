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
  "riggerCHName": "Rigger C/H Name",
  "riggerPhNo": "Rigger Ph. No.",
  "operatorName": "Operator Name",
  "operatorPhNo": "Operator Ph. No.",
  "status": "Status",
  "expiryDate": "Expiry Date",
  "createdAt": "Created At",
  "updatedAt": "Updated At",
  "updaterName": "Updated By"
};

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
function buildColumns(rawCols) {
  const baseCols = [...rawCols];
  if (!baseCols.includes('expiryDate')) baseCols.push('expiryDate');
  if (baseCols[0] !== 'slNo') baseCols.unshift('slNo');
  return baseCols;
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
            <div class="export-dropdown-item" data-type="crane" data-format="csv">Export Crane (CSV)</div>
            <div class="export-dropdown-item" data-type="crane" data-format="pdf">Export Crane (PDF)</div>
            <div class="export-dropdown-item" data-type="manlift" data-format="csv">Export Manlift (CSV)</div>
            <div class="export-dropdown-item" data-type="manlift" data-format="pdf">Export Manlift (PDF)</div>
          </div>
        </div>
      </div>
    </div>
    <div id="equip-table-displayarea"></div>
  `;

  // Export dropdown menu logic
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
      const type = item.dataset.type;
      const format = item.dataset.format;
      runExport(type, format);
    };
  });

  // To be efficient, keep current data for both types in memory
  let craneData = {}, manliftData = {};
  let state = { type: 'crane', columns: [], rows: [], filteredRows: [] };
  let isLoading = false;

  // Initial load
  loadCurrentTable();

  // Dropdown type switch
  container.querySelector('#equipTableSelect').addEventListener('change', () => loadCurrentTable());

  function loadCurrentTable(selectedType) {
    if (isLoading) return;
    const type = selectedType || container.querySelector('#equipTableSelect').value;
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
      let cols = result.columns.filter(c => c !== 'updaterUsername');
      cols = buildColumns(cols);
      const rowsWithSlNo = result.rows.map((row, i) => ({...row, slNo: i + 1}));
      state = { type, columns: cols, rows: rowsWithSlNo, filteredRows: [...rowsWithSlNo] };
      if (type === 'crane') craneData = {...state};
      if (type === 'manlift') manliftData = {...state};
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

  function runExport(type, format) {
    // Find correct data: always export from the most recently loaded content
    let exportColumns, exportRows, exportTitle;
    if (type === "crane") {
      exportColumns = craneData.columns || state.columns;
      exportRows = (type === state.type ? state.filteredRows : craneData.filteredRows) || [];
      exportTitle = "Crane Equipment";
    } else {
      exportColumns = manliftData.columns || state.columns;
      exportRows = (type === state.type ? state.filteredRows : manliftData.filteredRows) || [];
      exportTitle = "Manlift Equipment";
    }
    // If rows not loaded, load from API
    if (!exportRows || !exportRows.length) {
      loadCurrentTable(type);
      setTimeout(() => runExport(type, format), 800); // retry after data
      return;
    }
    if (format === "csv") exportVisibleTableCSV(exportColumns, exportRows, exportTitle);
    if (format === "pdf") printVisibleTable(exportColumns, exportRows, exportTitle);
  }

  function updateFilteredCount(filtered, total) {
    container.querySelector('#filtered-count').textContent = `Rows: ${filtered} of ${total}`;
  }
}
