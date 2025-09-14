const fs = require('fs');
const path = require('path');

// Read the Dashboard.jsx file
const filePath = path.join(__dirname, 'frontend', 'src', 'pages', 'Dashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace remaining emoji buttons with text
content = content.replace(/(<button className="btn-send"[^>]*>)📧(<\/button>)/g, '$1Send$2');
content = content.replace(/(<button className="btn-print"[^>]*>)🖨️(<\/button>)/g, '$1Print$2');

// Write the file back
fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully removed remaining emoji icons from Dashboard.jsx buttons!');
