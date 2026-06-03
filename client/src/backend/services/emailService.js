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

/**
 * Sends a beautifully styled luxury HTML Order Confirmation email to the customer.
 * If SMTP settings are missing, saves the output to public/mock-emails/order-confirmation-[orderId].html.
 * 
 * @param {string} email Target email address
 * @param {object} order The Mongoose Order document
 * @param {object} user The Mongoose User document
 */
export async function sendOrderConfirmationEmail(email, order, user) {
  // Format items list into HTML rows
  const itemRows = order.items.map(item => `
    <tr>
      <td style="padding: 12px 10px; border-bottom: 1px solid #eae2d5; text-align: left; font-size: 13px; color: #2d231b; font-weight: 600;">
        ${item.name}
        <div style="font-size: 11px; color: #8c8074; font-weight: normal; margin-top: 4px; font-family: sans-serif;">
          ${item.metalPurityLocked} · ${item.metalWeightLocked}g
        </div>
      </td>
      <td style="padding: 12px 10px; border-bottom: 1px solid #eae2d5; text-align: center; font-size: 13px; color: #5a5045;">
        ${item.quantity}
      </td>
      <td style="padding: 12px 10px; border-bottom: 1px solid #eae2d5; text-align: right; font-size: 13px; color: #2d231b; font-weight: 600;">
        ₹${item.finalPriceLocked.toLocaleString('en-IN')}
      </td>
    </tr>
  `).join('');

  const shipping = order.shippingAddress;
  const addressHtml = `
    ${shipping.street}${shipping.area ? `, ${shipping.area}` : ''}<br>
    ${shipping.city}, ${shipping.state} - ${shipping.pincode}<br>
    ${shipping.country}
  `;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MIP Jewellers - Order Confirmation</title>
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
      padding: 35px 30px;
      text-align: center;
      background-color: #ffffff;
      border-bottom: 1px solid #f2edd5;
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
      padding: 30px 40px;
    }
    .title {
      font-family: 'Times New Roman', Georgia, serif;
      font-size: 22px;
      color: #2d231b;
      margin-bottom: 20px;
      font-weight: normal;
      letter-spacing: 0.5px;
      text-align: center;
    }
    .message {
      font-size: 14px;
      line-height: 1.7;
      color: #5a5045;
      margin-bottom: 30px;
    }
    .order-details-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    .order-details-table th {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #8c8074;
      border-bottom: 2px solid #c5a880;
      padding: 8px 10px;
      font-family: sans-serif;
    }
    .summary-row td {
      padding: 10px 10px;
      font-size: 13px;
      color: #5a5045;
      border-bottom: 1px solid #f7f5f0;
    }
    .summary-row-total td {
      padding: 12px 10px;
      font-size: 15px;
      font-weight: 700;
      color: #2d231b;
      border-top: 1.5px solid #c5a880;
      border-bottom: 2px double #c5a880;
    }
    .address-section {
      background-color: #fdfcfb;
      border: 1px solid #eae2d5;
      border-radius: 4px;
      padding: 20px;
      margin-bottom: 30px;
    }
    .address-title {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #8c8074;
      margin-top: 0;
      margin-bottom: 10px;
      font-family: sans-serif;
    }
    .address-text {
      font-size: 13px;
      line-height: 1.6;
      color: #5a5045;
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
        <h1 class="logo-text">M I P</h1>
        <div class="divider"></div>
      </div>
      <div class="content">
        <h2 class="title">Order Confirmed</h2>
        <p class="message">
          Dear <strong>${user.name || 'Valued Customer'}</strong>,<br><br>
          Thank you for choosing MIP Jewellers. We are pleased to confirm that your payment has been verified, and your order is now in production with our master craftsmen. 
        </p>

        <p style="font-size: 12px; color: #8c8074; margin-bottom: 10px; font-family: sans-serif; text-transform: uppercase; letter-spacing: 0.5px;">
          Order ID: <strong>#${order._id.toString()}</strong><br>
          Date: <strong>${new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}</strong>
        </p>
        
        <table class="order-details-table">
          <thead>
            <tr>
              <th style="text-align: left;">Item Description</th>
              <th style="text-align: center; width: 60px;">Qty</th>
              <th style="text-align: right; width: 100px;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
            <tr class="summary-row">
              <td colspan="2" style="text-align: right; font-weight: 600;">Subtotal</td>
              <td style="text-align: right; font-weight: 600;">₹${order.subTotal.toLocaleString('en-IN')}</td>
            </tr>
            ${order.discountAmount > 0 ? `
            <tr class="summary-row">
              <td colspan="2" style="text-align: right; color: #2e7d32;">Discount (${order.couponCode || 'Promo'})</td>
              <td style="text-align: right; color: #2e7d32;">-₹${order.discountAmount.toLocaleString('en-IN')}</td>
            </tr>
            ` : ''}
            <tr class="summary-row">
              <td colspan="2" style="text-align: right; color: #8c8074;">GST (Tax)</td>
              <td style="text-align: right; color: #8c8074;">₹${order.taxAmount.toLocaleString('en-IN')}</td>
            </tr>
            <tr class="summary-row-total">
              <td colspan="2" style="text-align: right;">Grand Total</td>
              <td style="text-align: right;">₹${order.grandTotal.toLocaleString('en-IN')}</td>
            </tr>
          </tbody>
        </table>

        <div class="address-section">
          <h3 class="address-title">Delivery Address</h3>
          <p class="address-text">
            ${addressHtml}
          </p>
        </div>

        <p style="font-size: 13px; line-height: 1.6; color: #5a5045; text-align: center; margin-top: 30px;">
          For any inquiries regarding your delivery, tracking, or gold rate lock, please feel free to connect with our support desk on WhatsApp at <strong>+91 6362893798</strong>.
        </p>
      </div>
      <div class="footer">
        <div class="footer-title">MIP Jewellers</div>
        <p class="footer-text">
          A Legacy of Purity & Crafted Luxury Excellence since 1925.
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

  // Attempt sending via SMTP if settings are provided
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
        subject: `MIP Jewellers Order Confirmed: #${order._id.toString()}`,
        html
      });
      console.log(`[SMTP] Successfully sent Order Confirmation email to: ${email}`);
    } catch (err) {
      console.error(`[SMTP] Failed to send Order Confirmation email: ${err.message}`);
      // Fallback
      try {
        const mockEmailDir = path.join(process.cwd(), 'public', 'mock-emails');
        if (!fs.existsSync(mockEmailDir)) fs.mkdirSync(mockEmailDir, { recursive: true });
        fs.writeFileSync(path.join(mockEmailDir, `order-confirmation-${order._id.toString()}.html`), html);
      } catch {}
    }
  } else {
    // No SMTP configured: save mock html file
    try {
      const mockEmailDir = path.join(process.cwd(), 'public', 'mock-emails');
      if (!fs.existsSync(mockEmailDir)) fs.mkdirSync(mockEmailDir, { recursive: true });
      fs.writeFileSync(path.join(mockEmailDir, `order-confirmation-${order._id.toString()}.html`), html);
      console.log(`[MOCK EMAIL] Order Confirmation saved to public/mock-emails/order-confirmation-${order._id.toString()}.html`);
    } catch (err) {
      console.warn('[MOCK EMAIL] Failed to write mock email html file:', err.message);
    }
  }
}

/**
 * Sends a beautifully styled welcome onboarding email to new customers.
 * If SMTP settings are missing, saves the output to public/mock-emails/welcome-[userId].html.
 * 
 * @param {string} email Target email address
 * @param {object} user The Mongoose User document
 */
export async function sendWelcomeEmail(email, user) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to MIP Jewellers</title>
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
      margin-bottom: 20px;
      font-weight: normal;
      letter-spacing: 0.5px;
    }
    .message {
      font-size: 14px;
      line-height: 1.75;
      color: #5a5045;
      margin-bottom: 30px;
      text-align: left;
    }
    .feature-card {
      background-color: #fdfcfb;
      border: 1px solid #eae2d5;
      padding: 20px;
      margin-bottom: 24px;
      text-align: left;
    }
    .feature-title {
      font-family: 'Times New Roman', Georgia, serif;
      font-size: 16px;
      color: #2d231b;
      margin-top: 0;
      margin-bottom: 8px;
    }
    .feature-text {
      font-size: 13px;
      line-height: 1.6;
      color: #7c7062;
      margin: 0;
    }
    .cta-button {
      display: inline-block;
      background-color: #2d231b;
      color: #ffffff !important;
      text-decoration: none;
      padding: 12px 30px;
      font-size: 12px;
      font-weight: bold;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-top: 10px;
      margin-bottom: 30px;
      border-radius: 2px;
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
        <h1 class="logo-text">M I P</h1>
        <div class="divider"></div>
      </div>
      <div class="content">
        <h2 class="title">Welcome to the MIP Family</h2>
        <p class="message">
          Dear <strong>${user.name || 'Valued Customer'}</strong>,<br><br>
          We are absolutely delighted to welcome you to MIP Jewellers. Established in 1925, MIP has been a trusted symbol of purity, craftsmanship, and luxury for over a century.<br><br>
          Whether you are celebrating a life milestone, looking for the perfect everyday sparkle, or investing in certified hallmarked gold and silver, we are here to offer you an unparalleled experience.
        </p>

        <div class="feature-card">
          <h3 class="feature-title">The Heritage Series</h3>
          <p class="feature-text">
            Explore our curated signature collections: the <strong>Aradhana Collection</strong> featuring graceful nature-inspired designs set in gold and diamonds, and our timeless <strong>Bridal Series</strong> handcrafted for life's most precious occasions.
          </p>
        </div>

        <div class="feature-card">
          <h3 class="feature-title">Kanaka Plus Gold Savings Scheme</h3>
          <p class="feature-text">
            Plan your gold and silver purchases intelligently. Invest monthly starting from ₹1,000, and redeem at maturity in pure gold or silver jewellery with <strong>zero making charges</strong> on your selected items.
          </p>
        </div>

        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://mipjewellers.com'}/products" target="_blank" class="cta-button">
          Explore Our Collections
        </a>
      </div>
      <div class="footer">
        <div class="footer-title">MIP Jewellers</div>
        <p class="footer-text">
          A Century of Certified Purity & Luxury Gold Craftsmanship since 1925.
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

  // Attempt sending via SMTP if settings are provided
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
        subject: `Welcome to MIP Jewellers - A Legacy of Purity Since 1925`,
        html
      });
      console.log(`[SMTP] Successfully sent Welcome email to: ${email}`);
    } catch (err) {
      console.error(`[SMTP] Failed to send Welcome email: ${err.message}`);
      // Fallback
      try {
        const mockEmailDir = path.join(process.cwd(), 'public', 'mock-emails');
        if (!fs.existsSync(mockEmailDir)) fs.mkdirSync(mockEmailDir, { recursive: true });
        fs.writeFileSync(path.join(mockEmailDir, `welcome-email-${user._id?.toString() || 'dev'}.html`), html);
      } catch {}
    }
  } else {
    // No SMTP configured: save mock html file
    try {
      const mockEmailDir = path.join(process.cwd(), 'public', 'mock-emails');
      if (!fs.existsSync(mockEmailDir)) fs.mkdirSync(mockEmailDir, { recursive: true });
      fs.writeFileSync(path.join(mockEmailDir, `welcome-email-${user._id?.toString() || 'dev'}.html`), html);
      console.log(`[MOCK EMAIL] Welcome email saved to public/mock-emails/welcome-email-${user._id?.toString() || 'dev'}.html`);
    } catch (err) {
      console.warn('[MOCK EMAIL] Failed to write mock email html file:', err.message);
    }
  }
}

/**
 * Sends a beautifully styled Cart Abandonment reminder email to registered customers.
 * If SMTP settings are missing, saves the output to public/mock-emails/abandoned-cart-[cartId].html.
 * 
 * @param {string} email Target email address
 * @param {object} cart The Mongoose Cart document (fully populated with items.product)
 * @param {object} user The Mongoose User document
 */
export async function sendCartAbandonmentEmail(email, cart, user) {
  // Format items list into HTML rows
  const itemRows = cart.items.map(item => {
    const product = item.product || {};
    const imgUrl = product.images?.[0] || '/placeholder.png';
    const priceText = product.price ? `₹${product.price.toLocaleString('en-IN')}` : '';

    return `
      <tr style="border-bottom: 1px solid #f1ebd5;">
        <td style="padding: 15px 10px; text-align: left; font-size: 13px; color: #2d231b; font-weight: 600;">
          ${product.name || 'Fine Jewellery Item'}
          <div style="font-size: 11px; color: #8c8074; font-weight: normal; margin-top: 4px; font-family: sans-serif;">
            Purity: ${product.metalPurity || '22KT'} · Weight: ${product.metalWeight || 'N/A'}g
          </div>
        </td>
        <td style="padding: 15px 10px; text-align: center; font-size: 13px; color: #5a5045;">
          ${item.quantity}
        </td>
        <td style="padding: 15px 10px; text-align: right; font-size: 13px; color: #2d231b; font-weight: 600;">
          ${priceText}
        </td>
      </tr>
    `;
  }).join('');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Don't Leave Your Sparkles Behind</title>
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
      padding: 35px 30px;
      text-align: center;
      background-color: #ffffff;
      border-bottom: 1px solid #f2edd5;
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
      padding: 30px 40px;
    }
    .title {
      font-family: 'Times New Roman', Georgia, serif;
      font-size: 22px;
      color: #2d231b;
      margin-bottom: 20px;
      font-weight: normal;
      letter-spacing: 0.5px;
      text-align: center;
    }
    .message {
      font-size: 14px;
      line-height: 1.7;
      color: #5a5045;
      margin-bottom: 30px;
    }
    .cart-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    .cart-table th {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #8c8074;
      border-bottom: 2px solid #c5a880;
      padding: 8px 10px;
      font-family: sans-serif;
    }
    .incentive-box {
      background-color: #fdfcfb;
      border-left: 3px solid #c5a880;
      padding: 16px 20px;
      margin-bottom: 30px;
      text-align: left;
    }
    .incentive-text {
      font-size: 13px;
      line-height: 1.6;
      color: #5a5045;
      margin: 0;
    }
    .cta-button {
      display: block;
      background-color: #2d231b;
      color: #ffffff !important;
      text-decoration: none;
      padding: 12px 30px;
      font-size: 12px;
      font-weight: bold;
      letter-spacing: 2px;
      text-transform: uppercase;
      text-align: center;
      margin: 20px auto 30px auto;
      border-radius: 2px;
      max-width: 220px;
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
        <h1 class="logo-text">M I P</h1>
        <div class="divider"></div>
      </div>
      <div class="content">
        <h2 class="title">You Left Something Beautiful</h2>
        <p class="message">
          Dear <strong>${user.name || 'Valued Customer'}</strong>,<br><br>
          We noticed that you added some fine handcrafted jewellery items to your shopping cart but didn't quite finish checking out. We have securely saved your selection for you!
        </p>
        
        <table class="cart-table">
          <thead>
            <tr>
              <th style="text-align: left;">Jewellery Item</th>
              <th style="text-align: center; width: 60px;">Qty</th>
              <th style="text-align: right; width: 100px;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>

        <div class="incentive-box">
          <p class="incentive-text">
            <strong>Lock in Today's Gold Rates:</strong> Gold rates fluctuate constantly. By finishing your purchase today, you can lock in current rates and safeguard your investment. In addition, connect with our support desk to receive a special <strong>2% gold savings discount</strong> or enjoy <strong>free making charges</strong> on your order.
          </p>
        </div>

        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://mipjewellers.com'}/cart" target="_blank" class="cta-button">
          Complete My Checkout
        </a>
        
        <p style="font-size: 13px; line-height: 1.6; color: #5a5045; text-align: center; margin-top: 30px;">
          Need assistance with size, weight customization, or selecting a diamond? Get in touch with our expert jewelry concierge directly on WhatsApp at <strong>+91 6362893798</strong>.
        </p>
      </div>
      <div class="footer">
        <div class="footer-title">MIP Jewellers</div>
        <p class="footer-text">
          A Century of Certified Purity & Luxury Gold Craftsmanship since 1925.
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

  // Attempt sending via SMTP if settings are provided
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
        subject: `Your jewellery selection is waiting for you - MIP Jewellers`,
        html
      });
      console.log(`[SMTP] Successfully sent Cart Abandonment email to: ${email}`);
    } catch (err) {
      console.error(`[SMTP] Failed to send Cart Abandonment email: ${err.message}`);
      // Fallback
      try {
        const mockEmailDir = path.join(process.cwd(), 'public', 'mock-emails');
        if (!fs.existsSync(mockEmailDir)) fs.mkdirSync(mockEmailDir, { recursive: true });
        fs.writeFileSync(path.join(mockEmailDir, `abandoned-cart-${cart._id.toString()}.html`), html);
      } catch {}
    }
  } else {
    // No SMTP configured: save mock html file
    try {
      const mockEmailDir = path.join(process.cwd(), 'public', 'mock-emails');
      if (!fs.existsSync(mockEmailDir)) fs.mkdirSync(mockEmailDir, { recursive: true });
      fs.writeFileSync(path.join(mockEmailDir, `abandoned-cart-${cart._id.toString()}.html`), html);
      console.log(`[MOCK EMAIL] Cart Abandonment saved to public/mock-emails/abandoned-cart-${cart._id.toString()}.html`);
    } catch (err) {
      console.warn('[MOCK EMAIL] Failed to write mock email html file:', err.message);
    }
  }
}

/**
 * Sends a beautifully styled luxury HTML Newsletter Subscription Welcome email to the subscriber.
 * If SMTP settings are missing, saves the output to public/mock-emails/newsletter-[email].html.
 * 
 * @param {string} email Target email address
 */
export async function sendNewsletterSubscriptionEmail(email) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to the MIP Circle</title>
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
      margin-bottom: 20px;
      font-weight: normal;
      letter-spacing: 0.5px;
    }
    .message {
      font-size: 14px;
      line-height: 1.75;
      color: #5a5045;
      margin-bottom: 30px;
      text-align: left;
    }
    .feature-card {
      background-color: #fdfcfb;
      border: 1px solid #eae2d5;
      padding: 20px;
      margin-bottom: 24px;
      text-align: left;
    }
    .feature-title {
      font-family: 'Times New Roman', Georgia, serif;
      font-size: 16px;
      color: #2d231b;
      margin-top: 0;
      margin-bottom: 8px;
    }
    .feature-text {
      font-size: 13px;
      line-height: 1.6;
      color: #7c7062;
      margin: 0;
    }
    .cta-button {
      display: inline-block;
      background-color: #2d231b;
      color: #ffffff !important;
      text-decoration: none;
      padding: 12px 30px;
      font-size: 12px;
      font-weight: bold;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-top: 10px;
      margin-bottom: 30px;
      border-radius: 2px;
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
        <h1 class="logo-text">M I P</h1>
        <div class="divider"></div>
      </div>
      <div class="content">
        <h2 class="title">Welcome to the MIP Circle</h2>
        <p class="message">
          Dear Subscriber,<br><br>
          Thank you for joining our exclusive circle. By subscribing to the MIP Jewellers newsletter, you are now part of our legacy of certified purity, bespoke design, and fine luxury craftsmanship since 1925.<br><br>
          As a valued member of the MIP Family, you will enjoy unique benefits curated just for you:
        </p>

        <div class="feature-card">
          <h3 class="feature-title">Exclusive Early Access</h3>
          <p class="feature-text">
            Be the first to browse and acquire pieces from our upcoming collections, including our signature handcrafted <strong>Aradhana Series</strong>.
          </p>
        </div>

        <div class="feature-card">
          <h3 class="feature-title">Gold Rate Trends & Offers</h3>
          <p class="feature-text">
            Receive private notifications on gold/silver market trends, rate locks, and exclusive member-only festive benefits.
          </p>
        </div>

        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://mipjewellers.com'}/products" target="_blank" class="cta-button">
          Browse Our Collections
        </a>
      </div>
      <div class="footer">
        <div class="footer-title">MIP Jewellers</div>
        <p class="footer-text">
          A Century of Certified Purity & Luxury Gold Craftsmanship since 1925.
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

  // Attempt sending via SMTP if settings are provided
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

  const sanitizedEmail = email.replace(/[^a-zA-Z0-9@._-]/g, '_');

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
        subject: `Welcome to the MIP Circle - Legacy of Purity Since 1925`,
        html
      });
      console.log(`[SMTP] Successfully sent Newsletter Welcome email to: ${email}`);
    } catch (err) {
      console.error(`[SMTP] Failed to send Newsletter Welcome email: ${err.message}`);
      // Fallback
      try {
        const mockEmailDir = path.join(process.cwd(), 'public', 'mock-emails');
        if (!fs.existsSync(mockEmailDir)) fs.mkdirSync(mockEmailDir, { recursive: true });
        fs.writeFileSync(path.join(mockEmailDir, `newsletter-${sanitizedEmail}.html`), html);
      } catch {}
    }
  } else {
    // No SMTP configured: save mock html file
    try {
      const mockEmailDir = path.join(process.cwd(), 'public', 'mock-emails');
      if (!fs.existsSync(mockEmailDir)) fs.mkdirSync(mockEmailDir, { recursive: true });
      fs.writeFileSync(path.join(mockEmailDir, `newsletter-${sanitizedEmail}.html`), html);
      console.log(`[MOCK EMAIL] Newsletter Welcome email saved to public/mock-emails/newsletter-${sanitizedEmail}.html`);
    } catch (err) {
      console.warn('[MOCK EMAIL] Failed to write mock email html file:', err.message);
    }
  }
}

