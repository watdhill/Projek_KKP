// Quick fix script to remove smart ordering logic from masterDataController
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/controllers/masterDataController.js');
let content = fs.readFileSync(filePath, 'utf8');

// Replace the complex smart ordering logic with simple logic for INSERT
const insertPattern = /\/\/ Smart ordering: group fields with same judul together[\s\S]*?\/\/ Insert with order_index based on reordered array\s+const detailValues = reorderedFieldIds\.map/;
const insertReplacement = `// Use frontend order directly - frontend already sends fields grouped by tree structure
          const detailValues = fieldIds.map`;

content = content.replace(insertPattern, insertReplacement);

// Do the same for UPDATE
const updatePattern = /\/\/ Smart ordering: group fields with same judul together[\s\S]*?\/\/ Insert with order_index based on reordered array\s+const detailValues = reorderedFieldIds\.map/g;
content = content.replace(updatePattern, insertReplacement);

// Write back
fs.writeFileSync(filePath, content, 'utf8');
console.log('✓ Fixed masterDataController.js - removed smart ordering logic');
