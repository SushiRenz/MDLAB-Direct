const nodemailer = require('nodemailer');

// Email configuration
const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  
  console.log('📧 Email service configuration:', {
    user: emailUser ? emailUser : 'NOT SET',
    hasPassword: !!emailPass,
    passwordLength: emailPass ? emailPass.length : 0,
    service: 'gmail'
  });

  if (!emailUser || !emailPass) {
    console.log('🧪 Development mode: Email credentials not set, using console logging');
    return null; // Will trigger console logging
  }

  console.log('🔧 Creating Gmail transporter...');
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass
    }
  });
};

// Send email
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    // If no transporter (no email config), fall back to console logging
    if (!transporter) {
      console.log('🧪 DEV MODE - Email would be sent:');
      console.log('  To:', options.email);
      console.log('  Subject:', options.subject);
      console.log('  HTML Preview:', options.html.substring(0, 200) + '...');
      return { messageId: 'dev-mode-' + Date.now() };
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'MDLAB Direct <noreply@mdlabdirect.com>',
      to: options.email,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments || []
    };

    console.log('📤 Attempting to send email to:', options.email);
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    console.error('❌ Full error:', error);
    throw error;
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetCode) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - MDLAB Direct</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #9AEEBC 0%, #21AEA8 100%); padding: 0;">
            <!-- Header -->
            <div style="text-align: center; padding: 40px 20px 20px;">
                <div style="margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                    <img src="cid:logo" alt="MDLAB Direct Logo" style="width: 100px; height: 100px; object-fit: contain; display: block; margin: 0 auto; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));" />
                </div>
                <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">MDLAB Direct</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Medical Laboratory Management System</p>
            </div>
            
            <!-- Main Content -->
            <div style="background: white; margin: 0 20px; border-radius: 15px 15px 0 0; padding: 40px 30px; box-shadow: 0 -5px 20px rgba(0,0,0,0.1);">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h2 style="color: #21AEA8; margin: 0 0 15px; font-size: 24px; font-weight: 600;">Password Reset Request</h2>
                    <p style="color: #666; margin: 0; font-size: 16px; line-height: 1.5;">You requested to reset your password. Use the verification code below to complete the process.</p>
                </div>
                
                <!-- Verification Code Box -->
                <div style="background: linear-gradient(135deg, #9AEEBC 0%, #21AEA8 100%); border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
                    <p style="color: white; margin: 0 0 15px; font-size: 14px; font-weight: 500; opacity: 0.9; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
                    <div style="background: white; border-radius: 8px; padding: 20px; margin: 15px auto; display: inline-block; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                        <span style="font-size: 32px; font-weight: bold; color: #21AEA8; letter-spacing: 8px; font-family: 'Courier New', monospace;">${resetCode}</span>
                    </div>
                    <p style="color: white; margin: 15px 0 0; font-size: 12px; opacity: 0.8;">This code expires in 10 minutes</p>
                </div>
                
                <!-- Instructions -->
                <div style="background: #f8fffe; border-left: 4px solid #21AEA8; padding: 20px; border-radius: 0 8px 8px 0; margin: 25px 0;">
                    <h3 style="color: #21AEA8; margin: 0 0 10px; font-size: 16px; font-weight: 600;">How to use this code:</h3>
                    <ol style="color: #666; margin: 0; padding-left: 20px; line-height: 1.6;">
                        <li>Return to the MDLAB Direct login page</li>
                        <li>Enter this 6-digit code in the verification field</li>
                        <li>Set your new password</li>
                        <li>Click "Reset Password" to complete the process</li>
                    </ol>
                </div>
                
                <!-- Security Notice -->
                <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 25px 0;">
                    <p style="color: #856404; margin: 0; font-size: 14px; line-height: 1.5;">
                        <strong>🔒 Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your account remains secure.
                    </p>
                </div>
            </div>
            
            <!-- Footer -->
            <div style="background: white; margin: 0 20px; padding: 30px; text-align: center; border-radius: 0 0 15px 15px;">
                <p style="color: #999; margin: 0 0 10px; font-size: 14px;">This email was sent from MDLAB Direct</p>
                <p style="color: #ccc; margin: 0; font-size: 12px;">© ${new Date().getFullYear()} MDLAB Direct. All rights reserved.</p>
            </div>
            
            <!-- Bottom Gradient -->
            <div style="height: 20px; background: linear-gradient(135deg, #9AEEBC 0%, #21AEA8 100%);"></div>
        </div>
    </body>
    </html>
  `;

  await sendEmail({
    email,
    subject: '🔐 Password Reset Verification Code - MDLAB Direct',
    html,
    attachments: [
      {
        filename: 'logo.png',
        path: __dirname + '/../public/mdlab-logo.png',
        cid: 'logo'
      }
    ]
  });
};

module.exports = {
  sendEmail,
  sendPasswordResetEmail
};