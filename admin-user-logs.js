export function showUserLogs(container) {
  container.innerHTML = `
    <h3>📓 User Logs</h3>
    <div style="display:flex; gap:12px; align-items:center; margin-bottom:10px;">
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

  // Demo data (replace with API data in production)
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
    const d = new Date(dtString);
    const options = { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true };
    return d.toLocaleString("en-US", options).replace(',', ',');
  }

  function formatStatus(lastActiveAt, logoutAt) {
    if (logoutAt) return "offline";
    const lastDt = new Date(lastActiveAt);
    const difMs = Date.now() - lastDt.getTime();
    const minutes = Math.floor(difMs / 60000);
    if (difMs < 60000) return "just now";
    if (minutes < 60) return `Last active ${minutes} min ago`;
    return "offline";
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
            <div><span style="font-weight:600;">Status:</span> <span style="color:${formatStatus(user.lastActiveAt, user.logoutAt)=='offline'?'#d33':'#080'}">${formatStatus(user.lastActiveAt, user.logoutAt)}</span></div>
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
