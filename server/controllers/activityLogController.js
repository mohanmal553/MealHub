const ActivityLog = require('../models/ActivityLog');

// @desc    Get activity logs (ordered chronologically Old -> New by default)
// @route   GET /api/activity-logs?month=YYYY-MM&order=asc|desc
const getActivityLogs = async (req, res) => {
  const month = req.query.month || new Date().toISOString().substring(0, 7);
  const order = req.query.order === 'desc' ? -1 : 1;

  try {
    const dbLogs = await ActivityLog.find({ date: { $regex: `^${month}` } })
      .sort({ timestamp: order })
      .lean();

    return res.json(dbLogs || []);
  } catch (err) {
    console.error('Error fetching activity logs from DB:', err.message);
    return res.status(500).json({ message: 'Failed to fetch activity logs from database' });
  }
};

// @desc    Create manual activity log
// @route   POST /api/activity-logs
const createActivityLog = async (req, res) => {
  const { actionType, entityName, description, oldValue, newValue } = req.body;

  if (!description) {
    return res.status(400).json({ message: 'Description is required' });
  }

  const now = new Date();
  const dateStr = now.toISOString().substring(0, 10);
  const performedBy = req.user?.name || 'System User';
  const performedByRole = req.user?.role || 'student';

  try {
    const newLog = await ActivityLog.create({
      actionType: actionType || 'CUSTOM_ACTION',
      entityName: entityName || 'General',
      description,
      oldValue: String(oldValue || 'N/A'),
      newValue: String(newValue || 'N/A'),
      performedBy,
      performedByRole,
      date: dateStr,
      timestamp: now
    });
    return res.status(201).json(newLog);
  } catch (err) {
    console.error('Error creating activity log in DB:', err);
    return res.status(500).json({ message: 'Failed to create activity log in database' });
  }
};

module.exports = {
  getActivityLogs,
  createActivityLog
};
