const fs = require('fs');
let content = fs.readFileSync('lib/types.ts', 'utf8');
let lines = content.split('\n');

const startIndex = 370;
const endIndex = 371;

const correctLines = `export interface RolePermission {
  role: UserRole;
  permissions: string[];
}

export interface ActivityLog {
  id: string; // The {logId}
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  description: string;
  timestamp: Date;
}
`;

lines.splice(startIndex, endIndex - startIndex + 1, correctLines);
fs.writeFileSync('lib/types.ts', lines.join('\n'));
console.log('Fixed types.ts');
