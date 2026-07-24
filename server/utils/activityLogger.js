const ActivityLog = require('../models/ActivityLog');
const { inMemActivityLogs, generateId } = require('./inMemoryStore');

/**
 * Audit Logger Helper
 * Logs system activities (add/manage/change) with date, timestamp, user, and old -> new value diffs.
 */
const logActivity = async ({
  req,
  actionType,
  entityName,
  description,
  oldValue = 'N/A',
  newValue = 'N/A',
  customUser = null
}) => {
  try {
    const now = new Date();
    const dateStr = now.toISOString().substring(0, 10);
    
    // Determine performer name and role
    const userObj = customUser || req?.user || {};
    const performedBy = userObj.name || 'System User';
    const performedByRole = userObj.role || 'student';

    // 1. Save to MongoDB
    try {
      await ActivityLog.create({
        actionType,
        entityName,
        description,
        oldValue: String(oldValue),
        newValue: String(newValue),
        performedBy,
        performedByRole,
        date: dateStr,
        timestamp: now
      });
      console.log(`📝 Activity Logged (DB): ${actionType} - ${description} (by ${performedBy})`);
    } catch (err) {
      console.error('Error writing activity log to DB:', err.message);
    }

    // 2. Save to In-Memory Fallback Store
    inMemActivityLogs.push({
      _id: 'act_' + generateId(),
      actionType,
      entityName,
      description,
      oldValue: String(oldValue),
      newValue: String(newValue),
      performedBy,
      performedByRole,
      date: dateStr,
      timestamp: now,
      createdAt: now
    });
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
};

module.exports = { logActivity };
