const { sendPasswordResetEmail } = require('./utils/emailService');

async function testEmailWithLogo() {
  try {
    console.log('🧪 Testing password reset email with logo...');
    await sendPasswordResetEmail('renz09358@gmail.com', '123456');
    console.log('✅ Email with logo sent successfully!');
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
  }
}

testEmailWithLogo();