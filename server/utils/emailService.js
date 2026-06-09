const nodemailer = require('nodemailer');

const createTransporter = () => {
  const cleanedPass = process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, '') : '';
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: cleanedPass
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

// Send welcome email
const sendWelcomeEmail = async ({ email, name }) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Welcome to CodeForge! 🚀 Your Developer Adventure Begins Now',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to CodeForge</title>
        <style>
          /* CSS Keyframes for pulse/glow animation */
          @keyframes pulse-glow {
            0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
            70% { box-shadow: 0 0 0 10px rgba(99, 102, 241, 0); }
            100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
          }
          @keyframes floating {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-6px); }
            100% { transform: translateY(0px); }
          }
          .animate-btn {
            animation: pulse-glow 2s infinite;
          }
          .floating-icon {
            animation: floating 3s ease-in-out infinite;
          }
          /* Responsive style overrides */
          @media only screen and (max-width: 600px) {
            .container {
              width: 100% !important;
              padding: 15px !important;
            }
            .grid-col {
              display: block !important;
              width: 100% !important;
              margin-bottom: 15px !important;
              padding: 0 !important;
            }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0b0f19; table-layout: fixed;">
          <tr>
            <td align="center" style="padding: 40px 10px;">
              
              <!-- Container Card -->
              <table border="0" cellpadding="0" cellspacing="0" width="600" class="container" style="background-color: #111827; border: 1px solid #1f2937; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.04);">
                
                <!-- Animated Header Banner -->
                <tr>
                  <td align="center" style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 40px 20px; position: relative;">
                    <div style="font-size: 32px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; margin-bottom: 8px;">
                      CODEFORGE
                    </div>
                    <div style="font-size: 14px; font-weight: 500; color: rgba(255, 255, 255, 0.85); letter-spacing: 2px; text-transform: uppercase;">
                      Your Ultimate Development Sandbox
                    </div>
                  </td>
                </tr>

                <!-- Content Body -->
                <tr>
                  <td style="padding: 40px 30px 20px 30px;">
                    <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin-top: 0; margin-bottom: 16px; text-align: left;">
                      Welcome aboard, ${name || 'Developer'}!
                    </h1>
                    <p style="color: #9ca3af; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
                      We're absolutely thrilled to have you here. CodeForge is designed to help you write cleaner code, practice algorithmic questions, construct resume portfolios, and pass technical interviews with absolute confidence.
                    </p>

                    <!-- Interactive feature Highlights Grid -->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 30px;">
                      <tr>
                        <!-- DSA Card -->
                        <td width="48%" class="grid-col" style="background-color: #1f2937; border: 1px solid #374151; border-radius: 16px; padding: 20px; vertical-align: top;">
                          <div style="margin-bottom: 12px; height: 32px; display: block;">
                            <img src="https://img.icons8.com/6366F1/material-rounded/64/code.png" width="32" height="32" alt="DSA" style="display: block; border: 0;" />
                          </div>
                          <h3 style="color: #ffffff; font-size: 16px; font-weight: 600; margin-top: 0; margin-bottom: 8px;">DSA Compilers</h3>
                          <p style="color: #9ca3af; font-size: 13px; line-height: 1.5; margin: 0;">
                            Solve real-world algorithmic problems with multi-language online execution.
                          </p>
                        </td>
                        
                        <!-- Spacer -->
                        <td width="4%">&nbsp;</td>

                        <!-- Mock Interviews Card -->
                        <td width="48%" class="grid-col" style="background-color: #1f2937; border: 1px solid #374151; border-radius: 16px; padding: 20px; vertical-align: top;">
                          <div style="margin-bottom: 12px; height: 32px; display: block;">
                            <img src="https://img.icons8.com/6366F1/material-rounded/64/brain.png" width="32" height="32" alt="AI" style="display: block; border: 0;" />
                          </div>
                          <h3 style="color: #ffffff; font-size: 16px; font-weight: 600; margin-top: 0; margin-bottom: 8px;">AI Mock Interviews</h3>
                          <p style="color: #9ca3af; font-size: 13px; line-height: 1.5; margin: 0;">
                            Generate voice-interactive real-time system design and coding mock rounds.
                          </p>
                        </td>
                      </tr>
                      
                      <!-- Spacer row -->
                      <tr><td colspan="3" style="height: 16px; font-size: 0; line-height: 0;">&nbsp;</td></tr>

                      <tr>
                        <!-- Resume Card -->
                        <td width="48%" class="grid-col" style="background-color: #1f2937; border: 1px solid #374151; border-radius: 16px; padding: 20px; vertical-align: top;">
                          <div style="margin-bottom: 12px; height: 32px; display: block;">
                            <img src="https://img.icons8.com/6366F1/material-rounded/64/resume.png" width="32" height="32" alt="Resume" style="display: block; border: 0;" />
                          </div>
                          <h3 style="color: #ffffff; font-size: 16px; font-weight: 600; margin-top: 0; margin-bottom: 8px;">Resume Builder</h3>
                          <p style="color: #9ca3af; font-size: 13px; line-height: 1.5; margin: 0;">
                            Draft LaTeX resumes, compile instantly, and scan with ATS keyword analysis.
                          </p>
                        </td>
                        
                        <!-- Spacer -->
                        <td width="4%">&nbsp;</td>

                        <!-- Learning Roadmap Card -->
                        <td width="48%" class="grid-col" style="background-color: #1f2937; border: 1px solid #374151; border-radius: 16px; padding: 20px; vertical-align: top;">
                          <div style="margin-bottom: 12px; height: 32px; display: block;">
                            <img src="https://img.icons8.com/6366F1/material-rounded/64/compass.png" width="32" height="32" alt="Roadmap" style="display: block; border: 0;" />
                          </div>
                          <h3 style="color: #ffffff; font-size: 16px; font-weight: 600; margin-top: 0; margin-bottom: 8px;">Fullstack Maps</h3>
                          <p style="color: #9ca3af; font-size: 13px; line-height: 1.5; margin: 0;">
                            Trace step-by-step masteries for MERN stack, DevOps pipelines, and clouds.
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Animated CTA Section -->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="center" style="padding: 10px 0 30px 0;">
                          <a href="${process.env.CLIENT_URL || 'https://tushar-dev-1.onrender.com'}/learning" class="animate-btn" style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: #ffffff; padding: 16px 32px; font-size: 15px; font-weight: bold; text-decoration: none; border-radius: 14px; display: inline-block; box-shadow: 0 10px 20px -5px rgba(99, 102, 241, 0.4); transition: all 0.2s ease;">
                            Launch Your Dashboard
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="color: #9ca3af; font-size: 14px; line-height: 1.6; margin-bottom: 0;">
                      If you have any feedback or questions, simply reply to this email. We are here to support your engineering aspirations.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 30px; background-color: #0f172a; border-top: 1px solid #1f2937; text-align: center;">
                    <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px 0;">
                      This email was sent to ${email} because you signed up for CodeForge.
                    </p>
                    <p style="color: #4b5563; font-size: 11px; margin: 0;">
                      &copy; 2026 CodeForge. All rights reserved.
                    </p>
                  </td>
                </tr>

              </table>

            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Welcome email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Send subscription confirmation email
const sendSubscriptionEmail = async ({ email, name, tier, expiresAt }) => {
  const transporter = createTransporter();

  const formattedDate = expiresAt 
    ? new Date(expiresAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A';

  const tierDetails = {
    day: {
      name: '24-Hour Pass',
      price: 'Free Trial',
      color: '#3b82f6',
      icon: 'https://img.icons8.com/6366F1/material-rounded/96/clock.png',
      features: ['24 hours full sandbox access', 'Practice coding playgrounds', 'Explore roadmaps & system designs']
    },
    basic: {
      name: 'Basic Learner',
      price: '$9/month',
      color: '#10b981',
      icon: 'https://img.icons8.com/6366F1/material-rounded/96/student-female.png',
      features: ['All foundational roadmaps', 'Unlimited study path access', 'Basic portfolio tracking']
    },
    premium: {
      name: 'Elite Engineer',
      price: '$29/month',
      color: '#f59e0b',
      icon: 'https://img.icons8.com/6366F1/material-rounded/96/vip.png',
      features: ['Voice-enabled AI Mock Interviews', 'LaTeX resume compiler & PDF downloads', 'ATS scanning & AI suggestions', 'Premium priority support']
    }
  };

  const currentTier = tierDetails[tier] || tierDetails.basic;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Your CodeForge ${currentTier.name} Subscription is Active! 🎉`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Subscription Activated</title>
        <style>
          @keyframes pulse-glow {
            0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
            70% { box-shadow: 0 0 0 10px rgba(99, 102, 241, 0); }
            100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
          }
          .animate-btn {
            animation: pulse-glow 2s infinite;
          }
          @media only screen and (max-width: 600px) {
            .container {
              width: 100% !important;
              padding: 15px !important;
            }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0b0f19; table-layout: fixed;">
          <tr>
            <td align="center" style="padding: 40px 10px;">
              <table border="0" cellpadding="0" cellspacing="0" width="600" class="container" style="background-color: #111827; border: 1px solid #1f2937; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);">
                
                <!-- Header Banner -->
                <tr>
                  <td align="center" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 35px 20px;">
                    <div style="font-size: 28px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; margin-bottom: 5px;">
                      SUBSCRIPTION ACTIVATED
                    </div>
                    <div style="font-size: 13px; font-weight: 600; color: rgba(255, 255, 255, 0.9); letter-spacing: 1.5px; text-transform: uppercase;">
                      Unlock Your Full Potential
                    </div>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px 25px 30px;">
                    <h2 style="color: #ffffff; font-size: 22px; font-weight: 700; margin-top: 0; margin-bottom: 12px;">
                      Hi ${name || 'Developer'},
                    </h2>
                    <p style="color: #9ca3af; font-size: 15px; line-height: 1.6; margin-bottom: 25px;">
                      Thank you for upgrading! Your subscription to the **CodeForge ${currentTier.name}** plan is now active. Here are the details of your purchase:
                    </p>

                    <!-- Receipt Info Card -->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #1f2937; border: 1px solid #374151; border-radius: 16px; margin-bottom: 30px; border-collapse: separate;">
                      <tr>
                        <td style="padding: 20px; text-align: center; border-bottom: 1px solid #374151;" align="center">
                          <img src="${currentTier.icon}" width="48" height="48" alt="Tier Icon" style="margin-bottom: 10px;" />
                          <div style="color: #ffffff; font-size: 18px; font-weight: 700;">${currentTier.name} Plan</div>
                          <div style="color: #10b981; font-size: 14px; font-weight: 600; margin-top: 2px;">Active</div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 15px 20px;">
                          <table border="0" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td style="color: #9ca3af; font-size: 13px; padding-bottom: 8px;">Billing Period</td>
                              <td style="color: #ffffff; font-size: 13px; font-weight: 600; text-align: right; padding-bottom: 8px;">
                                ${tier === 'day' ? '24 Hours' : 'Monthly'}
                              </td>
                            </tr>
                            <tr>
                              <td style="color: #9ca3af; font-size: 13px;">Valid Until</td>
                              <td style="color: #ffffff; font-size: 13px; font-weight: 600; text-align: right;">${formattedDate}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Features Checklist -->
                    <h3 style="color: #ffffff; font-size: 16px; font-weight: 600; margin-top: 0; margin-bottom: 15px;">
                      What's Included in Your Plan:
                    </h3>
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 35px;">
                      ${currentTier.features.map(feat => `
                        <tr>
                          <td style="padding: 6px 0; color: #9ca3af; font-size: 14px; vertical-align: middle;">
                            <span style="color: #10b981; margin-right: 8px; font-weight: bold;">✔</span> ${feat}
                          </td>
                        </tr>
                      `).join('')}
                    </table>

                    <!-- Launch Platform Button -->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="text-align: center;">
                      <tr>
                        <td align="center">
                          <a href="${process.env.CLIENT_URL || 'https://tushar-dev-1.onrender.com'}/learning" class="animate-btn" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; padding: 15px 30px; font-size: 15px; font-weight: bold; text-decoration: none; border-radius: 12px; display: inline-block; box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.3);">
                            Enter Premium Sandbox
                          </a>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 25px 30px; background-color: #0f172a; border-top: 1px solid #1f2937; text-align: center;">
                    <p style="color: #6b7280; font-size: 11px; margin: 0;">
                      &copy; 2026 CodeForge. All rights reserved. Deployed at ${process.env.CLIENT_URL || 'https://tushar-dev-1.onrender.com'}
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Subscription email sending failed:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendContactEmail, sendResetPasswordEmail, sendWelcomeEmail, sendSubscriptionEmail };
