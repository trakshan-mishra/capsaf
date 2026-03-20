import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['draft', 'issued', 'paid', 'overdue', 'cancelled'],
    default: 'draft'
  },
  type: {
    type: String,
    enum: ['sales', 'purchase', 'credit_note', 'debit_note'],
    default: 'sales'
  },
  issueDate: {
    type: Date,
    required: true
  },
  dueDate: Date,
  paidDate: Date,
  
  // Party Information
  issuer: {
    name: String,
    email: String,
    phone: String,
    address: String,
    gstNumber: String,
    panNumber: String
  },
  customer: {
    name: String,
    email: String,
    phone: String,
    address: String,
    gstNumber: String,
    panNumber: String
  },
  
  // Line Items
  items: [{
    description: String,
    quantity: Number,
    unitPrice: Number,
    amount: Number,
    transactionId: mongoose.Schema.Types.ObjectId,
    taxRate: Number,
    taxAmount: Number
  }],
  
  // Totals
  subtotal: {
    type: Number,
    required: true
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  discountPercentage: Number,
  
  // Tax Information
  tax: {
    cgst: {
      rate: { type: Number, default: 9 },
      amount: { type: Number, default: 0 }
    },
    sgst: {
      rate: { type: Number, default: 9 },
      amount: { type: Number, default: 0 }
    },
    igst: {
      rate: { type: Number, default: 18 },
      amount: { type: Number, default: 0 }
    },
    totalTaxAmount: Number
  },
  
  // Payment Information
  totalAmount: {
    type: Number,
    required: true
  },
  amountPaid: {
    type: Number,
    default: 0
  },
  balanceDue: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'card', 'upi', 'crypto', 'check', 'cash'],
    default: 'bank_transfer'
  },
  paymentDetails: {
    bankName: String,
    accountNumber: String,
    ifscCode: String,
    upiId: String,
    walletAddress: String
  },
  
  // Additional Details
  description: String,
  notes: String,
  terms: String,
  currency: {
    type: String,
    default: 'INR'
  },
  exchangeRate: Number,
  
  // Tax Compliance
  gstCompliant: {
    type: Boolean,
    default: true
  },
  hsn_code: String,
  sac_code: String,
  
  // Attachments
  attachments: [{
    url: String,
    type: String,
    uploadedAt: Date
  }],
  pdfUrl: String,
  
  // Audit
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

// Indexes
invoiceSchema.index({ userId: 1, issueDate: -1 });
invoiceSchema.index({ invoiceNumber: 1 });
invoiceSchema.index({ status: 1 });

// Calculate totals before saving
invoiceSchema.pre('save', function() {
  // Calculate subtotal from items
  if (this.items && this.items.length > 0) {
    this.subtotal = this.items.reduce((sum, item) => sum + (item.amount || 0), 0);
  }
  
  // Calculate GST
  const taxableAmount = this.subtotal - (this.discountAmount || 0);
  
  if (this.tax.cgst.rate) {
    this.tax.cgst.amount = (taxableAmount * this.tax.cgst.rate) / 100;
  }
  if (this.tax.sgst.rate) {
    this.tax.sgst.amount = (taxableAmount * this.tax.sgst.rate) / 100;
  }
  if (this.tax.igst.rate && !this.tax.cgst.amount && !this.tax.sgst.amount) {
    this.tax.igst.amount = (taxableAmount * this.tax.igst.rate) / 100;
  }
  
  this.tax.totalTaxAmount = (this.tax.cgst.amount || 0) + (this.tax.sgst.amount || 0) + (this.tax.igst.amount || 0);
  this.totalAmount = taxableAmount + this.tax.totalTaxAmount;
  this.balanceDue = this.totalAmount - (this.amountPaid || 0);
});

// Method to generate GST compliance report
invoiceSchema.methods.getGSTReport = function() {
  return {
    gstNumber: this.issuer.gstNumber,
    invoiceNumber: this.invoiceNumber,
    issueDate: this.issueDate,
    supplier: this.issuer.name,
    customer: this.customer.name,
    customerGST: this.customer.gstNumber,
    taxableValue: this.subtotal - (this.discountAmount || 0),
    cgst: this.tax.cgst.amount,
    sgst: this.tax.sgst.amount,
    igst: this.tax.igst.amount,
    totalTax: this.tax.totalTaxAmount,
    invoiceValue: this.totalAmount
  };
};

export default mongoose.model('Invoice', invoiceSchema);
