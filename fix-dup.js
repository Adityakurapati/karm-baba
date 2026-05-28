const fs = require('fs');
let content = fs.readFileSync('lib/types.ts', 'utf8');
let lines = content.split('\n');

// 372 is index 371, 592 is index 591
lines.splice(371, 592 - 371 + 1);

fs.writeFileSync('lib/types.ts', lines.join('\n'));
console.log('Removed duplicate lines');
