const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    connectionTimeout: 8000, // 8 seconds timeout
    greetingTimeout: 8000,
    socketTimeout: 8000
  });
};

// Send contact form email
const sendContactEmail = async ({ name, email, subject, message }) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_TO,
    replyTo: email,
    subject: `Portfolio Contact: ${subject || 'New Message'} from ${name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #6366f1; padding-bottom: 10px;">
          New Contact Form Submission
        </h2>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          ${subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ''}
        </div>
        <div style="background: #fff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h3 style="color: #6366f1; margin-top: 0;">Message:</h3>
          <p style="line-height: 1.6; color: #374151;">${message.replace(/\n/g, '<br>')}</p>
        </div>
        <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
          This email was sent from your portfolio contact form.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Send reset password email
const sendResetPasswordEmail = async ({ email, name, resetUrl }) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Portfolio: Reset Password Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
        <h2 style="color: #6366f1; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; font-family: 'Outfit', sans-serif;">
          Reset Your Password
        </h2>
        <p>Hello ${name || 'User'},</p>
        <p>You requested to reset your password. Please click the button below to set a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #64748b; font-size: 14px;"><a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link is valid for 1 hour. If you did not make this request, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
        <p style="color: #94a3b8; font-size: 12px;">
          Tushar Seth Portfolio Learning Portal
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Reset email sending failed:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendContactEmail, sendResetPasswordEmail };
