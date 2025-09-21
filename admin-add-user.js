export function showAddUser(container) {
  container.innerHTML = `
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
  `;
  // Add JS logic for add-user-form submission here
}
