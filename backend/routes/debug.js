const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Store frontend debug logs
router.post('/frontend-log', (req, res) => {
  try {
    const logEntry = req.body;
    const logLine = `[${logEntry.timestamp}] ${logEntry.message}\n${logEntry.data ? `Data: ${logEntry.data}\n` : ''}URL: ${logEntry.url}\n---\n`;
    
    const logFile = path.join(__dirname, '../logs/frontend-debug.log');
    
    // Create logs directory if it doesn't exist
    const logsDir = path.dirname(logFile);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    // Append to log file
    fs.appendFileSync(logFile, logLine);
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error logging frontend debug:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get frontend debug logs
router.get('/frontend-logs', (req, res) => {
  try {
    const logFile = path.join(__dirname, '../logs/frontend-debug.log');
    
    if (fs.existsSync(logFile)) {
      const logs = fs.readFileSync(logFile, 'utf8');
      res.status(200).json({ success: true, logs });
    } else {
      res.status(200).json({ success: true, logs: 'No logs found' });
    }
  } catch (error) {
    console.error('Error reading frontend logs:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Clear frontend debug logs
router.delete('/frontend-logs', (req, res) => {
  try {
    const logFile = path.join(__dirname, '../logs/frontend-debug.log');
    
    if (fs.existsSync(logFile)) {
      fs.unlinkSync(logFile);
    }
    
    res.status(200).json({ success: true, message: 'Logs cleared' });
  } catch (error) {
    console.error('Error clearing frontend logs:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;