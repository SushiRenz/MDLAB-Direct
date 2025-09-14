const fs = require('fs');
const path = require('path');

// Read the Dashboard.jsx file
const filePath = path.join(__dirname, 'frontend', 'src', 'pages', 'Dashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace all emoji buttons with text
content = content.replace(/(<button className="btn-view"[^>]*>)👁️(<\/button>)/g, '$1View$2');
content = content.replace(/(<button className="btn-edit"[^>]*>)✏️(<\/button>)/g, '$1Edit$2');
content = content.replace(/(<button className="btn-delete"[^>]*>)🗑️(<\/button>)/g, '$1Delete$2');

// Special case for the clear logs button
content = content.replace(/(<button className="clear-btn">)🗑️ Clear Old Logs(<\/button>)/g, '$1Clear Old Logs$2');

// Write the file back
fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully removed all emoji icons from Dashboard.jsx buttons!');
