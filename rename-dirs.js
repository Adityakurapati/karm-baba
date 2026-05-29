const fs = require('fs');
const path = require('path');

const srcIdDir = path.join(__dirname, 'app', 'business', '[id]');
const destProfilesDir = path.join(__dirname, 'app', 'organizations', '[id]', 'business-profiles');
const destIdDir = path.join(destProfilesDir, '[businessId]');
const srcCreateDir = path.join(__dirname, 'app', 'business', 'create');
const destCreateDir = path.join(destProfilesDir, 'create');
const srcBaseDir = path.join(__dirname, 'app', 'business');

// Ensure destination exists
if (!fs.existsSync(destProfilesDir)) {
  fs.mkdirSync(destProfilesDir, { recursive: true });
}

try {
  if (fs.existsSync(srcIdDir)) {
    fs.renameSync(srcIdDir, destIdDir);
    console.log('Moved [id] to [businessId]');
  }
  if (fs.existsSync(srcCreateDir)) {
    fs.renameSync(srcCreateDir, destCreateDir);
    console.log('Moved create');
  }
  if (fs.existsSync(srcBaseDir)) {
    fs.rmSync(srcBaseDir, { recursive: true, force: true });
    console.log('Removed base business dir');
  }
} catch (e) {
  console.error(e);
}
