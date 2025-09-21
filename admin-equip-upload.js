export function showEquipUpload(container) {
  container.innerHTML = `
    <div class="demo-card">
      <h3>⬆ Upload Equipment CSV</h3>
      <div class="csv-upload-box">
        <label><strong>Upload CSV:</strong></label>
        <input id="csvFile" type="file" accept=".csv" />
        <button id="uploadCsvBtn" type="button">Upload</button>
        <div id="csv-status"></div>
      </div>
      <div id="equipment-table"><p>Uploaded CSV preview table will show here.</p></div>
      <p class="demo-txt">CSV importer will be wired here.</p>
    </div>
  `;
}
