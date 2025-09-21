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

  // Helper functions from your reference
  function parseDBDatetimeAsUTC(dt) {
    const m = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/.exec(dt);
    if (!m) return new Date(dt);
    return new Date(Date.UTC(+m[1], m[2]-1, +m[3], +m[4], +m[5], +m[6]));
  }
  function timeAgo(dateStr) {
    if (!dateStr) return "";
    const then = parseDBDatetimeAsUTC(dateStr);
    const now = new Date();
    const seconds = Math.floor((now - then) / 1000);
    if (isNaN(seconds)) return "";
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

  // Demo/mock data -- replace with API results when ready
  const ROLES = ['admin', 'moderator', 'user'];
  const demoUsers = [];
  const now = Date.now();
  for (let i = 1; i <= 22; i++) {
    const minutesAgo = Math.floor(Math.random() * 30);
    demoUsers.push({
      name: `Person ${i}`,
      username: `user${i}`,
      role: ROLES[i % ROLES.length],
      loginAt: new Date(now - (minutesAgo + 60) * 60000).toISOString(),
      logoutAt: i % 3 ? null : new Date(now - (minutesAgo - 1) * 60000).toISOString(),
      lastActiveAt: minutesAgo === 0 ? new Date(now).toISOString() : new Date(now - minutesAgo * 60000).toISOString(),
    });
  }

  let filteredUsers = [...demoUsers];
  let currentPage = 1;
  const PAGE_SIZE = 10;

  function formatDatetime(dtString) {
    if (!dtString) return '';
    const d = parseDBDatetimeAsUTC(dtString);
    const options = { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true };
    return d.toLocaleString("en-US", options).replace(',', ',');
  }

  function formatStatus(lastActiveAt, logoutAt) {
    if (logoutAt) return "offline";
    return `Last active ${timeAgo(lastActiveAt)}`;
  }

  function renderCards() {
    const cardDiv = container.querySelector("#user-log-cards");
    cardDiv.innerHTML = "";
    const firstIdx = (currentPage - 1) * PAGE_SIZE;
    const currPageUsers = filteredUsers.slice(firstIdx, firstIdx + PAGE_SIZE);
    currPageUsers.forEach((user, idx) => {
      cardDiv.innerHTML += `
        <div style="display:flex; align-items:center; box-shadow:0 2px 8px #eee; border-radius:8px; margin-bottom:10px; padding:16px;">
          <div style="font-weight:700; font-size:20px; width:30px; margin-right:10px;">${firstIdx + idx + 1}</div>
          <div style="flex:1;">
            <div><span style="font-weight:600;">Name:</span> ${user.name}</div>
            <div><span style="font-weight:600;">Username:</span> ${user.username}</div>
            <div><span style="font-weight:600;">Role:</span> ${user.role}</div>
            <div><span style="font-weight:600;">Login time:</span> ${formatDatetime(user.loginAt)}</div>
            <div><span style="font-weight:600;">Logout time:</span> ${user.logoutAt ? formatDatetime(user.logoutAt) : ''}</div>
            <div><span style="font-weight:600;">Status:</span> <span style="color:${user.logoutAt?'#d33':'#080'}">${formatStatus(user.lastActiveAt, user.logoutAt)}</span></div>
          </div>
        </div>
      `;
    });
    renderPagination();
  }

  function renderPagination() {
    const pagDiv = container.querySelector("#pagination");
    const pageCount = Math.ceil(filteredUsers.length / PAGE_SIZE);
    let html = '';
    for (let i = 1; i <= pageCount; i++) {
      html += `<button style="width:32px; height:32px; margin:2px; border-radius:50%; border:${i===currentPage?'2px solid #117':''}; background:${i===currentPage?'#eef':''};" onclick="goToPage${container.id || ''}(${i})">${i}</button>`;
    }
    pagDiv.innerHTML = html;
  }

  window[`goToPage${container.id || ''}`] = function(page) {
    currentPage = page;
    renderCards();
  };

  function filterAndSearch() {
    const roleSel = container.querySelector("#role-filter").value;
    const search = container.querySelector("#log-search").value.trim().toLowerCase();
    filteredUsers = demoUsers.filter(user => {
      const roleMatch = !roleSel || user.role === roleSel;
      const searchMatch =
        user.name.toLowerCase().includes(search) ||
        user.username.toLowerCase().includes(search);
      return roleMatch && (!search || searchMatch);
    });
    currentPage = 1;
    renderCards();
  }

  container.querySelector("#role-filter").addEventListener("change", filterAndSearch);
  container.querySelector("#log-search").addEventListener("input", filterAndSearch);

  filterAndSearch();
}
