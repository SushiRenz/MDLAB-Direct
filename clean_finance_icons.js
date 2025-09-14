const fs = require('fs');
const path = require('path');

// Read the Dashboard.jsx file
const filePath = path.join(__dirname, 'frontend', 'src', 'pages', 'Dashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Remove all SVG content from stat-icon divs (but keep the empty div)
content = content.replace(/<div className="stat-icon">\s*<svg[^>]*>[\s\S]*?<\/svg>\s*<\/div>/g, '<div className="stat-icon"></div>');

// Write the file back
fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully cleaned up all stat-icon SVGs in Finance sections!');
