import { showSpinner, hideSpinner } from './spinner.js';

export function showEquipUpload(container) {
  container.innerHTML = `
    <div class="demo-card">
      <h3>⬆ Upload Equipment CSV</h3>
      <div class="csv-upload-box">
        <label for="equipmentType"><strong>Select Equipment Type:</strong></label>
        <select id="equipmentType">
          <option value="crane">Crane</option>
          <option value="manlift">Manlift</option>
        </select>
        <br/><br/>
        <label><strong>Upload CSV:</strong></label>
        <input id="csvFile" type="file" accept=".csv" />
        <button id="uploadCsvBtn" type="button" disabled>Upload</button>
        <div id="csv-status"></div>
      </div>
      <div id="equipment-table"></div>
      <div id="failed-table" style="margin-top:1em"></div>
      <p class="demo-txt">CSV importer with spinner, failed row editing and deletion.</p>
    </div>
  `;

  const equipmentSelect = container.querySelector("#equipmentType");
  const fileInput = container.querySelector("#csvFile");
  const uploadBtn = container.querySelector("#uploadCsvBtn");
  const statusDiv = container.querySelector("#csv-status");
  const tableDiv = container.querySelector("#equipment-table");
  const failedTableDiv = container.querySelector("#failed-table");

  const columnsByEquipment = {
    crane: ["plantNo", "regNo", "description", "capacity", "type", "owner", "train", "location", "engineer", "riggerCHName", "riggerPhNo", "status"],
    manlift: ["plantNo", "regNo", "description", "length", "type", "owner", "train", "location", "engineer", "operatorName", "operatorPhNo", "status"],
  };

  let parsedData = null;      // {headers, rows, equipmentType}
  let failedRows = [];        // [{row:[], error:""}]
  let failedHeaders = [];     // headers for failedTable

  function parseCSV(text) {
    const lines = text.trim().split(/\r?\n/);
    return lines.map(line => line.split(",").map(cell => cell.trim()));
  }

  function createTable(headers, rows) {
    let html = "<table><thead><tr>";
    headers.forEach(h => html += `<th>${h}</th>`);
    html += "</tr></thead><tbody>";
    rows.forEach(row => {
      html += "<tr>";
      row.forEach(cell => html += `<td>${cell}</td>`);
      html += "</tr>";
    });
    html += "</tbody></table>";
    return html;
  }

  // Editable failed-table with "Delete" and "Save"
  function createEditableFailedTable(headers, failedRows) {
    let html = "<table style='border:2px solid #c00'><thead><tr>";
    headers.forEach(h => html += `<th>${h}</th>`);
    html += "<th>Error</th><th>Edit</th><th>Delete</th></tr></thead><tbody>";
    failedRows.forEach((obj, idx) => {
      html += `<tr data-row="${idx}">`;
      obj.row.forEach((cell, colIdx) => {
        html += `<td contenteditable="true" data-col="${colIdx}" style="background:#ffeeee">${cell}</td>`;
      });
      html += `<td style="color:#c00">${obj.error || ""}</td>`;
      html += `<td><button class="editRowBtn" data-row="${idx}">Save</button></td>`;
      html += `<td><button class="delRowBtn" data-row="${idx}">Delete</button></td></tr>`;
    });
    html += "</tbody></table>";
    return html;
  }

  function resetUI() {
    statusDiv.textContent = "";
    statusDiv.classList.remove("error");
    tableDiv.innerHTML = "";
    failedTableDiv.innerHTML = "";
    uploadBtn.textContent = "Upload";
    uploadBtn.disabled = !fileInput.files.length;
    parsedData = null;
    failedRows = [];
    failedHeaders = [];
  }

  fileInput.addEventListener("change", () => {
    resetUI();
    uploadBtn.disabled = !fileInput.files.length;
  });

  uploadBtn.addEventListener("click", async () => {
    statusDiv.textContent = "";
    statusDiv.classList.remove("error");

    if (uploadBtn.textContent === "Upload") {
      const file = fileInput.files[0];
      const equipmentType = equipmentSelect.value;

      if (!file) {
        statusDiv.textContent = "Please select a CSV file.";
        statusDiv.classList.add("error");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        try {
          const text = reader.result;
          const data = parseCSV(text);

          if (data.length < 2) {
            statusDiv.textContent = "CSV must have at least a header and one data row.";
            statusDiv.classList.add("error");
            return;
          }

          const headers = data[0];
          const rows = data.slice(1);
          tableDiv.innerHTML = createTable(headers, rows);
          failedTableDiv.innerHTML = "";
          statusDiv.textContent = `Loaded ${rows.length} rows for preview. Click Save to validate and upload.`;
          parsedData = {headers, rows, equipmentType};
          failedRows = [];
          failedHeaders = headers;
          uploadBtn.textContent = "Save";
        } catch {
          statusDiv.textContent = "Error reading CSV file.";
          statusDiv.classList.add("error");
        }
      };
      reader.onerror = () => {
        statusDiv.textContent = "Error reading file.";
        statusDiv.classList.add("error");
      };
      reader.readAsText(file);
    } else if (uploadBtn.textContent === "Save") {
      if (!(parsedData && parsedData.headers && parsedData.rows)) {
        statusDiv.textContent = "No data available to save.";
        statusDiv.classList.add("error");
        return;
      }
      // --- Client-side FILTER FOR UNIQUE plantNo/regNo ---
      const regMap = new Map();
      const plantMap = new Map();
      const dupIndexes = new Set();

      // Find all repeats (NOT "first wins") and collect all indices, not just subsequent
      parsedData.rows.forEach((row, idx) => {
        const headers = parsedData.headers;
        const reg = row[headers.indexOf('regNo')];
        const pln = row[headers.indexOf('plantNo')];
        if (regMap.has(reg)) { dupIndexes.add(idx); dupIndexes.add(regMap.get(reg)); }
        else regMap.set(reg, idx);
        if (plantMap.has(pln)) { dupIndexes.add(idx); dupIndexes.add(plantMap.get(pln)); }
        else plantMap.set(pln, idx);
      });

      // Prepare to send only those rows NOT in dupIndexes
      const toSend = parsedData.rows.filter((_r, idx) => !dupIndexes.has(idx));
      failedRows = Array.from(dupIndexes).map(idx => ({
        row: parsedData.rows[idx],
        error: "Duplicate regNo or plantNo in file"
      }))
      failedHeaders = parsedData.headers;
      showSpinner(container);
      statusDiv.textContent = "Saving unique rows...";
      uploadBtn.disabled = true;

      try {
        const token = localStorage.getItem('auth_token');
        const resp = await fetch('https://ad-eq-up.smnglobal.workers.dev/api/equipment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify({
            equipmentType: parsedData.equipmentType,
            rows: toSend.map(row => Object.fromEntries(parsedData.headers.map((h, i) => [h, row[i]])))
          })
        });

        const result = await resp.json();
        hideSpinner(container);

        tableDiv.innerHTML = ""; // Clear success
        uploadBtn.textContent = "Upload";
        uploadBtn.disabled = false;
        fileInput.value = "";

        // Combine local duplicates with backend-failed rows
        let finalFailed = [
          ...failedRows,
          ...(result.failedRows ? result.failedRows.map(f => ({row: parsedData.headers.map(h => f.row[h] || ""), error: f.error})) : [])
        ];

        if (finalFailed.length > 0) {
          failedRows = finalFailed;
          failedTableDiv.innerHTML = createEditableFailedTable(parsedData.headers, failedRows);
          statusDiv.textContent = `Inserted: ${result.insertedCount||0}. Failed: ${finalFailed.length}. Edit highlighted rows and save again.`;
          addFailedRowHandlers();
        } else {
          failedTableDiv.innerHTML = "";
          statusDiv.textContent = `All rows inserted successfully.`;
          failedRows = [];
        }
      } catch (err) {
        hideSpinner(container);
        tableDiv.innerHTML = "";
        failedTableDiv.innerHTML = "";
        uploadBtn.textContent = "Upload";
        uploadBtn.disabled = false;
        fileInput.value = "";
        statusDiv.textContent = "Network/server error during save.";
        statusDiv.classList.add("error");
      }
    }
  });

  // Add edit/save/delete for failed rows
  function addFailedRowHandlers() {
    failedTableDiv.querySelectorAll(".delRowBtn").forEach(btn => {
      btn.onclick = (e) => {
        const idx = parseInt(btn.getAttribute("data-row"));
        failedRows.splice(idx, 1);
        failedTableDiv.innerHTML = createEditableFailedTable(failedHeaders, failedRows);
        addFailedRowHandlers();
      };
    });
    failedTableDiv.querySelectorAll(".editRowBtn").forEach(btn => {
      btn.onclick = async (e) => {
        const idx = parseInt(btn.getAttribute("data-row"));
        const tr = failedTableDiv.querySelector(`tr[data-row="${idx}"]`);
        const cells = Array.from(tr.querySelectorAll("td[data-col]"));
        const editedRow = cells.map(c => c.textContent.trim());
        failedRows[idx].row = editedRow;
        showSpinner(container);
        try {
          const token = localStorage.getItem('auth_token');
          const resp = await fetch('https://ad-eq-up.smnglobal.workers.dev/api/equipment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({
              equipmentType: equipmentSelect.value,
              rows: [Object.fromEntries(failedHeaders.map((h, i) => [h, editedRow[i]]))]
            })
          });
          const result = await resp.json();
          hideSpinner(container);
          if (resp.ok && result.success && (!result.failedRows || result.failedRows.length === 0)) {
            statusDiv.textContent = "Row saved successfully.";
            failedRows.splice(idx, 1);
            failedTableDiv.innerHTML = createEditableFailedTable(failedHeaders, failedRows);
            addFailedRowHandlers();
          } else {
            failedRows[idx].error = result.failedRows && result.failedRows[0] ? result.failedRows[0].error : (result.error || "Unknown error");
            failedTableDiv.innerHTML = createEditableFailedTable(failedHeaders, failedRows);
            addFailedRowHandlers();
            statusDiv.textContent = "Row save failed. See error in table.";
          }
        } catch (err) {
          hideSpinner(container);
          failedRows[idx].error = "Network/server error";
          failedTableDiv.innerHTML = createEditableFailedTable(failedHeaders, failedRows);
          addFailedRowHandlers();
          statusDiv.textContent = "Row save failed. See error in table.";
        }
      };
    });
  }
  resetUI();
}
