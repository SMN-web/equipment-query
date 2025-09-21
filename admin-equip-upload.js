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
      <p class="demo-txt">CSV importer will be wired here.</p>
    </div>
  `;

  const equipmentSelect = container.querySelector("#equipmentType");
  const fileInput = container.querySelector("#csvFile");
  const uploadBtn = container.querySelector("#uploadCsvBtn");
  const statusDiv = container.querySelector("#csv-status");
  const tableDiv = container.querySelector("#equipment-table");
  const failedTableDiv = container.querySelector("#failed-table");

  const columnsByEquipment = {
    crane: [
      "plantNo","regNo","description","capacity","type","owner","train","location","engineer","riggerCHName","riggerPhNo","status"
    ],
    manlift: [
      "plantNo","regNo","description","length","type","owner","train","location","engineer","operatorName","operatorPhNo","status"
    ],
  };

  function parseCSV(text) {
    const lines = text.trim().split(/\r?\n/);
    return lines.map(line => line.split(",").map(cell => cell.trim()));
  }

  function validateHeaders(headers, expectedHeaders) {
    if (headers.length !== expectedHeaders.length) return false;
    return expectedHeaders.every((col, idx) => col === headers[idx]);
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

  function createFailedTable(headers, failedRows) {
    let html = "<table style='border:2px solid #c00'><thead><tr>";
    headers.forEach(h => html += `<th>${h}</th>`);
    html += "<th>Error</th></tr></thead><tbody>";
    failedRows.forEach(({row, error}) => {
      html += "<tr>";
      row.forEach(cell => html += `<td>${cell}</td>`);
      html += `<td style='color:#c00'>${error}</td></tr>`;
    });
    html += "</tbody></table>";
    return html;
  }

  function isValidPhoneNumber(phone) {
    if (!phone || phone.trim() === "") return true;
    return /^\+?[0-9\s\-()]{7,20}$/.test(phone);
  }

  function validateRow(row, headers, equipmentType) {
    const map = {};
    headers.forEach((h, idx) => (map[h] = row[idx]));

    if (!map["regNo"] || !map["plantNo"] || !map["description"] || !map["owner"]) {
      return "Required fields (regNo, plantNo, description, owner) cannot be blank.";
    }
    if (!/^\d+$/.test(map["regNo"])) {
      return "regNo must be an integer.";
    }
    if (
      (equipmentType === "crane" && map["capacity"] && !/^\d+$/.test(map["capacity"])) ||
      (equipmentType === "manlift" && map["length"] && !/^\d+$/.test(map["length"]))
    ) {
      return equipmentType === "crane"
        ? "capacity must be an integer or blank."
        : "length must be an integer or blank.";
    }
    if (equipmentType === "crane" && !isValidPhoneNumber(map["riggerPhNo"])) {
      return "riggerPhNo must be blank or a valid phone number.";
    }
    if (equipmentType === "manlift" && !isValidPhoneNumber(map["operatorPhNo"])) {
      return "operatorPhNo must be blank or a valid phone number.";
    }
    return null;
  }

  function resetUI() {
    statusDiv.textContent = "";
    statusDiv.classList.remove("error");
    tableDiv.innerHTML = "";
    failedTableDiv.innerHTML = "";
    uploadBtn.textContent = "Upload";
    uploadBtn.disabled = !fileInput.files.length;
    container.parsedData = null;
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
      const expectedColumns = columnsByEquipment[equipmentType];

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
          if (!validateHeaders(headers, expectedColumns)) {
            statusDiv.textContent = `CSV header mismatch. Expected columns: ${expectedColumns.join(", ")}`;
            statusDiv.classList.add("error");
            return;
          }

          const rows = data.slice(1);
          // Uniqueness checks in the upload file (before backend)
          const regNoSet = new Set();
          const plantNoSet = new Set();
          const failedRows = [];
          const validRows = [];

          for (let i = 0; i < rows.length; i++) {
            const err = validateRow(rows[i], headers, equipmentType);
            const reg = rows[i][headers.indexOf('regNo')];
            const pln = rows[i][headers.indexOf('plantNo')];
            if (regNoSet.has(reg)) {
              failedRows.push({row: rows[i], error: "Duplicate regNo in file"});
              continue;
            }
            if (plantNoSet.has(pln)) {
              failedRows.push({row: rows[i], error: "Duplicate plantNo in file"});
              continue;
            }
            if (err) {
              failedRows.push({row: rows[i], error: err});
            } else {
              regNoSet.add(reg);
              plantNoSet.add(pln);
              validRows.push(rows[i]);
            }
          }

          tableDiv.innerHTML = createTable(headers, validRows);
          failedTableDiv.innerHTML = failedRows.length ? createFailedTable(headers, failedRows) : "";
          statusDiv.textContent = `Valid rows: ${validRows.length}. Rows with errors: ${failedRows.length}`;
          container.parsedData = { headers, rows: validRows, equipmentType, failedRows, origHeaders: headers };

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
      const { headers, rows, equipmentType } = container.parsedData || {};

      if (!headers || !rows) {
        statusDiv.textContent = "No data available to save.";
        statusDiv.classList.add("error");
        return;
      }

      statusDiv.textContent = "Saving data...";
      uploadBtn.disabled = true;

      // Turn row arrays into objects
      const dataRows = rows.map(row => {
        const obj = {};
        headers.forEach((h, idx) => obj[h] = row[idx]);
        return obj;
      });

      try {
        const token = localStorage.getItem('auth_token');
        const resp = await fetch('https://ad-eq-up.smnglobal.workers.dev/api/equipment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify({ equipmentType, rows: dataRows })
        });

        const result = await resp.json();

        // Always clear, always re-enable
        tableDiv.innerHTML = "";
        uploadBtn.textContent = "Upload";
        uploadBtn.disabled = false;
        fileInput.value = "";

        if (resp.ok && result.success) {
          if (result.failedRows && result.failedRows.length) {
            failedTableDiv.innerHTML = createFailedTable(headers, result.failedRows);
            statusDiv.textContent = `Inserted: ${result.insertedCount}. Failed: ${result.failedRows.length}`;
          } else {
            failedTableDiv.innerHTML = "";
            statusDiv.textContent = `All rows inserted successfully.`;
          }
        } else {
          failedTableDiv.innerHTML = "";
          statusDiv.textContent = `Server error: ${result.error || 'Unknown error'}`;
          statusDiv.classList.add("error");
        }
      } catch (err) {
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

  resetUI();
}
