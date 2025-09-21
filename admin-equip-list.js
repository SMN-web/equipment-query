import { showSpinner, hideSpinner } from './spinner.js';
import './admin-equip-list.css';

// Utility: download CSV
function downloadCSV(columns, rows, filename) {
  const csv = columns.join(',') + '\n' +
    rows.map(row => columns.map(col => `"${(row[col] ?? '').toString().replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => window.URL.revokeObjectURL(url), 666);
}

// Utility: browser print of only a block of HTML
function printHTMLTable(title, html) {
  const popup = window.open('', '', 'width=950,height=700,scrollbars=1');
  popup.document.write(`
    <html><head>
    <title>${title}</title>
    <link rel="stylesheet" href="admin-equip-list.css"/>
    </head><body>
    <h2>${title}</h2>
    ${html}
    </body></html>
  `);
  popup.document.close();
  setTimeout(() => popup.print(), 350);
}

export function showEquipList(container) {
  container.innerHTML = `
    <div class="equip-section-flex">
      <div class="equip-table-card">
        <div class="table-head-row">
          <h3>🚜 Crane Equipment</h3>
          <div>
            <button id="crane-csv-btn">Export CSV</button>
            <button id="crane-pdf-btn">Export PDF</button>
          </div>
        </div>
        <div id="crane-table-box" class="table-scroll"></div>
      </div>
      <div class="equip-table-card">
        <div class="table-head-row">
          <h3>🛗 Manlift Equipment</h3>
          <div>
            <button id="manlift-csv-btn">Export CSV</button>
            <button id="manlift-pdf-btn">Export PDF</button>
          </div>
        </div>
        <div id="manlift-table-box" class="table-scroll"></div>
      </div>
    </div>
  `;
  loadEquipListData();

  function loadEquipListData() {
    renderTableWithAPI('crane');
    renderTableWithAPI('manlift');
  }

  function renderTableWithAPI(type) {
    const box = container.querySelector(`#${type}-table-box`);
    showSpinner(container);
    fetch(`https://ad-eq-li.smnglobal.workers.dev/api/equipment-list?type=${type}`, {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('auth_token') }
    })
    .then(resp => resp.json()).then(result => {
      hideSpinner(container);
      if (!result.success) {
        box.innerHTML = `<div class="equip-fetch-error">Error: ${result.error || 'Failed to fetch data'}.</div>`;
        return;
      }
      renderTable(type, result.columns, result.rows, box);
    })
    .catch(() => {
      hideSpinner(container);
      box.innerHTML = `<div class="equip-fetch-error">Error fetching data.</div>`;
    });
  }

  function renderTable(type, columns, data, box) {
    // Show only visible columns, swap updaterUsername with updaterName if present
    const columnsToShow = columns.filter(col => col !== 'updaterUsername');
    let filteredRows = [...data];

    box.innerHTML = `
      <table class="equip-list-table" id="${type}-equip-table">
        <thead>
          <tr>${columnsToShow.map(c => `<th>${c}</th>`).join('')}</tr>
          <tr>${columnsToShow.map((c, i) =>
            `<th><input type="text" class="column-filter" data-colidx="${i}" placeholder="Filter..."/></th>`
          ).join('')}</tr>
        </thead>
        <tbody>
          ${data.map(row => `<tr>${columnsToShow.map(col => `<td>${row[col] ?? ''}</td>`).join('')}</tr>`).join('')}
        </tbody>
      </table>
    `;
    const filterInputs = Array.from(box.querySelectorAll('.column-filter'));

    filterInputs.forEach(input => {
      input.addEventListener('input', function() {
        let curRows = data;
        filterInputs.forEach(inp => {
          if (inp.value.trim()) {
            const idx = +inp.dataset.colidx;
            curRows = curRows.filter(row =>
              (row[columnsToShow[idx]] ?? '').toString().toLowerCase().includes(inp.value.trim().toLowerCase())
            );
          }
        });
        filteredRows = curRows;
        const tbody = box.querySelector('tbody');
        tbody.innerHTML = filteredRows.map(row => `<tr>${columnsToShow.map(col => `<td>${row[col] ?? ''}</td>`).join('')}</tr>`).join('');
      });
    });

    // CSV
    container.querySelector(`#${type}-csv-btn`).onclick = () => {
      downloadCSV(columnsToShow, filteredRows, `${type}-equipment.csv`);
    };

    // PDF/Print
    container.querySelector(`#${type}-pdf-btn`).onclick = () => {
      const html = box.querySelector('table').outerHTML;
      printHTMLTable(type === 'crane' ? 'Crane Equipment' : 'Manlift Equipment', html);
    };
  }
}
