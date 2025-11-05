const jwt = require('jsonwebtoken');

// Simulate a receptionist token
const receptionistUser = {
  id: '507f1f77bcf86cd799439011',
  role: 'receptionist',
  email: 'receptionist@mdlab.com'
};

const token = jwt.sign(receptionistUser, process.env.JWT_SECRET || 'your-secret-key-here', {
  expiresIn: '1h'
});

console.log('\n🔑 Receptionist Test Token:');
console.log(token);
console.log('\n📋 Use this token in Authorization header as: Bearer <token>');
console.log('\n✅ This token should allow creating payments via POST /api/finance/payments');
