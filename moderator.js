export function showModeratorPanel(container) {
  container.innerHTML = `
    <div id="moderator-panel" class="panel">
      <h2>🛡 Moderator Dashboard</h2>
      <p>Welcome, <span id="moderator-email"></span>.</p>
      <button class="logout-btn" onclick="logout()">Logout</button>
      <div class="main-tab-buttons">
        <button data-main="moderator-crane-section" class="main-tab active">🚧 Crane</button>
        <button data-main="moderator-manlift-section" class="main-tab">🛗 Manlift</button>
      </div>
      <!-- Crane Section -->
      <div id="moderator-crane-section" class="main-section">
        <div class="sub-tab-buttons">
          <button data-target="crane-status-sub" class="crane-subtab active">📊 Status</button>
          <button data-target="crane-location-sub" class="crane-subtab">📍 Location</button>
          <button data-target="crane-rigger-sub" class="crane-subtab">🪝 Rigger</button>
        </div>
        <div id="crane-status-sub" class="crane-subsection">
          <form id="crane-status-form" onsubmit="return false;">
            <label>Registration No:</label><br>
            <input class="reg_no" placeholder="Reg No">
            <button type="button" id="crane-search-btn">Search</button><br><br>
            <label>Plant No:</label><br>
            <input class="plant_no" placeholder="Plant No" readonly><br><br>
            <label>Description:</label><br>
            <textarea class="description" rows="2" style="width:96%;resize:vertical;" readonly></textarea><br><br>
            <label>Action:</label><br>
            <select class="action" id="crane-action">
              <option value="None">None</option>
              <option value="breakdown">Breakdown</option>
              <option value="repair">Repair</option>
            </select><br><br>
            <div id="crane-reason-block" style="display:none;">
              <label>Reason:</label><br>
              <textarea class="reason" placeholder="Reason"></textarea><br><br>
            </div>
            <label>Date & Time:</label><br>
            <input class="date" type="datetime-local"><br><br>
            <button type="button" id="crane-submit-btn">Submit</button>
          </form>
        </div>
        <div id="crane-location-sub" class="crane-subsection hidden">Crane location content</div>
        <div id="crane-rigger-sub" class="crane-subsection hidden">Crane rigger content</div>
      </div>
      <!-- Manlift Section -->
      <div id="moderator-manlift-section" class="main-section hidden">
        <div class="sub-tab-buttons">
          <button data-target="manlift-status-sub" class="manlift-subtab active">📊 Status</button>
          <button data-target="manlift-location-sub" class="manlift-subtab">📍 Location</button>
          <button data-target="manlift-banksman-sub" class="manlift-subtab">🪙 Banksman</button>
        </div>
        <div id="manlift-status-sub" class="manlift-subsection">
          <form id="manlift-status-form" onsubmit="return false;">
            <label>Registration No:</label><br>
            <input class="reg_no" placeholder="Reg No">
            <button type="button" id="manlift-search-btn">Search</button><br><br>
            <label>Plant No:</label><br>
            <input class="plant_no" placeholder="Plant No" readonly><br><br>
            <label>Description:</label><br>
            <textarea class="description" rows="2" style="width:96%;resize:vertical;" readonly></textarea><br><br>
            <label>Action:</label><br>
            <select class="action" id="manlift-action">
              <option value="None">None</option>
              <option value="breakdown">Breakdown</option>
              <option value="repair">Repair</option>
            </select><br><br>
            <div id="manlift-reason-block" style="display:none;">
              <label>Reason:</label><br>
              <textarea class="reason" placeholder="Reason"></textarea><br><br>
            </div>
            <label>Date & Time:</label><br>
            <input class="date" type="datetime-local"><br><br>
            <button type="button" id="manlift-submit-btn">Submit</button>
          </form>
        </div>
        <div id="manlift-location-sub" class="manlift-subsection hidden">Manlift location content</div>
        <div id="manlift-banksman-sub" class="manlift-subsection hidden">Manlift banksman content</div>
      </div>
    </div>
  `;
}
