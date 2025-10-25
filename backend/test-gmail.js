const nodemailer = require('nodemailer');
require('dotenv').config();

async function testGmail() {
  console.log('🧪 Testing Gmail configuration...');
  
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  
  console.log('📧 Email config:', {
    user: emailUser,
    hasPassword: !!emailPass,
    passwordLength: emailPass ? emailPass.length : 0
  });
  
  if (!emailUser || !emailPass) {
    console.log('❌ Email credentials not set');
    return;
  }
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass
    }
  });
  
  try {
    console.log('🔍 Verifying Gmail connection...');
    await transporter.verify();
    console.log('✅ Gmail connection successful!');
    
    console.log('📤 Sending test email...');
    const info = await transporter.sendMail({
      from: emailUser,
      to: emailUser,
      subject: 'Test Email - MDLAB Direct',
      text: 'This is a test email to verify Gmail configuration.'
    });
    
    console.log('✅ Test email sent successfully:', info.messageId);
    
  } catch (error) {
    console.error('❌ Gmail error:', error.message);
    console.error('❌ Full error:', error);
  }
}

testGmail();