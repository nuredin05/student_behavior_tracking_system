/**
 * Advanced Email Service for Amana Model School
 * Features:
 * 1. Automatic test account (Ethereal) for zero-config development.
 * 2. Real Gmail/SMTP support via .env (EMAIL_USER, EMAIL_PASS).
 * 3. Terminal fallback if nodemailer is missing.
 */

let nodemailer;
try {
  nodemailer = require('nodemailer');
} catch (e) {
  console.log('⚠️ [Nodemailer] Not found. Please run "npm install nodemailer" in the backend folder.');
}

const sendResetEmail = async (userEmail, resetCode) => {
  const subject = 'Amana Model School - Password Reset Code';
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; background-color: #f9f9f9; text-align: center; border-radius: 20px;">
      <div style="max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 30px; box-shadow: 0 10px 40px rgba(0,0,0,0.05); border: 1px solid #eee;">
        <h1 style="color: #6C5DD3; font-size: 28px; margin-bottom: 20px;">Staff Portal Recovery</h1>
        <p style="color: #666; font-size: 16px; line-height: 1.6;">Hello, a password reset was requested for your account. Please use the secure authorization code below:</p>
        <div style="background: #f4f2ff; padding: 30px; border-radius: 20px; margin: 30px 0; border: 2px dashed #6C5DD3;">
          <span style="font-size: 42px; font-weight: 900; color: #6C5DD3; letter-spacing: 12px; font-family: monospace;">${resetCode}</span>
        </div>
        <p style="color: #999; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">This code expires in 60 minutes</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #ccc; font-size: 10px;">Amana Model Secondary School Behavior Tracking System</p>
      </div>
    </div>
  `;

  if (nodemailer) {
    try {
      let transporter;

      // Look for real credentials in .env
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });
        // console.log('🚀 [Email Service] Using Real Server Dispatch');
      } else {
        // Automatic Test Environment (Ethereal)
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass
          }
        });
        // console.log('🧪 [Email Service] Zero-Config Test Mode Active');
      }

      const info = await transporter.sendMail({
        from: '"Amana School Portal" <recovery@amana.edu>',
        to: userEmail,
        subject,
        html
      });

      // console.log('\n' + '✉️ '.repeat(20));
      // console.log('📧 [EMAIL DISPATCHED SUCCESSFULLY]');
      // console.log(`📡 To: ${userEmail}`);
      if (!process.env.EMAIL_USER) {
        console.log(`🔗 PREVIEW LINK: ${nodemailer.getTestMessageUrl(info)}`);
      }
      console.log('✉️ '.repeat(20) + '\n');

      return { success: true, previewUrl: nodemailer.getTestMessageUrl(info) };
    } catch (err) {
      console.error('❌ [Email Error]', err.message);
      // Fallback log
      return { success: false, error: err.message };
    }
  } else {
    // Terminal Log Fallback
    // console.log('\n' + '⚠️ '.repeat(20));
    // console.log('📢 [MOCK EMAIL LOG] (Nodemailer missing)');
    // console.log(`📧 To: ${userEmail}`);
    // console.log(`🔑 Code: ${resetCode}`);
    // console.log('⚠️ '.repeat(20) + '\n');
    return { success: true };
  }
};

module.exports = { sendResetEmail };
