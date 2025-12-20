const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '../logs');
const EMAIL_LOG_FILE = path.join(LOG_DIR, 'email-audit.log');

// Ensure logs directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

/**
 * Log email send attempts for auditing
 * @param {Object} emailData - Email information
 * @param {string} emailData.to - Recipient email
 * @param {string} emailData.subject - Email subject
 * @param {string} emailData.type - Email type (verification, reset, notification, etc.)
 * @param {boolean} emailData.success - Whether email was sent successfully
 * @param {string} [emailData.error] - Error message if failed
 * @param {string} [emailData.userId] - User ID if applicable
 */
function logEmail(emailData) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    to: emailData.to,
    subject: emailData.subject,
    type: emailData.type,
    success: emailData.success,
    error: emailData.error || null,
    userId: emailData.userId || null,
    ip: emailData.ip || null,
  };

  const logLine = JSON.stringify(logEntry) + '\n';

  try {
    fs.appendFileSync(EMAIL_LOG_FILE, logLine, 'utf8');
    
    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📧 Email Log: ${emailData.success ? '✅' : '❌'} ${emailData.type} to ${emailData.to}`);
    }
  } catch (error) {
    console.error('Failed to write email log:', error);
  }
}

/**
 * Get email logs with optional filtering
 * @param {Object} filters - Optional filters
 * @param {string} [filters.email] - Filter by recipient email
 * @param {string} [filters.type] - Filter by email type
 * @param {number} [filters.limit] - Limit number of results
 * @returns {Array} Array of log entries
 */
function getEmailLogs(filters = {}) {
  try {
    if (!fs.existsSync(EMAIL_LOG_FILE)) {
      return [];
    }

    const logs = fs.readFileSync(EMAIL_LOG_FILE, 'utf8')
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(entry => entry !== null);

    let filteredLogs = logs;

    if (filters.email) {
      filteredLogs = filteredLogs.filter(log => log.to === filters.email);
    }

    if (filters.type) {
      filteredLogs = filteredLogs.filter(log => log.type === filters.type);
    }

    if (filters.limit) {
      filteredLogs = filteredLogs.slice(-filters.limit);
    }

    return filteredLogs.reverse(); // Most recent first
  } catch (error) {
    console.error('Failed to read email logs:', error);
    return [];
  }
}

/**
 * Clean up old logs (older than specified days)
 * @param {number} daysToKeep - Number of days to keep logs
 */
function cleanOldLogs(daysToKeep = 90) {
  try {
    if (!fs.existsSync(EMAIL_LOG_FILE)) {
      return;
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const logs = fs.readFileSync(EMAIL_LOG_FILE, 'utf8')
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(entry => {
        if (!entry) return false;
        const logDate = new Date(entry.timestamp);
        return logDate >= cutoffDate;
      });

    const newContent = logs.map(log => JSON.stringify(log)).join('\n') + '\n';
    fs.writeFileSync(EMAIL_LOG_FILE, newContent, 'utf8');
    
    console.log(`🧹 Cleaned email logs older than ${daysToKeep} days`);
  } catch (error) {
    console.error('Failed to clean old logs:', error);
  }
}

module.exports = {
  logEmail,
  getEmailLogs,
  cleanOldLogs,
};
