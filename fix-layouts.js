const fs = require('fs');
const path = require('path');

const walkSync = function(dir, filelist) {
  files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      filelist = walkSync(path.join(dir, file), filelist);
    }
    else {
      filelist.push(path.join(dir, file));
    }
  });
  return filelist;
};

const dirsToFix = [
  'app/organizations',
  'app/business',
  'app/admin'
];

let modifiedCount = 0;

dirsToFix.forEach(dir => {
  const fullDirPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullDirPath)) return;
  
  const files = walkSync(fullDirPath);
  
  files.forEach(file => {
    if (file.endsWith('.tsx')) {
      let content = fs.readFileSync(file, 'utf8');
      
      const hasSidebar = content.includes('import Sidebar from');
      const hasTopNavbar = content.includes('import TopNavbar from');
      
      if (hasSidebar && hasTopNavbar) {
        // Replace imports
        content = content.replace(/import Sidebar from ['"]@\/components\/Sidebar['"];?\n?/, '');
        content = content.replace(/import TopNavbar from ['"]@\/components\/TopNavbar['"];?\n?/, "import DashboardLayout from '@/components/DashboardLayout';\n");
        
        // Replace structure
        const pattern = /<div className="min-h-screen[^>]*>\s*<Sidebar \/>\s*<div className="flex-1[^>]*>\s*<TopNavbar \/>\s*<main className="flex-1 overflow-y-auto p-4 md:p-8 pt-24">\s*([\s\S]*?)\s*<\/main>\s*<\/div>\s*<\/div>/g;
        
        if (pattern.test(content)) {
          content = content.replace(pattern, `<DashboardLayout title="Dashboard">\n        <div className="p-4 md:p-8">\n          $1\n        </div>\n      </DashboardLayout>`);
          fs.writeFileSync(file, content);
          console.log('Fixed:', file);
          modifiedCount++;
        } else {
            console.log('Pattern not matched in:', file);
        }
      }
    }
  });
});

console.log(`Fixed ${modifiedCount} files.`);
