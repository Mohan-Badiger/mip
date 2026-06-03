import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import dbConnect from '@/lib/dbConnect';
import Settings from '@/lib/models/Settings';

export async function sendOrderStatusEmail(order, status, trackingId) {
  try {
    const customerEmail = order.user?.email;
    const customerName = order.user?.name || 'Customer';
    const orderIdLabel = order.razorpayOrderId || order._id?.toString().slice(-8).toUpperCase();

    if (!customerEmail) {
      console.warn(`[NOTIFICATION] Cannot send email. Order #${order._id} has no customer email.`);
      return;
    }

    await dbConnect();
    const dbSettings = await Settings.findOne();
    
    const host = dbSettings?.smtpHost || process.env.SMTP_HOST || '';
    const port = Number(dbSettings?.smtpPort) || Number(process.env.SMTP_PORT) || 587;
    const user = dbSettings?.smtpUser || process.env.SMTP_USER || '';
    const pass = dbSettings?.smtpPass || process.env.SMTP_PASS || '';

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });

    const isConfigured = !!(host && user && pass);

    let statusTitle = "Order Status Updated";
    let statusDescription = `Your order status has been updated.`;
    let trackingSection = "";

    if (status === 'shipped') {
      statusTitle = "Your Order Has Shipped";
      statusDescription = `Dear <strong>${customerName}</strong>,<br><br>
        Exciting news! Your custom premium jewellery is complete and has been handed over to our shipping courier partner. It is now on its way to your destination.`;
      
      if (trackingId) {
        trackingSection = `
          <div class="tracking-box">
            <p class="tracking-label">Blue Dart Tracking Number</p>
            <p class="tracking-code">${trackingId}</p>
            <p class="tracking-eta">
              Estimated Delivery: <strong>3-5 business days</strong> via <strong>Blue Dart Express</strong>.
            </p>
            <a href="https://www.bluedart.com/tracking?trackid=${trackingId}" target="_blank" class="cta-button">
              Track Shipment Status
            </a>
          </div>
        `;
      }
    } else if (status === 'delivered') {
      statusTitle = "Order Delivered Successfully";
      statusDescription = `Dear <strong>${customerName}</strong>,<br><br>
        We are pleased to inform you that your purchase from MIP Jewellers has been successfully delivered. We hope your new fine jewellery adds beauty to your life and serves as a treasured keepsake. Thank you for shopping with MIP Jewellers.`;
    } else {
      statusTitle = `Order Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`;
      statusDescription = `Dear <strong>${customerName}</strong>,<br><br>
        Your order status has transitioned to <strong>${status}</strong>. We are currently processing your order with the utmost care.`;
    }

    const itemRows = order.items?.map(item => `
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
          ₹${item.finalPriceLocked?.toLocaleString('en-IN')}
        </td>
      </tr>
    `).join('') || '';

    const shipping = order.shippingAddress;
    const addressHtml = shipping ? `
      ${shipping.street}${shipping.area ? `, ${shipping.area}` : ''}<br>
      ${shipping.city}, ${shipping.state} - ${shipping.pincode}<br>
      ${shipping.country}
    ` : '';

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MIP Jewellers - ${statusTitle}</title>
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
    .tracking-box {
      background-color: #fdfcfb;
      border: 1px solid #eae2d5;
      border-left: 3px solid #c5a880;
      border-radius: 4px;
      padding: 20px;
      margin-bottom: 30px;
      text-align: center;
    }
    .tracking-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #8c8074;
      margin: 0 0 8px 0;
      font-family: sans-serif;
    }
    .tracking-code {
      font-size: 22px;
      font-weight: 700;
      color: #2d231b;
      margin: 0 0 15px 0;
      font-family: 'Courier New', Courier, monospace;
      letter-spacing: 1.5px;
    }
    .tracking-eta {
      font-size: 13px;
      line-height: 1.6;
      color: #5a5045;
      margin: 0 0 15px 0;
    }
    .cta-button {
      display: inline-block;
      background-color: #2d231b;
      color: #ffffff !important;
      text-decoration: none;
      padding: 10px 24px;
      font-size: 11px;
      font-weight: bold;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      border-radius: 2px;
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
        <h2 class="title">${statusTitle}</h2>
        <p class="message">
          ${statusDescription}
        </p>

        ${trackingSection}

        <p style="font-size: 12px; color: #8c8074; margin-bottom: 10px; font-family: sans-serif; text-transform: uppercase; letter-spacing: 0.5px;">
          Order ID: <strong>#${orderIdLabel}</strong><br>
          Updated: <strong>${new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}</strong>
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
              <td style="text-align: right; font-weight: 600;">₹${order.subTotal?.toLocaleString('en-IN')}</td>
            </tr>
            ${order.discountAmount > 0 ? `
            <tr class="summary-row">
              <td colspan="2" style="text-align: right; color: #2e7d32;">Discount (${order.couponCode || 'Promo'})</td>
              <td style="text-align: right; color: #2e7d32;">-₹${order.discountAmount.toLocaleString('en-IN')}</td>
            </tr>
            ` : ''}
            <tr class="summary-row">
              <td colspan="2" style="text-align: right; color: #8c8074;">GST (Tax)</td>
              <td style="text-align: right; color: #8c8074;">₹${order.taxAmount?.toLocaleString('en-IN')}</td>
            </tr>
            <tr class="summary-row-total">
              <td colspan="2" style="text-align: right;">Grand Total</td>
              <td style="text-align: right;">₹${order.grandTotal?.toLocaleString('en-IN')}</td>
            </tr>
          </tbody>
        </table>

        ${shipping ? `
        <div class="address-section">
          <h3 class="address-title">Delivery Address</h3>
          <p class="address-text">
            ${addressHtml}
          </p>
        </div>
        ` : ''}

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

    if (isConfigured) {
      try {
        const mailOptions = {
          from: `"MIP Jewellers" <${user}>`,
          to: customerEmail,
          subject: `[MIP Jewellers] Order #${orderIdLabel} Status Updated to ${status.toUpperCase()}`,
          html: htmlContent
        };
        await transporter.sendMail(mailOptions);
        console.log(`[NOTIFICATION] Sent email alert successfully to ${customerEmail}`);
      } catch (err) {
        console.error(`[SMTP] Failed to send order status email: ${err.message}`);
        // Fallback to write mock file on SMTP error
        try {
          const mockEmailDir = path.join(process.cwd(), 'public', 'mock-emails');
          if (!fs.existsSync(mockEmailDir)) fs.mkdirSync(mockEmailDir, { recursive: true });
          fs.writeFileSync(path.join(mockEmailDir, `order-status-${status}-${order._id?.toString()}.html`), htmlContent);
          console.log(`[MOCK EMAIL] Saved order status email fallback to public/mock-emails/order-status-${status}-${order._id?.toString()}.html`);
        } catch {}
      }
    } else {
      console.log(`\n======================================================`);
      console.log(`[SMTP MOCK NOTIFICATION] Transactional Email Triggered:`);
      console.log(`To: ${customerEmail}`);
      console.log(`Subject: [MIP Jewellers] Order #${orderIdLabel} Status Updated to ${status.toUpperCase()}`);
      console.log(`Status Transition: ${status}`);
      console.log(`Tracking ID: ${trackingId || 'None'}`);
      console.log(`HTML Payload Length: ${htmlContent.length} bytes`);
      console.log(`======================================================\n`);

      // Write mock file so it can be verified in local dev
      try {
        const mockEmailDir = path.join(process.cwd(), 'public', 'mock-emails');
        if (!fs.existsSync(mockEmailDir)) {
          fs.mkdirSync(mockEmailDir, { recursive: true });
        }
        fs.writeFileSync(path.join(mockEmailDir, `order-status-${status}-${order._id?.toString()}.html`), htmlContent);
        console.log(`[MOCK EMAIL] Order Status Update saved to public/mock-emails/order-status-${status}-${order._id?.toString()}.html`);
      } catch (err) {
        console.warn('[MOCK EMAIL] Failed to write mock email html file:', err.message);
      }
    }
  } catch (error) {
    console.error('Failed to compile or dispatch order email notification:', error);
  }
}

