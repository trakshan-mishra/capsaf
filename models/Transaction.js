import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['buy', 'sell', 'transfer_out', 'transfer_in', 'stake', 'unstake', 'swap', 'earn', 'expense'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed', 'cancelled'],
    default: 'pending'
  },
  crypto: {
    symbol: {
      type: String,
      uppercase: true,
      required: true
    },
    name: String,
    amount: {
      type: Number,
      required: true
    },
    price: Number,
    value: {
      type: Number,
      required: true
    }
  },
  fiat: {
    currency: {
      type: String,
      default: 'USD'
    },
    amount: Number,
    exchangeRate: Number
  },
  counterparty: {
    type: {
      type: String,
      enum: ['exchange', 'user', 'contract', 'wallet', 'unknown']
    },
    address: String,
    name: String
  },
  fees: {
    amount: Number,
    currency: String,
    percentage: Number
  },
  tax: {
    gst: Number,
    capitalGainsTax: Number,
    incomeIncome: Number,
    other: Number
  },
  blockchain: {
    chainId: String,
    transactionHash: String,
    blockNumber: Number,
    gasUsed: Number,
    gasPrice: Number,
    networkFee: Number,
    confirmations: Number
  },
  notes: String,
  tags: [String],
  attachments: [{
    url: String,
    type: String,
    uploadedAt: Date
  }],
  timestamp: {
    type: Date,
    required: true
  },
  confirmedAt: Date,
  dateTime: {
    year: Number,
    month: Number,
    day: Number,
    quarter: Number
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for fast queries
transactionSchema.index({ userId: 1, timestamp: -1 });
transactionSchema.index({ userId: 1, type: 1 });
transactionSchema.index({ userId: 1, 'crypto.symbol': 1 });
transactionSchema.index({ userId: 1, status: 1 });

// Extract year, month, day for tax reporting
transactionSchema.pre('save', function() {
  const date = this.timestamp || new Date();
  this.dateTime = {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    quarter: Math.ceil((date.getMonth() + 1) / 3)
  };
});

// Method to calculate total cost (including fees)
transactionSchema.methods.getTotalCost = function() {
  return this.crypto.value + (this.fees?.amount || 0) + Object.values(this.tax || {}).reduce((a, b) => a + (b || 0), 0);
};

// Method to get tax summary
transactionSchema.methods.getTaxSummary = function() {
  return {
    gst: this.tax?.gst || 0,
    capitalGains: this.tax?.capitalGainsTax || 0,
    income: this.tax?.incomeIncome || 0,
    other: this.tax?.other || 0,
    total: Object.values(this.tax || {}).reduce((a, b) => a + (b || 0), 0)
  };
};

export default mongoose.model('Transaction', transactionSchema);
