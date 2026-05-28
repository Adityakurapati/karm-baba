const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file);
    }
  });
  return results;
}

const files = walk('./app');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  if (content.match(/\.company\./)) {
    // We only replace `.company.` with `?.company?.` where safe
    content = content.replace(/user\.company\./g, 'user?.company?.');
    content = content.replace(/supplier\.company\./g, 'supplier?.company?.');
    content = content.replace(/seller\.company\./g, 'seller?.company?.');
    content = content.replace(/buyer\.company\./g, 'buyer?.company?.');
    content = content.replace(/selectedUser\.company\./g, 'selectedUser?.company?.');
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Fixed company typing in', file);
  }
});
console.log('Done');
