import express from 'express';
import Notification from '../models/Notification.js';

const router = express.Router();

// Get All Notifications
router.get('/', async (req, res) => {
  try {
    const { archived = false, read, page = 1, limit = 20 } = req.query;
    
    const query = { userId: req.userId };
    
    if (archived === 'true') {
      query['status.archived'] = true;
    } else if (archived === 'false') {
      query['status.archived'] = false;
    }
    
    if (read === 'true') {
      query['status.read'] = true;
    } else if (read === 'false') {
      query['status.read'] = false;
    }

    const skip = (page - 1) * limit;
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      userId: req.userId,
      'status.read': false,
      'status.archived': false
    });

    res.json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get Unread Count
router.get('/unread/count', async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.userId,
      'status.read': false,
      'status.archived': false
    });

    res.json({ success: true, data: { unreadCount: count } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get Single Notification
router.get('/:id', async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mark as Read
router.patch('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    await notification.markAsRead();

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mark All as Read
router.patch('/read/all', async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.userId, 'status.read': false },
      {
        $set: {
          'status.read': true,
          'status.readAt': new Date()
        }
      }
    );

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Archive Notification
router.patch('/:id/archive', async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    await notification.archive();

    res.json({
      success: true,
      message: 'Notification archived',
      data: notification
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete Notification
router.delete('/:id', async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Send Test Notification
router.post('/test/send', async (req, res) => {
  try {
    const notification = new Notification({
      userId: req.userId,
      type: 'system',
      title: 'Test Notification',
      message: 'This is a test notification from CAPSAF',
      icon: '✅',
      priority: 'medium'
    });

    await notification.save();

    res.json({
      success: true,
      message: 'Test notification sent',
      data: notification
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Notification Preferences
router.get('/preferences', async (req, res) => {
  try {
    const preferences = {
      pushNotifications: true,
      emailNotifications: true,
      smsNotifications: false,
      priceAlerts: true,
      transactionAlerts: true,
      gstAlerts: true,
      securityAlerts: true
    };

    res.json({ success: true, data: preferences });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update Notification Preferences
router.put('/preferences', async (req, res) => {
  try {
    const { preferences } = req.body;
    
    // In production, save to user preferences
    res.json({
      success: true,
      message: 'Preferences updated',
      data: preferences
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
