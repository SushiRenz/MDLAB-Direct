const { validationResult } = require('express-validator');
const Bill = require('../models/Bill');
const Transaction = require('../models/Transaction');
const Payment = require('../models/Payment');
const BillingRate = require('../models/BillingRate');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get finance dashboard stats
// @route   GET /api/finance/stats
// @access  Private/Admin
const getFinanceStats = asyncHandler(async (req, res) => {
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  // Bills stats
  const totalOutstanding = await Bill.aggregate([
    { $match: { status: 'pending' } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ]);

  const pendingBills = await Bill.countDocuments({ status: 'pending' });
  const paidThisMonth = await Bill.countDocuments({ 
    status: 'paid', 
    updatedAt: { $gte: startOfMonth }
  });
  const overdueBills = await Bill.countDocuments({ status: 'overdue' });

  // Transaction stats
  const todayRevenue = await Transaction.aggregate([
    { 
      $match: { 
        status: 'completed',
        transactionDate: { $gte: startOfToday }
      }
    },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  const weekRevenue = await Transaction.aggregate([
    { 
      $match: { 
        status: 'completed',
        transactionDate: { $gte: startOfWeek }
      }
    },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  const cashPayments = await Transaction.aggregate([
    { 
      $match: { 
        status: 'completed',
        paymentMethod: 'cash',
        transactionDate: { $gte: startOfMonth }
      }
    },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  const cardPayments = await Transaction.aggregate([
    { 
      $match: { 
        status: 'completed',
        paymentMethod: { $in: ['credit_card', 'debit_card'] },
        transactionDate: { $gte: startOfMonth }
      }
    },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  // Payment stats
  const totalCollected = await Payment.aggregate([
    { $match: { status: 'verified' } },
    { $group: { _id: null, total: { $sum: '$amountPaid' } } }
  ]);

  const pendingVerification = await Payment.countDocuments({ status: 'pending' });
  const refundsProcessed = await Payment.countDocuments({ status: 'refunded' });

  const totalBills = await Bill.countDocuments({});
  const paidBills = await Bill.countDocuments({ status: 'paid' });
  const collectionRate = totalBills > 0 ? ((paidBills / totalBills) * 100).toFixed(1) : 0;

  res.status(200).json({
    success: true,
    data: {
      bills: {
        totalOutstanding: totalOutstanding[0]?.total || 0,
        pendingBills,
        paidThisMonth,
        overdueBills
      },
      transactions: {
        todayRevenue: todayRevenue[0]?.total || 0,
        weekRevenue: weekRevenue[0]?.total || 0,
        cashPayments: cashPayments[0]?.total || 0,
        cardPayments: cardPayments[0]?.total || 0
      },
      payments: {
        totalCollected: totalCollected[0]?.total || 0,
        pendingVerification,
        refundsProcessed,
        collectionRate: parseFloat(collectionRate)
      }
    }
  });
});

// @desc    Get all bills
// @route   GET /api/finance/bills
// @access  Private/Admin
const getBills = asyncHandler(async (req, res) => {
  const { 
    search, 
    status, 
    page = 1, 
    limit = 10,
    sortBy = 'dateIssued',
    sortOrder = 'desc'
  } = req.query;

  let query = {};
  
  if (search) {
    query.$or = [
      { billId: { $regex: search, $options: 'i' } },
      { patientName: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (status && status !== 'all') {
    query.status = status;
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const bills = await Bill.find(query)
    .populate('patientId', 'name email')
    .populate('createdBy', 'name')
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Bill.countDocuments(query);

  res.status(200).json({
    success: true,
    count: bills.length,
    total,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit)
    },
    data: bills
  });
});

// @desc    Create new bill
// @route   POST /api/finance/bills
// @access  Private/Admin
const createBill = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array()
    });
  }

  const { patientId, services, discount = 0, tax = 0, dueDate, notes } = req.body;

  // Verify patient exists
  const patient = await User.findById(patientId);
  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'Patient not found'
    });
  }

  // Calculate totals
  const subtotal = services.reduce((sum, service) => sum + (service.price * service.quantity), 0);
  const totalAmount = subtotal - discount + tax;

  const bill = await Bill.create({
    patientId,
    patientName: patient.name,
    services,
    subtotal,
    discount,
    tax,
    totalAmount,
    dueDate: new Date(dueDate),
    notes,
    createdBy: req.user.id
  });

  await bill.populate('patientId', 'name email');
  await bill.populate('createdBy', 'name');

  res.status(201).json({
    success: true,
    data: bill
  });
});

// @desc    Get all transactions
// @route   GET /api/finance/transactions
// @access  Private/Admin
const getTransactions = asyncHandler(async (req, res) => {
  const { 
    search, 
    paymentMethod, 
    status,
    startDate,
    endDate,
    page = 1, 
    limit = 10,
    sortBy = 'transactionDate',
    sortOrder = 'desc'
  } = req.query;

  let query = {};
  
  if (search) {
    query.$or = [
      { transactionId: { $regex: search, $options: 'i' } },
      { patientName: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (paymentMethod && paymentMethod !== 'all') {
    query.paymentMethod = paymentMethod;
  }

  if (status && status !== 'all') {
    query.status = status;
  }

  if (startDate && endDate) {
    query.transactionDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const transactions = await Transaction.find(query)
    .populate('patientId', 'name email')
    .populate('processedBy', 'name')
    .populate('billId', 'billId')
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Transaction.countDocuments(query);

  res.status(200).json({
    success: true,
    count: transactions.length,
    total,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit)
    },
    data: transactions
  });
});

// @desc    Create new transaction
// @route   POST /api/finance/transactions
// @access  Private/Admin
const createTransaction = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array()
    });
  }

  const { billId, paymentMethod, referenceNumber, notes } = req.body;

  // Verify bill exists
  const bill = await Bill.findById(billId);
  if (!bill) {
    return res.status(404).json({
      success: false,
      message: 'Bill not found'
    });
  }

  const transaction = await Transaction.create({
    billId,
    patientId: bill.patientId,
    patientName: bill.patientName,
    description: `Payment for ${bill.billId} - ${bill.services.map(s => s.name).join(', ')}`,
    amount: bill.totalAmount,
    paymentMethod,
    referenceNumber,
    processedBy: req.user.id,
    notes
  });

  // Update bill status to paid
  bill.status = 'paid';
  bill.paymentMethod = paymentMethod;
  bill.updatedBy = req.user.id;
  await bill.save();

  // Create payment record
  const payment = await Payment.create({
    billId,
    transactionId: transaction._id,
    patientId: bill.patientId,
    patientName: bill.patientName,
    amountPaid: bill.totalAmount,
    paymentMethod,
    referenceNumber,
    status: paymentMethod === 'cash' ? 'verified' : 'pending',
    verifiedBy: paymentMethod === 'cash' ? req.user.id : null,
    verificationDate: paymentMethod === 'cash' ? new Date() : null
  });

  await transaction.populate('patientId', 'name email');
  await transaction.populate('processedBy', 'name');

  res.status(201).json({
    success: true,
    data: {
      transaction,
      payment
    }
  });
});

// @desc    Get all payments
// @route   GET /api/finance/payments
// @access  Private/Admin
const getPayments = asyncHandler(async (req, res) => {
  const { 
    search, 
    status, 
    page = 1, 
    limit = 10,
    sortBy = 'paymentDate',
    sortOrder = 'desc'
  } = req.query;

  let query = {};
  
  if (search) {
    query.$or = [
      { paymentId: { $regex: search, $options: 'i' } },
      { patientName: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (status && status !== 'all') {
    query.status = status;
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const payments = await Payment.find(query)
    .populate('patientId', 'name email')
    .populate('billId', 'billId')
    .populate('verifiedBy', 'name')
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Payment.countDocuments(query);

  res.status(200).json({
    success: true,
    count: payments.length,
    total,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit)
    },
    data: payments
  });
});

// @desc    Verify payment
// @route   PUT /api/finance/payments/:id/verify
// @access  Private/Admin
const verifyPayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id);

  if (!payment) {
    return res.status(404).json({
      success: false,
      message: 'Payment not found'
    });
  }

  payment.status = 'verified';
  payment.verifiedBy = req.user.id;
  payment.verificationDate = new Date();
  await payment.save();

  await payment.populate('patientId', 'name email');
  await payment.populate('verifiedBy', 'name');

  res.status(200).json({
    success: true,
    data: payment
  });
});

// @desc    Get all billing rates
// @route   GET /api/finance/billing-rates
// @access  Private/Admin
const getBillingRates = asyncHandler(async (req, res) => {
  const { 
    search, 
    category, 
    isActive = true,
    page = 1, 
    limit = 50,
    sortBy = 'serviceName',
    sortOrder = 'asc'
  } = req.query;

  let query = { isActive };
  
  if (search) {
    query.$or = [
      { serviceName: { $regex: search, $options: 'i' } },
      { serviceCode: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (category && category !== 'all') {
    query.category = category;
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const rates = await BillingRate.find(query)
    .populate('createdBy', 'name')
    .populate('updatedBy', 'name')
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await BillingRate.countDocuments(query);

  res.status(200).json({
    success: true,
    count: rates.length,
    total,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit)
    },
    data: rates
  });
});

// @desc    Create new billing rate
// @route   POST /api/finance/billing-rates
// @access  Private/Admin
const createBillingRate = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array()
    });
  }

  const rate = await BillingRate.create({
    ...req.body,
    createdBy: req.user.id
  });

  await rate.populate('createdBy', 'name');

  res.status(201).json({
    success: true,
    data: rate
  });
});

// @desc    Update billing rate
// @route   PUT /api/finance/billing-rates/:id
// @access  Private/Admin
const updateBillingRate = asyncHandler(async (req, res) => {
  const rate = await BillingRate.findById(req.params.id);

  if (!rate) {
    return res.status(404).json({
      success: false,
      message: 'Billing rate not found'
    });
  }

  const updatedRate = await BillingRate.findByIdAndUpdate(
    req.params.id,
    { ...req.body, updatedBy: req.user.id },
    { new: true, runValidators: true }
  );

  await updatedRate.populate('updatedBy', 'name');

  res.status(200).json({
    success: true,
    data: updatedRate
  });
});

module.exports = {
  getFinanceStats,
  getBills,
  createBill,
  getTransactions,
  createTransaction,
  getPayments,
  verifyPayment,
  getBillingRates,
  createBillingRate,
  updateBillingRate
};