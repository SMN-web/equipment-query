export function showUserLogs(container) {
  container.innerHTML = `
    <h3>📓 User Logs</h3>
    <div style="display:flex; gap:12px; align-items:center; margin-bottom:14px;">
      <select id="role-filter">
        <option value="">All Roles</option>
        <option value="admin">Admin</option>
        <option value="moderator">Moderator</option>
        <option value="user">User</option>
      </select>
      <input type="text" id="log-search" placeholder="Search by name or username..." style="width:220px;">
    </div>
    <div id="user-log-cards" style="margin-bottom:10px;"></div>
    <div id="pagination" style="margin-top:12px; text-align:center;"></div>
  `;

  function parseISOToLocal(dt) {
    // Safe for all ISO strings like 2025-09-21T15:35:25.431Z
    return dt ? new Date(dt) : null;
  }
  function formatDatetime(dtString) {
    const d = parseISOToLocal(dtString);
    if (!d) return '';
    const day = d.getDate().toString().padStart(2, '0');
    const month = d.toLocaleString('en-US', { month: 'short' });
    const year = d.getFullYear().toString().substr(2,2);
    let hour = d.getHours() % 12 || 12;
    hour = hour.toString().padStart(2, '0');
    const min = d.getMinutes().toString().padStart(2, '0');
    const ampm = d.getHours() < 12 ? 'AM' : 'PM';
    return `${day}-${month}-${year}, ${hour}:${min} ${ampm}`;
  }
  function timeAgo(dateStr) {
    const then = parseISOToLocal(dateStr);
    if (!then) return "";
    const now = new Date();
    const seconds = Math.floor((now - then) / 1000);
    if (isNaN(seconds) || seconds < 0) return "";
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    const years = Math.floor(days / 365);
    return `${years}y ago`;
  }

  let users = [];
  let total = 0;
  let currentPage = 1;
  const PAGE_SIZE = 10;

  function fetchAndRender(page = 1) {
    const roleVal = container.querySelector("#role-filter").value;
    const searchVal = container.querySelector("#log-search").value.trim();
    const params = new URLSearchParams({
      page,
      limit: PAGE_SIZE,
      ...(roleVal && { role: roleVal }),
      ...(searchVal && { search: searchVal }),
    });
    fetch(`https://ad-us-lo.smnglobal.workers.dev/api/user-logs?${params.toString()}`, {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('auth_token') }
    })
      .then(r => r.json())
      .then(data => {
        users = data.users || [];
        total = data.total || 0;
        currentPage = page;
        renderCards();
      });
  }

  function renderCards() {
    const cardDiv = container.querySelector("#user-log-cards");
    cardDiv.innerHTML = users.length === 0
      ? '<div style="padding:24px;">No users found.</div>'
      : users.map((user, idx) => {
          let infoLines = ``;
          if (user.currentStatus === 'logged_out') {
            infoLines += `<div><span style="font-weight:600;">Logout time:</span> ${user.logoutAt ? formatDatetime(user.logoutAt) : ''}</div>`;
            infoLines += `<div><span style="font-weight:600;">Status:</span>
              <span style="color:#d33; font-weight:600;">Logged out</span>
              </div>`;
          } else {
            infoLines += `<div><span style="font-weight:600;">Login time:</span> ${user.loginAt ? formatDatetime(user.loginAt) : ''}</div>`;
            infoLines += `<div><span style="font-weight:600;">Status:</span>
              <span style="color:#080; font-weight:600;">Last active ${user.lastActiveAt ? timeAgo(user.lastActiveAt) : ''}</span>
              </div>`;
          }
          return `
        <div style="display:flex; align-items:center; box-shadow:0 2px 8px #eee; border-radius:8px; margin-bottom:10px; padding:16px;">
          <div style="font-weight:700; font-size:20px; width:30px; margin-right:10px;">${(currentPage - 1) * PAGE_SIZE + idx + 1}</div>
          <div style="flex:1;">
            <div><span style="font-weight:600;">Name:</span> ${user.name}</div>
            <div><span style="font-weight:600;">Username:</span> ${user.username}</div>
            <div><span style="font-weight:600;">Role:</span> ${user.role}</div>
            ${infoLines}
          </div>
        </div>
        `;
        }).join('');
    renderPagination();
  }

  function renderPagination() {
    const pagDiv = container.querySelector("#pagination");
    const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
    pagDiv.innerHTML = '';
    for (let i = 1; i <= pageCount; i++) {
      const btn = document.createElement('button');
      btn.textContent = i;
      btn.style = `width:32px; height:32px; margin:2px; border-radius:50%; border:${i===currentPage?'2px solid #117':''}; background:${i===currentPage?'#eef':''};`;
      btn.onclick = () => fetchAndRender(i);
      pagDiv.appendChild(btn);
    }
  }

  container.querySelector("#role-filter").addEventListener("change", () => fetchAndRender(1));
  container.querySelector("#log-search").addEventListener("input", () => fetchAndRender(1));
  fetchAndRender(1);
}
