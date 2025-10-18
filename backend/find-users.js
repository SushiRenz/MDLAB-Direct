const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/mdlab', { useNewUrlParser: true, useUnifiedTopology: true });

const User = require('./models/User');

async function findUsers() {
  try {
    const users = await User.find({}, 'firstName lastName email role');
    console.log('Available users:');
    users.forEach(user => {
      console.log(`- ${user._id}: ${user.firstName} ${user.lastName} (${user.email}) - ${user.role}`);
    });
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

findUsers();