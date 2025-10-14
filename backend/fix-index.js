const mongoose = require('mongoose');

async function dropIndex() {
  try {
    await mongoose.connect('mongodb://localhost:27017/MDLAB_DIRECT');
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const collection = db.collection('testresults');
    
    try {
      await collection.dropIndex('resultId_1');
      console.log('Successfully dropped resultId_1 index');
    } catch (error) {
      if (error.message.includes('index not found')) {
        console.log('Index resultId_1 does not exist - no action needed');
      } else {
        console.error('Error dropping index:', error.message);
      }
    }
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Connection error:', error.message);
  }
}

dropIndex();