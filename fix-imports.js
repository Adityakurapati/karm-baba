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
  
  if (content.includes('import { Sidebar }')) {
    content = content.replace(/import\s*\{\s*Sidebar\s*\}\s*from\s*['"]@\/components\/Sidebar['"];?/g, "import Sidebar from '@/components/Sidebar';");
    // Also try simple replace just in case
    content = content.replace("import { Sidebar } from '@/components/Sidebar';", "import Sidebar from '@/components/Sidebar';");
    content = content.replace('import { Sidebar } from "@/components/Sidebar";', 'import Sidebar from "@/components/Sidebar";');
    changed = true;
  }
  
  if (content.includes('import { TopNavbar }')) {
    content = content.replace(/import\s*\{\s*TopNavbar\s*\}\s*from\s*['"]@\/components\/TopNavbar['"];?/g, "import TopNavbar from '@/components/TopNavbar';");
    // Also try simple replace
    content = content.replace("import { TopNavbar } from '@/components/TopNavbar';", "import TopNavbar from '@/components/TopNavbar';");
    content = content.replace('import { TopNavbar } from "@/components/TopNavbar";', 'import TopNavbar from "@/components/TopNavbar";');
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Fixed imports in', file);
  }
});
console.log('Done');
