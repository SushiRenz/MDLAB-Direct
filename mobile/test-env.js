// Quick test to check environment variables
require('dotenv').config();

console.log('Testing environment variables...');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '[LOADED]' : '[MISSING]');
console.log('JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '[LOADED]' : '[MISSING]');

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === '') {
  console.error('❌ JWT_SECRET is missing or empty!');
  console.log('Current JWT_SECRET value:', JSON.stringify(process.env.JWT_SECRET));
} else {
  console.log('✅ JWT_SECRET is properly loaded');
}