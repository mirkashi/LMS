const nodemailer = require('nodemailer');
const { logEmail } = require('./emailLogger');

let transporter;

async function initTransporter() {
  const hasCreds = !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD);
  const isDev = (process.env.NODE_ENV || 'development') === 'development';

  if (!hasCreds && isDev) {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('📧 Using Ethereal test SMTP: login at https://ethereal.email');
    return;
  }

  if (!hasCreds) {
    throw new Error('EMAIL_USER/EMAIL_PASSWORD are not set');
  }

  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT || 587),
    secure: String(process.env.EMAIL_SECURE || 'false') === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
}

// initialize immediately
initTransporter().catch(err => {
  console.error('❌ SMTP transporter init failed:', err.message);
});

const sendVerificationEmail = async (email, token) => {
  const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
  const redirectUrl = process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/login` : '';
  const redirectQuery = redirectUrl ? `&redirect=${encodeURIComponent(redirectUrl)}` : '';
  const verificationLink = `${backendUrl}/api/auth/verify-email?token=${token}${redirectQuery}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@9tangle.com',
    to: email,
    subject: 'Email Verification - 9tangle',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">Welcome to 9tangle</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9; border: 1px solid #ddd; border-radius: 0 0 8px 8px;">
          <p>Hello,</p>
          <p>Thank you for registering with 9tangle! Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
          </div>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create this account, you can safely ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">Best regards,<br>9tangle Team</p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    const preview = nodemailer.getTestMessageUrl ? nodemailer.getTestMessageUrl(info) : null;
    console.log('✅ Verification email sent', preview ? `Preview: ${preview}` : '');
    
    // Log email send
    logEmail({
      to: email,
      subject: mailOptions.subject,
      type: 'email-verification',
      success: true,
    });
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    
    // Log failed email
    logEmail({
      to: email,
      subject: mailOptions.subject,
      type: 'email-verification',
      success: false,
      error: error.message,
    });
    
    throw error;
  }
};

const sendVerificationCodeEmail = async (email, code, userName = '') => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@9tangle.com',
    to: email,
    subject: 'Email Verification Code - 9tangle',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Welcome to 9tangle</h1>
                    <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Verify Your Email Address</p>
                  </td>
                </tr>
                
                <!-- Body -->
                <tr>
                  <td style="padding: 40px 30px;">
                    ${userName ? `<p style="font-size: 16px; color: #333; margin: 0 0 20px 0;">Hello ${userName},</p>` : '<p style="font-size: 16px; color: #333; margin: 0 0 20px 0;">Hello,</p>'}
                    
                    <p style="font-size: 16px; color: #666; line-height: 1.6; margin: 0 0 20px 0;">
                      Thank you for registering with 9tangle! To complete your registration, please use the verification code below:
                    </p>
                    
                    <!-- Verification Code Box -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                      <tr>
                        <td align="center">
                          <div style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); padding: 30px; border-radius: 10px; display: inline-block; border: 2px dashed #667eea;">
                            <p style="margin: 0 0 10px 0; font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
                            <p style="margin: 0; font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                              ${code}
                            </p>
                          </div>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Important Notice -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
                      <tr>
                        <td>
                          <p style="margin: 0; font-size: 14px; color: #856404; line-height: 1.6;">
                            <strong>⏱️ Important:</strong> This code will expire in <strong>10 minutes</strong> for security reasons.
                          </p>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="font-size: 14px; color: #666; line-height: 1.6; margin: 20px 0 0 0;">
                      If you didn't create an account with 9tangle, you can safely ignore this email.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                    <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">
                      Need help? Contact us at <a href="mailto:support@9tangle.com" style="color: #667eea; text-decoration: none;">support@9tangle.com</a>
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #999;">
                      © ${new Date().getFullYear()} 9tangle. All rights reserved.
                    </p>
                    <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">
                      This is an automated message. Please do not reply to this email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    const preview = nodemailer.getTestMessageUrl ? nodemailer.getTestMessageUrl(info) : null;
    console.log('✅ Verification code email sent', preview ? `Preview: ${preview}` : '');
    
    // Log email send
    logEmail({
      to: email,
      subject: mailOptions.subject,
      type: 'verification-code',
      success: true,
    });
    
    return info;
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    
    // Log failed email
    logEmail({
      to: email,
      subject: mailOptions.subject,
      type: 'verification-code',
      success: false,
      error: error.message,
    });
    
    throw error;
  }
};

const sendEmailChangeVerification = async (email, code) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@9tangle.com',
    to: email,
    subject: 'Verify Email Change - 9tangle',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">Verify New Email</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9; border: 1px solid #ddd; border-radius: 0 0 8px 8px;">
          <p>Hello,</p>
          <p>We received a request to change your email address to this one. Please use the following code to verify this change:</p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="background: #f0f0f0; padding: 15px; font-size: 24px; letter-spacing: 5px; font-weight: bold; border-radius: 5px; display: inline-block; border: 1px solid #ccc;">
              ${code}
            </div>
          </div>
          <p>This code will expire in 15 minutes.</p>
          <p>If you didn't request this change, you can safely ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">Best regards,<br>9tangle Team</p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    const preview = nodemailer.getTestMessageUrl ? nodemailer.getTestMessageUrl(info) : null;
    console.log('✅ Email change verification sent', preview ? `Preview: ${preview}` : '');
    
    logEmail({
      to: email,
      subject: mailOptions.subject,
      type: 'email-change-verification',
      success: true,
    });
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    
    logEmail({
      to: email,
      subject: mailOptions.subject,
      type: 'email-change-verification',
      success: false,
      error: error.message,
    });
    
    throw error;
  }
};

const sendPasswordChangeNotification = async (email) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@9tangle.com',
    to: email,
    subject: 'Security Alert: Password Changed - 9tangle',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ff6b6b 0%, #c0392b 100%); padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">Password Changed</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9; border: 1px solid #ddd; border-radius: 0 0 8px 8px;">
          <p>Hello,</p>
          <p>Your password was successfully changed on <strong>${new Date().toLocaleString()}</strong>.</p>
          <p>If you did not make this change, please contact support immediately.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">Best regards,<br>9tangle Team</p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    const preview = nodemailer.getTestMessageUrl ? nodemailer.getTestMessageUrl(info) : null;
    console.log('✅ Password change notification sent', preview ? `Preview: ${preview}` : '');
    
    logEmail({
      to: email,
      subject: mailOptions.subject,
      type: 'password-change-notification',
      success: true,
    });
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    
    logEmail({
      to: email,
      subject: mailOptions.subject,
      type: 'password-change-notification',
      success: false,
      error: error.message,
    });
    
    throw error;
  }
};

const sendPasswordResetEmail = async (email, resetToken) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@9tangle.com',
    to: email,
    subject: 'Password Reset Request - 9tangle',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">Password Reset</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9; border: 1px solid #ddd; border-radius: 0 0 8px 8px;">
          <p>Hello,</p>
          <p>We received a request to reset your password. Click the button below to reset it:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
          </div>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">Best regards,<br>9tangle Team</p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    const preview = nodemailer.getTestMessageUrl ? nodemailer.getTestMessageUrl(info) : null;
    console.log('✅ Password reset email sent', preview ? `Preview: ${preview}` : '');
    
    logEmail({
      to: email,
      subject: mailOptions.subject,
      type: 'password-reset',
      success: true,
    });
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    
    logEmail({
      to: email,
      subject: mailOptions.subject,
      type: 'password-reset',
      success: false,
      error: error.message,
    });
    
    throw error;
  }
};

module.exports = {
  sendVerificationEmail,
  sendVerificationCodeEmail,
  sendPasswordResetEmail,
  sendEmailChangeVerification,
  sendPasswordChangeNotification,
  transporter
};
