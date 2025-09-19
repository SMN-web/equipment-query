import { renderLogin } from './login.js';
import { renderAdmin } from './admin.js';
import { renderUser } from './user.js';
import { renderModerator } from './moderator.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const app = document.getElementById('app');
const db = getFirestore();

// Initial render
renderLogin(app);

// Watch login state
onAuthStateChanged(window.firebaseAuth, async (user) => {
  if (!user) {
    app.innerHTML = '';
    renderLogin(app);
  } else {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const role = userDoc.data()?.role;

      app.innerHTML = ''; // Clear old content
      if (role === 'admin') renderAdmin(app, user);
      else if (role === 'user') renderUser(app, user);
      else if (role === 'moderator') renderModerator(app, user);
      else renderLogin(app);
    } catch (err) {
      console.error(err);
      renderLogin(app);
    }
  }
});