export function showCraneStatus(container) {
  container.innerHTML = `
    <div class="demo-card">
      <h3>Crane Status Subsection</h3>
      <form id="crane-status-form">
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
      <p class="demo-txt">Demo JS loaded here.</p>
    </div>
  `;
}
