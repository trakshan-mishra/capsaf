import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  phone: {
    type: String
  },
  password: {
    type: String,
    select: false
  },
  profilePicture: {
    type: String,
    default: null
  },
  authMethods: [{
    type: {
      type: String,
      enum: ['email', 'google', 'github', 'biometric', 'wallet'],
      required: true
    },
    providerId: String,
    verified: { type: Boolean, default: false }
  }],
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: {
    type: String,
    select: false
  },
  biometricEnabled: {
    type: Boolean,
    default: false
  },
  biometricCredentialId: {
    type: String,
    select: false
  },
  walletAddress: {
    type: String,
    lowercase: true
  },
  walletAddresses: [{
    address: String,
    chain: String,
    verified: Boolean
  }],
  preferences: {
    darkMode: { type: Boolean, default: true },
    notifications: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: true },
    marketAlerts: { type: Boolean, default: true }
  },
  kycStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  kycDocuments: [{
    type: String,
    documentType: String,
    uploadedAt: Date,
    verified: Boolean
  }],
  subscriptionPlan: {
    type: String,
    enum: ['free', 'pro', 'enterprise'],
    default: 'free'
  },
  subscriptionExpiry: Date,
  lastLogin: Date,
  loginHistory: [{
    timestamp: Date,
    ipAddress: String,
    userAgent: String,
    successful: Boolean
  }],
  sessions: [{
    token: String,
    createdAt: Date,
    expiresAt: Date,
    ipAddress: String,
    userAgent: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  deletedAt: Date
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(passwordToCheck) {
  return await bcryptjs.compare(passwordToCheck, this.password);
};

// Method to get full name
userSchema.methods.getFullName = function() {
  return `${this.firstName} ${this.lastName}`.trim();
};

// Hide sensitive fields
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.twoFactorSecret;
  delete obj.biometricCredentialId;
  return obj;
};

export default mongoose.model('User', userSchema);
