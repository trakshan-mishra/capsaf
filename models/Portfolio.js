import mongoose from 'mongoose';

const portfolioSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  holdings: [{
    cryptoId: String,
    symbol: {
      type: String,
      required: true,
      uppercase: true
    },
    name: String,
    amount: {
      type: Number,
      required: true,
      default: 0
    },
    averageBuyPrice: Number,
    totalInvested: Number,
    currentPrice: Number,
    currentValue: Number,
    percentageChange: Number,
    gainLoss: Number,
    gainLossPercentage: Number,
    lastUpdated: Date,
    acquisitionDate: Date,
    source: {
      type: String,
      enum: ['purchase', 'transfer', 'mining', 'stake', 'airdrop']
    }
  }],
  totalValue: {
    type: Number,
    default: 0
  },
  totalInvested: {
    type: Number,
    default: 0
  },
  totalGainLoss: {
    type: Number,
    default: 0
  },
  totalGainLossPercentage: {
    type: Number,
    default: 0
  },
  performanceHistory: [{
    date: Date,
    value: Number,
    gainLoss: Number,
    percentageChange: Number
  }],
  riskProfile: {
    type: String,
    enum: ['conservative', 'moderate', 'aggressive'],
    default: 'moderate'
  },
  diversificationScore: {
    type: Number,
    min: 0,
    max: 100
  },
  lastSyncedAt: Date,
  syncSource: {
    type: String,
    enum: ['manual', 'exchange_api', 'wallet_address']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Calculate portfolio metrics
portfolioSchema.methods.calculateMetrics = function() {
  this.totalValue = this.holdings.reduce((sum, h) => sum + (h.currentValue || 0), 0);
  this.totalInvested = this.holdings.reduce((sum, h) => sum + (h.totalInvested || 0), 0);
  this.totalGainLoss = this.totalValue - this.totalInvested;
  this.totalGainLossPercentage = this.totalInvested > 0 
    ? (this.totalGainLoss / this.totalInvested) * 100 
    : 0;
  
  // Calculate Herfindahl index for diversification
  const hIndex = this.holdings.reduce((sum, h) => {
    const percentage = this.totalValue > 0 ? (h.currentValue / this.totalValue) : 0;
    return sum + (percentage * percentage);
  }, 0);
  
  this.diversificationScore = Math.round((1 - hIndex) * 100);
};

portfolioSchema.pre('save', function() {
  this.calculateMetrics();
});

export default mongoose.model('Portfolio', portfolioSchema);
