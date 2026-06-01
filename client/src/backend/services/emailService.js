import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import dbConnect from '../config/dbConnect';
import Settings from '../models/Settings';

/**
 * Sends a beautifully styled premium HTML OTP verification email to the user.
 * If SMTP settings are missing, saves the output to client/public/mock-emails/last-otp-email.html.
 * 
 * @param {string} email Target email address
 * @param {string} otp 6-digit verification code
 * @param {'register' | 'login' | 'reset'} type The action requesting validation
 */
export async function sendOtpEmail(email, otp, type) {
  const typeLabels = {
    register: 'Create Account',
    login: 'Secure Sign In',
    reset: 'Reset Password'
  };

  const typeLabel = typeLabels[type] || 'Verification';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MIP Jewellers - Verify Your Identity</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f7f5f0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f7f5f0;
      padding: 40px 0;
    }
    .container {
      max-width: 580px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #e2d7c5;
      border-top: 6px solid #2d231b;
      box-shadow: 0 10px 25px rgba(45, 35, 27, 0.04);
    }
    .header {
      padding: 40px 30px 30px 30px;
      text-align: center;
      background-color: #ffffff;
    }
    .logo-container {
      margin-bottom: 20px;
    }
    .logo-text {
      font-size: 26px;
      letter-spacing: 7px;
      color: #2d231b;
      text-transform: uppercase;
      font-family: 'Times New Roman', Georgia, serif;
      margin: 0;
      font-weight: 400;
    }
    .divider {
      width: 40px;
      height: 1.5px;
      background-color: #c5a880;
      margin: 15px auto 0 auto;
    }
    .content {
      padding: 10px 40px 40px 40px;
      text-align: center;
    }
    .title {
      font-family: 'Times New Roman', Georgia, serif;
      font-size: 22px;
      color: #2d231b;
      margin-bottom: 16px;
      font-weight: normal;
      letter-spacing: 0.5px;
    }
    .message {
      font-size: 14px;
      line-height: 1.7;
      color: #5a5045;
      margin-bottom: 30px;
      max-width: 440px;
      margin-left: auto;
      margin-right: auto;
    }
    .otp-box {
      background-color: #fdfcfb;
      border: 1px solid #eae2d5;
      border-radius: 4px;
      padding: 24px 30px;
      display: inline-block;
      margin-bottom: 30px;
    }
    .otp-code {
      font-size: 34px;
      font-weight: 700;
      letter-spacing: 10px;
      color: #c5a880;
      margin: 0;
      font-family: 'Courier New', Courier, monospace;
    }
    .expiry-notice {
      font-size: 12px;
      color: #9c9183;
      margin-bottom: 20px;
    }
    .security-banner {
      background-color: #fdfcfb;
      border-left: 3px solid #c5a880;
      padding: 12px 20px;
      margin: 30px 0 10px 0;
      text-align: left;
    }
    .security-text {
      font-size: 12px;
      line-height: 1.5;
      color: #7c7062;
      margin: 0;
    }
    .footer {
      background-color: #2d231b;
      padding: 30px;
      text-align: center;
      color: #a4998d;
    }
    .footer-title {
      font-size: 12px;
      letter-spacing: 3px;
      text-transform: uppercase;
      margin-bottom: 12px;
      color: #c5a880;
    }
    .footer-text {
      font-size: 11px;
      line-height: 1.6;
      margin: 0 0 10px 0;
      color: #8c8074;
    }
    .footer-copy {
      font-size: 10px;
      margin: 20px 0 0 0;
      color: #6e6358;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="logo-container">
          <h1 class="logo-text">M I P</h1>
          <div class="divider"></div>
        </div>
      </div>
      <div class="content">
        <h2 class="title">${typeLabel} Verification</h2>
        <p class="message">
          To verify your email address and authorize your request on the MIP customer portal, please enter the one-time passcode displayed below.
        </p>
        <div class="otp-box">
          <div class="otp-code">${otp}</div>
        </div>
        <p class="expiry-notice">
          This secure passcode will expire in <strong>10 minutes</strong>.
        </p>
        
        <div class="security-banner">
          <p class="security-text">
            <strong>Security Notice:</strong> MIP Jewellers representatives will never contact you directly to request this verification passcode. Please keep this code strictly confidential.
          </p>
        </div>
      </div>
      <div class="footer">
        <div class="footer-title">MIP Jewellers</div>
        <p class="footer-text">
          Curators of Bespoke & Fine Luxury Jewellery Collections.
        </p>
        <p class="footer-copy">
          &copy; 2026 MIP Jewellers. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  // Attempt sending via SMTP if settings are provided (checking DB settings first, falling back to process.env)
  let smtpHost = process.env.SMTP_HOST;
  let smtpPort = parseInt(process.env.SMTP_PORT || '587');
  let smtpUser = process.env.SMTP_USER;
  let smtpPass = process.env.SMTP_PASS;
  let smtpSecure = process.env.SMTP_SECURE === 'true';
  let smtpFrom = process.env.SMTP_FROM || process.env.SMTP_USER;

  try {
    await dbConnect();
    const settings = await Settings.findOne();
    if (settings) {
      if (settings.smtpHost) smtpHost = settings.smtpHost;
      if (settings.smtpPort) smtpPort = settings.smtpPort;
      if (settings.smtpUser) smtpUser = settings.smtpUser;
      if (settings.smtpPass) smtpPass = settings.smtpPass;
      if (settings.smtpPort === 465) smtpSecure = true;
      if (settings.smtpUser) smtpFrom = settings.supportEmail || settings.smtpUser;
    }
  } catch (dbErr) {
    console.error('[SMTP DB ERROR] Failed to fetch SMTP config from DB, falling back to environment variables:', dbErr.message);
  }

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });

      await transporter.sendMail({
        from: `"MIP Jewellers" <${smtpFrom || smtpUser}>`,
        to: email,
        subject: `MIP Verification Code: ${otp}`,
        html
      });
      console.log(`[SMTP] Successfully sent OTP email to: ${email}`);
    } catch (err) {
      console.error(`[SMTP] Failed to send OTP email: ${err.message}`);
      // Fallback: write mock file so dev can retrieve OTP
      try {
        const mockEmailDir = path.join(process.cwd(), 'public', 'mock-emails');
        if (!fs.existsSync(mockEmailDir)) fs.mkdirSync(mockEmailDir, { recursive: true });
        fs.writeFileSync(path.join(mockEmailDir, 'last-otp-email.html'), html);
      } catch {}
    }
  } else {
    // No SMTP configured: write mock file for local development testing
    try {
      const mockEmailDir = path.join(process.cwd(), 'public', 'mock-emails');
      if (!fs.existsSync(mockEmailDir)) {
        fs.mkdirSync(mockEmailDir, { recursive: true });
      }
      fs.writeFileSync(path.join(mockEmailDir, 'last-otp-email.html'), html);
      console.log(`[MOCK EMAIL] OTP email output saved to public/mock-emails/last-otp-email.html`);
    } catch (err) {
      console.warn('[MOCK EMAIL] Failed to write mock email html file:', err.message);
    }
    console.log(`[MOCK EMAIL] SMTP credentials not set. Code: ${otp}. View at: http://localhost:3001/mock-emails/last-otp-email.html`);
  }
}
