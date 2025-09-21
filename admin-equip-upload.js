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
      <div id="equipment-table"><p>Uploaded CSV preview table will show here.</p></div>
      <p class="demo-txt">CSV importer will be wired here.</p>
    </div>
  `;

  const equipmentSelect = container.querySelector("#equipmentType");
  const fileInput = container.querySelector("#csvFile");
  const uploadBtn = container.querySelector("#uploadCsvBtn");
  const statusDiv = container.querySelector("#csv-status");
  const tableDiv = container.querySelector("#equipment-table");

  const columnsByEquipment = {
    crane: [
      "plantNo",
      "regNo",
      "description",
      "capacity",
      "type",
      "owner",
      "train",
      "location",
      "engineer",
      "riggerCHName",
      "riggerPhNo",
      "status",
    ],
    manlift: [
      "plantNo",
      "regNo",
      "description",
      "length",
      "type",
      "owner",
      "train",
      "location",
      "engineer",
      "operatorName",
      "operatorPhNo",
      "status",
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
    headers.forEach(h => (html += `<th>${h}</th>`));
    html += "</tr></thead><tbody>";
    rows.forEach(row => {
      html += "<tr>";
      row.forEach(cell => {
        html += `<td>${cell}</td>`;
      });
      html += "</tr>";
    });
    html += "</tbody></table>";
    return html;
  }

  // Validate phone number (blank or international format with +)
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
    tableDiv.innerHTML = "<p>Uploaded CSV preview table will show here.</p>";
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
      reader.onload = (e) => {
        try {
          const text = e.target.result;
          const data = parseCSV(text);

          if (data.length < 2) {
            statusDiv.textContent = "CSV must have at least a header and one data row.";
            statusDiv.classList.add("error");
            return;
          }

          const headers = data[0];
          if (!validateHeaders(headers, expectedColumns)) {
            statusDiv.textContent = `CSV header mismatch. Expected columns: ${expectedColumns.join(
              ", "
            )}`;
            statusDiv.classList.add("error");
            return;
          }

          const rows = data.slice(1);
          tableDiv.innerHTML = createTable(headers, rows);
          statusDiv.textContent = `Successfully parsed ${rows.length} rows for equipment type '${equipmentType}'.`;

          container.parsedData = { headers, rows, equipmentType };

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

      for (let i = 0; i < rows.length; i++) {
        const err = validateRow(rows[i], headers, equipmentType);
        if (err) {
          statusDiv.textContent = `Row ${i + 1} validation error: ${err}`;
          statusDiv.classList.add("error");
          return;
        }
      }

      statusDiv.textContent = "Saving data...";
      uploadBtn.disabled = true;

      const dataRows = rows.map(row => {
        const obj = {};
        headers.forEach((h, idx) => {
          obj[h] = row[idx];
        });
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

        if (resp.ok) {
          statusDiv.textContent = `Data saved successfully. Inserted ${result.insertedCount} rows.`;
          uploadBtn.disabled = true;
          uploadBtn.textContent = "Saved";
        } else {
          statusDiv.textContent = `Save failed: ${result.error || 'Unknown error'}`;
          statusDiv.classList.add("error");
          uploadBtn.disabled = false;
        }
      } catch (err) {
        statusDiv.textContent = "Network or server error during save.";
        statusDiv.classList.add("error");
        uploadBtn.disabled = false;
      }
    }
  });

  resetUI();
}
