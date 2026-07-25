const SystemConfig = require('../models/SystemConfig');

// @desc    Get Maintenance Mode Status
// @route   GET /api/system/maintenance
const getMaintenanceStatus = async (req, res) => {
  try {
    const config = await SystemConfig.findOne({ key: 'maintenance_mode' });
    return res.json({ isMaintenanceMode: config ? Boolean(config.value) : false });
  } catch (err) {
    console.error('Error fetching maintenance mode:', err);
    return res.json({ isMaintenanceMode: false });
  }
};

// @desc    Toggle Maintenance Mode Status (Admin Only)
// @route   POST /api/system/maintenance
const toggleMaintenanceStatus = async (req, res) => {
  const { isMaintenanceMode } = req.body;

  if (isMaintenanceMode === undefined) {
    return res.status(400).json({ message: 'isMaintenanceMode boolean value is required' });
  }

  const newValue = Boolean(isMaintenanceMode);

  try {
    await SystemConfig.findOneAndUpdate(
      { key: 'maintenance_mode' },
      { value: newValue, updatedBy: req.user?.name || 'Admin' },
      { upsert: true, new: true }
    );
    console.log(`⚙️ Maintenance Mode updated to: ${newValue ? 'ON' : 'OFF'}`);
    return res.json({ isMaintenanceMode: newValue });
  } catch (err) {
    console.error('Error updating maintenance mode in DB:', err);
    return res.status(500).json({ message: 'Failed to update maintenance mode in database' });
  }
};

module.exports = {
  getMaintenanceStatus,
  toggleMaintenanceStatus
};
