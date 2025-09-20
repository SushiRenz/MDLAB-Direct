const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Bill = require('./models/Bill');
const Transaction = require('./models/Transaction');
const Payment = require('./models/Payment');
const BillingRate = require('./models/BillingRate');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

// Create sample billing rates
const createBillingRates = async () => {
  try {
    await BillingRate.deleteMany({});
    
    // Get admin user for createdBy field
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('❌ No admin user found. Please run user seeding first.');
      return;
    }

    const billingRates = [
      {
        serviceName: 'Complete Blood Count (CBC)',
        serviceCode: 'CBC001',
        category: 'hematology',
        price: 800,
        description: 'Complete blood count with differential',
        turnaroundTime: '2-4 hours',
        sampleType: 'Blood',
        createdBy: admin._id
      },
      {
        serviceName: 'Urinalysis',
        serviceCode: 'URIN001',
        category: 'clinical_pathology',
        price: 300,
        description: 'Complete urinalysis with microscopy',
        turnaroundTime: '1-2 hours',
        sampleType: 'Urine',
        createdBy: admin._id
      },
      {
        serviceName: 'X-Ray Chest PA',
        serviceCode: 'XRAY001',
        category: 'radiology',
        price: 1200,
        description: 'Chest X-ray posteroanterior view',
        turnaroundTime: '30 minutes',
        sampleType: 'Digital Imaging',
        createdBy: admin._id
      },
      {
        serviceName: 'Blood Sugar (FBS)',
        serviceCode: 'FBS001',
        category: 'chemistry',
        price: 200,
        description: 'Fasting blood sugar test',
        turnaroundTime: '1 hour',
        sampleType: 'Blood',
        createdBy: admin._id
      },
      {
        serviceName: 'Lipid Profile',
        serviceCode: 'LIPID001',
        category: 'chemistry',
        price: 1500,
        description: 'Complete lipid panel including cholesterol, HDL, LDL, triglycerides',
        turnaroundTime: '2-4 hours',
        sampleType: 'Blood',
        createdBy: admin._id
      },
      {
        serviceName: 'Basic Health Package',
        serviceCode: 'PKG001',
        category: 'package',
        price: 2500,
        description: 'CBC + Urinalysis + FBS package deal',
        turnaroundTime: '4-6 hours',
        sampleType: 'Blood + Urine',
        isPackage: true,
        packageItems: [
          { serviceName: 'CBC', serviceCode: 'CBC001', price: 800 },
          { serviceName: 'Urinalysis', serviceCode: 'URIN001', price: 300 },
          { serviceName: 'FBS', serviceCode: 'FBS001', price: 200 }
        ],
        packageSavings: 800,
        createdBy: admin._id
      }
    ];

    const createdRates = await BillingRate.insertMany(billingRates);
    console.log(`✅ Created ${createdRates.length} billing rates`);
    return createdRates;
  } catch (error) {
    console.error('❌ Error creating billing rates:', error);
  }
};

// Create sample bills
const createSampleBills = async () => {
  try {
    await Bill.deleteMany({});
    
    // Get users
    const admin = await User.findOne({ role: 'admin' });
    const patients = await User.find({ role: 'patient' }).limit(3);
    
    if (!admin || patients.length === 0) {
      console.log('❌ Need admin and patients. Please run user seeding first.');
      return;
    }

    const bills = [
      {
        patientId: patients[0]._id,
        patientName: `${patients[0].firstName} ${patients[0].lastName}`,
        services: [
          { name: 'Complete Blood Count (CBC)', price: 800, quantity: 1 },
          { name: 'Urinalysis', price: 300, quantity: 1 }
        ],
        subtotal: 1100,
        totalAmount: 1100,
        dateIssued: new Date('2024-09-10'),
        dueDate: new Date('2024-09-25'),
        status: 'pending',
        createdBy: admin._id
      },
      {
        patientId: patients[1]._id,
        patientName: `${patients[1].firstName} ${patients[1].lastName}`,
        services: [
          { name: 'X-Ray Chest PA', price: 1200, quantity: 1 },
          { name: 'Blood Sugar (FBS)', price: 200, quantity: 1 }
        ],
        subtotal: 1400,
        totalAmount: 1400,
        dateIssued: new Date('2024-09-08'),
        dueDate: new Date('2024-09-23'),
        status: 'paid',
        paymentMethod: 'cash',
        createdBy: admin._id
      },
      {
        patientId: patients[2]._id,
        patientName: `${patients[2].firstName} ${patients[2].lastName}`,
        services: [
          { name: 'Lipid Profile', price: 1500, quantity: 1 }
        ],
        subtotal: 1500,
        totalAmount: 1500,
        dateIssued: new Date('2024-08-28'),
        dueDate: new Date('2024-09-12'),
        status: 'overdue',
        createdBy: admin._id
      }
    ];

    // Create bills one by one to trigger the pre-save hook for billId generation
    const createdBills = [];
    for (let i = 0; i < bills.length; i++) {
      const bill = new Bill(bills[i]);
      await bill.save();
      createdBills.push(bill);
      console.log(`Created bill ${i + 1}: ${bill.billId} - ${bill.status} - ${bill.patientName}`);
    }
    console.log(`✅ Created ${createdBills.length} bills`);
    return createdBills;
  } catch (error) {
    console.error('❌ Error creating bills:', error);
  }
};

// Create sample transactions
const createSampleTransactions = async () => {
  try {
    await Transaction.deleteMany({});
    
    const admin = await User.findOne({ role: 'admin' });
    const bills = await Bill.find({});
    
    console.log('All bills found for transactions:', bills.map(b => ({ 
      id: b._id, 
      billId: b.billId,
      status: b.status, 
      patientName: b.patientName,
      amount: b.totalAmount 
    })));
    
    if (!admin || bills.length === 0) {
      console.log('❌ Need admin and bills for transactions.');
      return;
    }

    const paidBill = bills.find(b => b.status === 'paid');
    if (!paidBill) {
      console.log('❌ No paid bill found for transaction.');
      return;
    }

    const transactions = [
      {
        billId: paidBill._id,
        patientId: paidBill.patientId,
        patientName: paidBill.patientName,
        description: `Payment for ${paidBill.services?.map(s => s.name).join(', ')}`,
        amount: paidBill.totalAmount,
        paymentMethod: 'cash',
        status: 'completed',
        processedBy: admin._id,
        transactionDate: new Date('2024-09-14T09:30:00')
      }
    ];

    // Create transactions one by one
    const createdTransactions = [];
    for (const txnData of transactions) {
      const transaction = new Transaction(txnData);
      await transaction.save();
      createdTransactions.push(transaction);
    }

    console.log(`✅ Created ${createdTransactions.length} transactions`);
    return createdTransactions;
  } catch (error) {
    console.error('❌ Error creating transactions:', error);
  }
};

// Create sample payments
const createSamplePayments = async () => {
  try {
    await Payment.deleteMany({});
    
    const admin = await User.findOne({ role: 'admin' });
    const transactions = await Transaction.find({});
    const bills = await Bill.find({});
    
    if (!admin || transactions.length === 0 || bills.length === 0) {
      console.log('❌ Need admin, transactions and bills for payments.');
      return;
    }

    const paidBill = bills.find(b => b.status === 'paid');
    const transaction = transactions[0];

    const payments = [
      {
        billId: paidBill._id,
        transactionId: transaction._id,
        patientId: paidBill.patientId,
        patientName: paidBill.patientName,
        amountPaid: paidBill.totalAmount,
        paymentMethod: 'cash',
        status: 'verified',
        verifiedBy: admin._id,
        verificationDate: new Date('2024-09-14T09:30:00'),
        paymentDate: new Date('2024-09-14T09:30:00')
      }
    ];

    const createdPayments = await Payment.insertMany(payments);
    console.log(`✅ Created ${createdPayments.length} payments`);
    return createdPayments;
  } catch (error) {
    console.error('❌ Error creating payments:', error);
  }
};

// Main seeding function
const seedFinanceData = async () => {
  await connectDB();
  
  console.log('🌱 Starting finance data seeding...\n');
  
  await createBillingRates();
  await createSampleBills();
  await createSampleTransactions();
  await createSamplePayments();
  
  console.log('\n✅ Finance data seeding completed!');
  process.exit(0);
};

// Run seeding
if (require.main === module) {
  seedFinanceData();
}

module.exports = { seedFinanceData };