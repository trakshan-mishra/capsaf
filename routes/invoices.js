import express from 'express';
import Invoice from '../models/Invoice.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get All Invoices
router.get('/', async (req, res) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;
    
    const query = { userId: req.userId };
    if (status) query.status = status;
    if (type) query.type = type;

    const skip = (page - 1) * limit;
    const invoices = await Invoice.find(query)
      .sort({ issueDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Invoice.countDocuments(query);

    res.json({
      success: true,
      data: invoices,
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

// Get Single Invoice
router.get('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    res.json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create Invoice
router.post('/', async (req, res) => {
  try {
    const invoiceNumber = `INV-${Date.now()}-${uuidv4().substring(0, 8)}`;
    
    const invoice = new Invoice({
      userId: req.userId,
      invoiceNumber,
      ...req.body,
      issueDate: req.body.issueDate || new Date()
    });

    await invoice.save();

    res.status(201).json({
      success: true,
      message: 'Invoice created',
      data: invoice
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update Invoice
router.put('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    Object.assign(invoice, req.body);
    await invoice.save();

    res.json({
      success: true,
      message: 'Invoice updated',
      data: invoice
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mark as Paid
router.patch('/:id/pay', async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    invoice.status = 'paid';
    invoice.paidDate = new Date();
    invoice.amountPaid = invoice.totalAmount;
    invoice.balanceDue = 0;
    await invoice.save();

    res.json({
      success: true,
      message: 'Invoice marked as paid',
      data: invoice
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get GST Summary
router.get('/gst/summary', async (req, res) => {
  try {
    const { year, month } = req.query;
    
    const query = { userId: req.userId };
    
    if (year || month) {
      query.issueDate = {};
      if (year) {
        query.issueDate.$gte = new Date(`${year}-01-01`);
        query.issueDate.$lte = new Date(`${year}-12-31`);
      }
      if (month) {
        query.issueDate.$gte = new Date(`${year}-${month}-01`);
        query.issueDate.$lte = new Date(`${year}-${parseInt(month) + 1}-01`);
      }
    }

    const invoices = await Invoice.find(query);

    const summary = {
      period: { year, month },
      totalInvoices: invoices.length,
      totalTaxableValue: 0,
      totalCGST: 0,
      totalSGST: 0,
      totalIGST: 0,
      totalGST: 0,
      totalWithGST: 0,
      byStatus: {}
    };

    invoices.forEach(inv => {
      const taxableValue = inv.subtotal - (inv.discountAmount || 0);
      summary.totalTaxableValue += taxableValue;
      summary.totalCGST += inv.tax.cgst.amount || 0;
      summary.totalSGST += inv.tax.sgst.amount || 0;
      summary.totalIGST += inv.tax.igst.amount || 0;
      summary.totalGST += inv.tax.totalTaxAmount || 0;
      summary.totalWithGST += inv.totalAmount || 0;
      summary.byStatus[inv.status] = (summary.byStatus[inv.status] || 0) + 1;
    });

    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get GST Return Format (GSTR-1 format)
router.get('/gst/return', async (req, res) => {
  try {
    const { month, year } = req.query;
    
    if (!month || !year) {
      return res.status(400).json({ success: false, message: 'Month and year are required' });
    }

    const query = {
      userId: req.userId,
      type: 'sales'
    };

    query.issueDate = {
      $gte: new Date(`${year}-${month}-01`),
      $lt: new Date(`${year}-${parseInt(month) + 1}-01`)
    };

    const invoices = await Invoice.find(query);

    const gstrReturn = {
      month,
      year,
      totalInvoices: invoices.length,
      intraState: {
        invoices: 0,
        value: 0,
        cgst: 0,
        sgst: 0
      },
      interState: {
        invoices: 0,
        value: 0,
        igst: 0
      },
      exempt: {
        invoices: 0,
        value: 0
      },
      invoiceList: []
    };

    invoices.forEach(inv => {
      const record = {
        invoiceNumber: inv.invoiceNumber,
        date: inv.issueDate,
        customerName: inv.customer.name,
        customerGST: inv.customer.gstNumber,
        value: inv.totalAmount,
        cgst: inv.tax.cgst.amount || 0,
        sgst: inv.tax.sgst.amount || 0,
        igst: inv.tax.igst.amount || 0
      };

      if (inv.tax.cgst.amount && inv.tax.sgst.amount) {
        gstrReturn.intraState.invoices++;
        gstrReturn.intraState.value += inv.totalAmount;
        gstrReturn.intraState.cgst += inv.tax.cgst.amount;
        gstrReturn.intraState.sgst += inv.tax.sgst.amount;
      } else if (inv.tax.igst.amount) {
        gstrReturn.interState.invoices++;
        gstrReturn.interState.value += inv.totalAmount;
        gstrReturn.interState.igst += inv.tax.igst.amount;
      }

      gstrReturn.invoiceList.push(record);
    });

    res.json({ success: true, data: gstrReturn });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete Invoice
router.delete('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    res.json({ success: true, message: 'Invoice deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
