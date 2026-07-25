const ActivityLog = require('../models/ActivityLog');

/**
 * Audit Logger Helper
 * Logs system activities directly into MongoDB.
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
    
    const userObj = customUser || req?.user || {};
    const performedBy = userObj.name || 'System User';
    const performedByRole = userObj.role || 'student';

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
    console.error('Failed to log activity to DB:', err.message);
  }
};

module.exports = { logActivity };
