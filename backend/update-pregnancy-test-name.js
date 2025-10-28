const mongoose = require('mongoose');
const Service = require('./models/Service');

const mongoURI = 'mongodb://localhost:27017/mdlab_direct';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('✅ Connected to MongoDB');

  try {
    // Update the pregnancy test name
    const result = await Service.updateOne(
      { serviceName: 'Pregnancy Test (Urine)' },
      { $set: { serviceName: 'Pregnancy Test' } }
    );

    if (result.modifiedCount > 0) {
      console.log('✅ Successfully updated Pregnancy Test name');
      console.log(`Modified ${result.modifiedCount} document(s)`);
    } else {
      console.log('ℹ️ No documents were modified. The service may not exist or already has the correct name.');
    }

    // Verify the update
    const updatedService = await Service.findOne({ serviceName: 'Pregnancy Test' });
    if (updatedService) {
      console.log('✅ Verified: Service name is now "Pregnancy Test"');
      console.log('Service details:', {
        name: updatedService.serviceName,
        category: updatedService.category,
        price: updatedService.price
      });
    }

  } catch (error) {
    console.error('❌ Error updating pregnancy test name:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});
