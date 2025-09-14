const fs = require('fs');
const path = require('path');

// Read the Dashboard.jsx file
const filePath = path.join(__dirname, 'frontend', 'src', 'pages', 'Dashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace all remaining emoji icons with clean text or remove them
content = content.replace(/(<div className="stat-icon">)[^<]*(<\/div>)/g, '$1$2'); // Remove content from stat-icon divs
content = content.replace(/(<button className="btn-remind"[^>]*>)🔔(<\/button>)/g, '$1Remind$2');
content = content.replace(/(<button className="btn-refund"[^>]*>)↩️(<\/button>)/g, '$1Refund$2');
content = content.replace(/(<button className="reconcile-btn">)⚖️ Reconcile(<\/button>)/g, '$1Reconcile$2');
content = content.replace(/(<button className="btn-dispute"[^>]*>)⚠️(<\/button>)/g, '$1Dispute$2');

// Write the file back
fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully removed all remaining emoji icons from Dashboard.jsx!');
