const Announcement = require('../models/Announcement');

// Get active announcement (Public)
exports.getActiveAnnouncement = async (req, res) => {
  try {
    const now = new Date();
    const announcement = await Announcement.findOne({
      isActive: true,
      startDate: { $lte: now },
      $or: [
        { endDate: { $gte: now } },
        { endDate: null }
      ]
    }).sort({ createdAt: -1 }); // Get the most recent active one

    res.json({ success: true, data: announcement });
  } catch (error) {
    console.error('Error fetching active announcement:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all announcements (Admin)
exports.getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json({ success: true, data: announcements });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create announcement (Admin)
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, message, content, type, isActive, startDate, endDate, visibility, audience } = req.body;
    
    // If this one is active, optionally deactivate others? 
    // For now, we'll just let multiple exist but the public API only fetches the latest one.
    
    const announcement = await Announcement.create({
      title,
      message,
      content,
      type,
      isActive,
      visibility,
      audience,
      startDate,
      endDate
    });

    res.status(201).json({ success: true, data: announcement });
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update announcement (Admin)
exports.updateAnnouncement = async (req, res) => {
  try {
    // Only allow specific fields to be updated to avoid NoSQL injection via req.body
    const allowedFields = [
      'title',
      'message',
      'content',
      'type',
      'isActive',
      'visibility',
      'audience',
      'startDate',
      'endDate'
    ];
    const updateData = {};
    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        let value = req.body[field];

        // Reject any direct use of operator-style objects
        if (value && typeof value === 'object') {
          const keys = Array.isArray(value) ? [] : Object.keys(value);
          const hasOperatorKey = keys.some((k) => typeof k === 'string' && k.startsWith('$'));
          if (hasOperatorKey) {
            return res.status(400).json({
              success: false,
              message: 'Invalid update payload'
            });
          }
        // Normalize and validate per field to ensure only literal values are used
        switch (field) {
          case 'title':
          case 'message':
          case 'content':
          case 'type':
          case 'visibility':
          case 'audience':
            if (value != null && typeof value !== 'string') {
              // Coerce simple primitives to string, reject complex types
              if (typeof value === 'number' || typeof value === 'boolean') {
                value = String(value);
              } else {
                return res.status(400).json({
                  success: false,
                  message: 'Invalid value for ' + field
                });
              }
            }
            break;
          case 'isActive':
            if (typeof value === 'string') {
              if (value.toLowerCase() === 'true') {
                value = true;
              } else if (value.toLowerCase() === 'false') {
                value = false;
              }
            }
            if (typeof value !== 'boolean') {
              return res.status(400).json({
                success: false,
                message: 'Invalid value for isActive'
              });
            }
            break;
          case 'startDate':
          case 'endDate':
            if (value != null) {
              // Accept strings or Date-like input and convert to Date
              const date = new Date(value);
              if (Number.isNaN(date.getTime())) {
                return res.status(400).json({
                  success: false,
                  message: 'Invalid value for ' + field
                });
              }
              value = date;
            }
            break;
          default:
            break;
        }

        // Final safeguard: do not allow objects/arrays as update values
        if (value && typeof value === 'object') {
          return res.status(400).json({
            success: false,
            message: 'Invalid update payload'
          });
        }

        }

        updateData[field] = value;
      }
    }

    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    res.json({ success: true, data: announcement });
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete announcement (Admin)
exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);

    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    res.json({ success: true, data: {} });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
