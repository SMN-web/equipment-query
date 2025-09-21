export function showAdminPanel(container) {
  container.innerHTML = `
  <div id="admin-panel" class="panel">
    <h2>👑 Admin Dashboard</h2>
    <p id="admin-msg"></p>
    <button class="logout-btn" onclick="logout()">Logout</button>
    <div class="main-tab-buttons">
      <button data-main="user-section" class="main-tab active">👥 Users</button>
      <button data-main="equipment-section" class="main-tab">🛠 Equipment</button>
      <button data-main="rigging-section" class="main-tab">🪝 Rigging</button>
    </div>
    <div id="user-section" class="main-section">
      <div class="sub-tab-buttons">
        <button data-target="add-user-sub" class="user-subtab active">➕ Add User</button>
        <button data-target="user-control-sub" class="user-subtab">🧑‍💼 User Control</button>
        <button data-target="user-logs-sub" class="user-subtab">📓 User Logs</button>
      </div>
      <div id="add-user-sub" class="user-subsection">
        <h3>Add New User</h3>
        <form id="add-user-form">
          <input id="new-name" type="text" name="name" placeholder="Name" required />
          <input id="new-email" type="email" name="email" placeholder="Email" required />
          <select id="new-role" name="role" required>
            <option value="" disabled selected>Select Role</option>
            <option value="user">User</option>
            <option value="moderator">Moderator</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit">Add User</button>
        </form>
        <p id="add-user-msg"></p>
      </div>
      <div id="user-control-sub" class="user-subsection hidden">
        <h3>🧑‍💼 Modify + Delete Users</h3>
        <div id="user-control-list"><p>Loading users...</p></div>
      </div>
      <div id="user-logs-sub" class="user-subsection hidden">
        <h3>📓 User Logs</h3>
        <ul class="user-log-list" id="user-logs-list">
          <li>
            <span class="log-username">Loading...</span>
            <span class="log-role"></span>
            <span class="log-status"></span>
            <span class="log-lastseen"></span>
          </li>
        </ul>
      </div>
    </div>
    <div id="equipment-section" class="main-section hidden">
      <div class="equip-menu">
        <div class="equip-menu-group" data-group="dashboard">
          📊 Dashboard <span class="arrow">▶</span>
        </div>
        <div class="equip-submenu hidden" data-parent="dashboard">
          <button data-target="equip-dashboard">Show Summary</button>
        </div>
        <div class="equip-menu-group" data-group="manage">
          🛠 Manage <span class="arrow">▶</span>
        </div>
        <div class="equip-submenu hidden" data-parent="manage">
          <button data-target="equip-upload">⬆ Upload</button>
          <button data-target="equip-list">📋 List</button>
          <button data-target="equip-edit">✏️ Edit</button>
        </div>
        <div class="equip-menu-group" data-group="control">
          ⚙ Control <span class="arrow">▶</span>
        </div>
        <div class="equip-submenu hidden" data-parent="control">
        </div>
      </div>
      <div id="equip-dashboard" class="equip-subsection hidden">
        <div id="equipment-dashboard-summary">
          <h3>📊 Equipment Summary</h3>
          <h4>Crane</h4>
          <ul>
            <li>Crawler Cranes: <span id="stat-crawler"></span></li>
            <li>Mobile Cranes: <span id="stat-mobile"></span></li>
          </ul>
          <h4>Manlift</h4>
          <ul id="manlift-sizes-list"></ul>
          <button id="refresh-dashboard-btn">🔄 Refresh Dashboard</button>
        </div>
      </div>
      <div id="equip-upload" class="equip-subsection hidden">
        <h3>⬆ Upload Equipment CSV</h3>
        <div class="csv-upload-box">
          <label><strong>Upload CSV:</strong></label>
          <input id="csvFile" type="file" accept=".csv" />
          <button id="uploadCsvBtn" type="button">Upload</button>
          <div id="csv-status"></div>
        </div>
        <div id="equipment-table"><p>No data loaded yet.</p></div>
      </div>
      <div id="equip-list" class="equip-subsection hidden">
        <h3 class="flex-between">
          <span>📋 Equipment List</span>
          <div class="dropdown-wrapper">
            <button id="download-btn" type="button">Download ▼</button>
            <ul id="download-menu" class="download-menu">
              <li data-format="csv">Download CSV</li>
              <li data-format="pdf">Download PDF</li>
              <li data-format="image">Download Image</li>
            </ul>
          </div>
        </h3>
        <div id="manage-table-container">Loading...</div>
      </div>
      <div id="equip-edit" class="equip-subsection hidden">
        <h3>✏️ Edit Equipment</h3>
        <div id="edit-table-container">Loading...</div>
      </div>
    </div>
    <div id="rigging-section" class="main-section hidden">
      <div class="sub-tab-buttons">
        <button data-target="rigging-details" class="rigging-subtab active">📄 Rigging Details</button>
        <button data-target="rigging-logs" class="rigging-subtab">📓 Rigging Logs</button>
      </div>
      <div id="rigging-details" class="rigging-subsection">
        <div class="coming-soon-card"><span>🪝</span> Rigging Details coming soon</div>
      </div>
      <div id="rigging-logs" class="rigging-subsection hidden">
        <div class="coming-soon-card"><span>📓</span> Rigging Logs coming soon</div>
      </div>
    </div>
  </div>
  `;
}
