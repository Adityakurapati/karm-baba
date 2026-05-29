const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get, update } = require('firebase/database');

const firebaseConfig = {
  apiKey: "mock-key",
  authDomain: "mock.firebaseapp.com",
  databaseURL: "https://karm-baba-default-rtdb.firebaseio.com",
  projectId: "karm-baba",
  storageBucket: "karm-baba.appspot.com",
  messagingSenderId: "mock",
  appId: "mock"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

async function fixRoles() {
  const usersRef = ref(database, 'users');
  const snapshot = await get(usersRef);
  
  if (snapshot.exists()) {
    const users = snapshot.val();
    const updates = {};
    for (const userId in users) {
      if (users[userId].organizationId && users[userId].role !== 'admin' && users[userId].role !== 'super_admin') {
        updates[`${userId}/role`] = 'admin';
        console.log(`Will update user ${users[userId].email} to admin.`);
      }
    }
    
    if (Object.keys(updates).length > 0) {
      await update(usersRef, updates);
      console.log('Successfully upgraded organization owners to admin role!');
    } else {
      console.log('No users needed fixing.');
    }
  }
  process.exit(0);
}

fixRoles().catch(console.error);
