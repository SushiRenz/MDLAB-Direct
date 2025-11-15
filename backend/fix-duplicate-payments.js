const mongoose = require('mongoose');
const Payment = require('./models/Payment');
require('dotenv').config();

// Connect to database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mdlab-direct')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

async function fixDuplicatePayments() {
  try {
    console.log('🔍 Checking for duplicate paymentIds...\n');
    
    // Find all payments and group by paymentId
    const duplicates = await Payment.aggregate([
      {
        $group: {
          _id: '$paymentId',
          count: { $sum: 1 },
          ids: { $push: '$_id' },
          docs: { $push: '$$ROOT' }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);

    if (duplicates.length === 0) {
      console.log('✅ No duplicate payment IDs found!');
    } else {
      console.log(`⚠️ Found ${duplicates.length} duplicate payment ID(s):\n`);
      
      for (const dup of duplicates) {
        console.log(`Payment ID: ${dup._id}`);
        console.log(`  Count: ${dup.count}`);
        console.log(`  Document IDs:`);
        
        // Keep the first one, regenerate IDs for the rest
        for (let i = 1; i < dup.ids.length; i++) {
          const payment = await Payment.findById(dup.ids[i]);
          if (payment) {
            // Temporarily remove the paymentId to trigger regeneration
            const oldPaymentId = payment.paymentId;
            payment.paymentId = undefined;
            
            // Find next available number
            const year = new Date().getFullYear();
            const allPayments = await Payment.find({
              paymentId: { $regex: `^PAY-${year}-` }
            }).sort({ paymentId: -1 });
            
            let nextNumber = 1;
            if (allPayments.length > 0) {
              const lastNumber = parseInt(allPayments[0].paymentId.split('-')[2]);
              if (!isNaN(lastNumber)) {
                nextNumber = lastNumber + 1;
              }
            }
            
            payment.paymentId = `PAY-${year}-${String(nextNumber).padStart(4, '0')}`;
            await payment.save();
            
            console.log(`  ✓ Updated ${dup.ids[i]}: ${oldPaymentId} → ${payment.paymentId}`);
          }
        }
        console.log('');
      }
      
      console.log('✅ All duplicate payment IDs fixed!');
    }
    
    // Check for null paymentIds
    console.log('\n🔍 Checking for payments without paymentId...\n');
    const nullPayments = await Payment.find({ 
      $or: [
        { paymentId: null },
        { paymentId: { $exists: false } }
      ]
    });
    
    if (nullPayments.length > 0) {
      console.log(`⚠️ Found ${nullPayments.length} payment(s) without paymentId:\n`);
      
      for (const payment of nullPayments) {
        const year = new Date(payment.paymentDate || new Date()).getFullYear();
        
        // Find next available number
        const allPayments = await Payment.find({
          paymentId: { $regex: `^PAY-${year}-` }
        }).sort({ paymentId: -1 });
        
        let nextNumber = 1;
        if (allPayments.length > 0 && allPayments[0].paymentId) {
          const lastNumber = parseInt(allPayments[0].paymentId.split('-')[2]);
          if (!isNaN(lastNumber)) {
            nextNumber = lastNumber + 1;
          }
        }
        
        payment.paymentId = `PAY-${year}-${String(nextNumber).padStart(4, '0')}`;
        await payment.save();
        
        console.log(`  ✓ Generated paymentId for ${payment._id}: ${payment.paymentId}`);
      }
      
      console.log('\n✅ All payments now have paymentId!');
    } else {
      console.log('✅ All payments have paymentId!');
    }
    
    console.log('\n📊 Payment Summary:');
    const totalPayments = await Payment.countDocuments();
    const paidPayments = await Payment.countDocuments({ status: 'paid' });
    const refundedPayments = await Payment.countDocuments({ status: 'refunded' });
    
    console.log(`  Total Payments: ${totalPayments}`);
    console.log(`  Paid: ${paidPayments}`);
    console.log(`  Refunded: ${refundedPayments}`);
    
    console.log('\n✅ Payment database cleanup complete!');
    
  } catch (error) {
    console.error('❌ Error fixing payments:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

fixDuplicatePayments();
