import { showSpinner, hideSpinner } from './spinner.js';

export function showEquipList(container) {
  container.innerHTML = `
    <div class="equip-list-topbar">
      <select id="equipTableSelect" class="equip-table-selector">
        <option value="crane">Crane Equipment</option>
        <option value="manlift">Manlift Equipment</option>
      </select>
      <div class="export-btn-bar">
        <button id="equip-csv-btn" class="csv-btn">Export CSV</button>
        <button id="equip-pdf-btn" class="pdf-btn">Export PDF</button>
      </div>
    </div>
    <div id="equip-table-displayarea"></div>
  `;

  const select = container.querySelector('#equipTableSelect');
  const displayArea = container.querySelector('#equip-table-displayarea');
  const csvBtn = container.querySelector('#equip-csv-btn');
  const pdfBtn = container.querySelector('#equip-pdf-btn');
  let currentColumns = [], currentRows = [], currentTitle = '';

  // Load initial
  loadCurrentTable();

  select.addEventListener('change', () => loadCurrentTable());

  function loadCurrentTable() {
    const type = select.value;
    showSpinner(container);
    fetch(`https://ad-eq-li.smnglobal.workers.dev/api/equipment-list?type=${type}`, {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('auth_token') }
    })
    .then(resp => resp.json()).then(result => {
      hideSpinner(container);
      if (!result.success) {
        displayArea.innerHTML = `<div class="equip-fetch-error">Error: ${result.error || 'Failed to fetch data'}.</div>`;
        return;
      }
      currentColumns = result.columns.filter(c => c !== 'updaterUsername');
      currentRows = result.rows;
      currentTitle = (type === 'crane' ? 'Crane Equipment' : 'Manlift Equipment');
      renderTable(currentColumns, result.rows, displayArea, currentTitle);
    })
    .catch(() => {
      hideSpinner(container);
      displayArea.innerHTML = `<div class="equip-fetch-error">Error fetching data.</div>`;
    });
  }

  function renderTable(columns, data, box, title) {
    let filteredRows = [...data];
    let selectedRow = null;

    box.innerHTML = `
      <div class="equip-table-container">
        <table class="equip-list-table printable-table" id="equip-main-table">
          <thead>
            <tr>${columns.map(c => `<th>${c}</th>`).join('')}</tr>
            <tr>${columns.map((c, i) =>
              `<th><input type="text" class="column-filter" data-colidx="${i}" placeholder="Filter..."/></th>`
            ).join('')}</tr>
          </thead>
          <tbody>
            ${data.map((row, idx) => tableRowHTML(row, columns, idx)).join('')}
          </tbody>
        </table>
      </div>
    `;
    // Filter logic
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
        filteredRows = curRows;
        box.querySelector('tbody').innerHTML = filteredRows.map((row, idx) => tableRowHTML(row, columns, idx)).join('');
        // re-enable row click highlight:
        enableRowHighlighting(box.querySelector('tbody'));
      });
    });

    // Row highlighting for identification
    enableRowHighlighting(box.querySelector('tbody'));

    // CSV Export
    csvBtn.onclick = () => {
      exportVisibleTableCSV(columns, filteredRows, title);
    };

    // PDF Export/Print
    pdfBtn.onclick = () => {
      printVisibleTable(columns, filteredRows, title);
    };
  }

  function tableRowHTML(row, columns, idx) {
    return `<tr class="zebra-${idx % 2}">${columns.map(col => `<td>${row[col] ?? ''}</td>`).join('')}</tr>`;
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
    let csv = columns.join(',') + '\n' +
      rows.map(row => columns.map(col => `"${(row[col] ?? '').toString().replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = title.replace(/[^a-z0-9]/gi, '_') + '.csv';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => window.URL.revokeObjectURL(url), 700);
  }

  function printVisibleTable(columns, rows, title) {
    // Build table HTML for printing
    let tableHTML = `
      <table class="printable-table">
        <thead>
          <tr>${columns.map(col => `<th>${col}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${rows.map((row, idx) =>
            `<tr class="zebra-${idx % 2}">${columns.map(col => `<td>${row[col] ?? ''}</td>`).join('')}</tr>`
          ).join('')}
        </tbody>
      </table>
      <style>
        @media print {
          @page {
            size: A3 landscape;
            margin: 1cm;
          }
          body { font-size: 11pt; }
        }
        .printable-table { width:100%; border-collapse: collapse; font-size: 11pt; }
        .printable-table th, .printable-table td { border: 1px solid #bbb; padding: 6px 14px; }
        .printable-table th { background: #c7f4fd; color: #194879; }
        .printable-table tr.zebra-0 { background: #fafdff; }
        .printable-table tr.zebra-1 { background: #e7f5fc; }
      </style>
    `;
    const popup = window.open('', '', 'width=1400,height=900,scrollbars=1');
    popup.document.write(`
      <html><head>
      <title>${title}</title>
      </head><body>
      <h2 style="margin-bottom:15px;">${title}</h2>
      ${tableHTML}
      </body></html>
    `);
    popup.document.close();
    setTimeout(() => popup.print(), 400);
  }
}
