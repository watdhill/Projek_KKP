// Script to analyze and fix field ordering logic
// This script will help understand the current field selection flow

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../frontend/src/pages/MasterDataSection.jsx');
const content = fs.readFileSync(filePath, 'utf8');

// Find all occurrences of selectedFieldIds
const lines = content.split('\n');
const relevantLines = [];

lines.forEach((line, index) => {
    if (line.includes('selectedFieldIds') ||
        line.includes('field_ids') ||
        line.includes('onToggle') ||
        line.includes('handleToggle')) {
        relevantLines.push({
            lineNumber: index + 1,
            content: line.trim()
        });
    }
});

console.log('=== Relevant lines found ===');
console.log(JSON.stringify(relevantLines, null, 2));
console.log(`\nTotal: ${relevantLines.length} lines`);
