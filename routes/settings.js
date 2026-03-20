import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Get User Settings
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        profilePicture: user.profilePicture,
        preferences: user.preferences,
        subscriptionPlan: user.subscriptionPlan,
        kycStatus: user.kycStatus
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update Profile
router.put('/profile', async (req, res) => {
  try {
    const { firstName, lastName, phone, profilePicture } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        firstName,
        lastName,
        phone,
        profilePicture,
        updatedAt: new Date()
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Profile updated',
      data: user.toJSON()
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update Preferences
router.put('/preferences', async (req, res) => {
  try {
    const { preferences } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      { preferences },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Preferences updated',
      data: { preferences: user.preferences }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get Security Settings
router.get('/security', async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        twoFactorEnabled: user.twoFactorEnabled,
        biometricEnabled: user.biometricEnabled,
        authMethods: user.authMethods.map(m => ({
          type: m.type,
          verified: m.verified
        })),
        lastLogin: user.lastLogin,
        loginHistory: user.loginHistory.slice(-5)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Enable 2FA
router.post('/security/2fa/enable', async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    // Generate and send OTP
    const secret = Math.random().toString(36).substring(2, 15);
    user.twoFactorSecret = secret;
    user.twoFactorEnabled = true;
    await user.save();

    res.json({
      success: true,
      message: '2FA enabled',
      data: { secret }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Disable 2FA
router.post('/security/2fa/disable', async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    user.twoFactorEnabled = false;
    user.twoFactorSecret = null;
    await user.save();

    res.json({
      success: true,
      message: '2FA disabled'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get Wallet Addresses
router.get('/wallets', async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        mainWallet: user.walletAddress,
        wallets: user.walletAddresses || []
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add Wallet Address
router.post('/wallets', async (req, res) => {
  try {
    const { address, chain } = req.body;
    
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.walletAddresses = user.walletAddresses || [];
    user.walletAddresses.push({
      address: address.toLowerCase(),
      chain,
      verified: false
    });

    await user.save();

    res.json({
      success: true,
      message: 'Wallet address added',
      data: user.walletAddresses
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Remove Wallet Address
router.delete('/wallets/:address', async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.walletAddresses = user.walletAddresses.filter(
      w => w.address !== req.params.address.toLowerCase()
    );

    await user.save();

    res.json({
      success: true,
      message: 'Wallet removed',
      data: user.walletAddresses
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get KYC Status
router.get('/kyc', async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        status: user.kycStatus,
        documents: user.kycDocuments || []
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Upload KYC Document
router.post('/kyc/upload', async (req, res) => {
  try {
    const { documentType, fileUrl } = req.body;
    
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.kycDocuments = user.kycDocuments || [];
    user.kycDocuments.push({
      type: documentType,
      documentType,
      uploadedAt: new Date(),
      verified: false
    });

    // Automatically initiate verification (in production, use real KYC service)
    setTimeout(() => {
      user.kycStatus = 'verified';
      user.save();
    }, 5000);

    await user.save();

    res.json({
      success: true,
      message: 'Document uploaded for verification',
      data: user.kycDocuments
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Change Password
router.post('/security/password/change', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.userId).select('+password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get Subscription Info
router.get('/subscription', async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        plan: user.subscriptionPlan,
        expiryDate: user.subscriptionExpiry,
        features: getFeaturesByPlan(user.subscriptionPlan)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete Account
router.delete('/account', async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = false;
    user.deletedAt = new Date();
    await user.save();

    res.json({ success: true, message: 'Account scheduled for deletion' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Helper function
function getFeaturesByPlan(plan) {
  const features = {
    free: [
      'Portfolio tracking',
      'Basic analytics',
      'Email support'
    ],
    pro: [
      'Portfolio tracking',
      'Advanced analytics',
      'AI advisor',
      'Tax optimization',
      'Priority support'
    ],
    enterprise: [
      'Everything in Pro',
      'API access',
      'Custom integrations',
      'Dedicated support',
      'Advanced reporting'
    ]
  };

  return features[plan] || features.free;
}

export default router;
