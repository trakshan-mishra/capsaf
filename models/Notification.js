import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['transaction', 'price_alert', 'gst_due', 'invoice', 'security', 'portfolio', 'system'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  icon: String,
  data: mongoose.Schema.Types.Mixed,
  
  // Notification Channels
  channels: {
    pushNotification: {
      type: Boolean,
      default: true
    },
    email: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: false
    },
    inApp: {
      type: Boolean,
      default: true
    }
  },
  
  // Status
  status: {
    read: {
      type: Boolean,
      default: false
    },
    readAt: Date,
    archived: {
      type: Boolean,
      default: false
    },
    archivedAt: Date
  },
  
  // Priority
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Action
  action: {
    type: {
      type: String,
      enum: ['url', 'deeplink', 'action', 'none']
    },
    target: String
  },
  
  // Timing
  createdAt: {
    type: Date,
    default: Date.now
  },
  scheduledFor: Date,
  expiresAt: Date,
  sentAt: Date,
  
  // Delivery tracking
  deliveryStatus: {
    push: {
      sent: Boolean,
      sentAt: Date,
      read: Boolean,
      readAt: Date
    },
    email: {
      sent: Boolean,
      sentAt: Date,
      opened: Boolean,
      openedAt: Date
    },
    sms: {
      sent: Boolean,
      sentAt: Date
    }
  },
  
  // Tags and Categories
  tags: [String],
  category: String
}, { timestamps: true });

// Indexes for performance
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, 'status.read': 1 });
notificationSchema.index({ userId: 1, type: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.status.read = true;
  this.status.readAt = new Date();
  return this.save();
};

// Method to archive
notificationSchema.methods.archive = function() {
  this.status.archived = true;
  this.status.archivedAt = new Date();
  return this.save();
};

export default mongoose.model('Notification', notificationSchema);
