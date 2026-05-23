import nodemailer from 'nodemailer';
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

    let statusTitle = "Order Update";
    let statusDescription = `Your order status has been transitioned to: **${status}**`;
    let trackingSection = "";

    if (status === 'shipped') {
      statusTitle = "Your MIP Order has Shipped! 🚚";
      statusDescription = `Exciting news! Your custom premium jewellery is packaged and handed over to our shipping courier partner. It is on its way to your destination.`;
      if (trackingId) {
        trackingSection = `
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; margin-top: 15px; text-align: center;">
            <p style="margin: 0; font-size: 13px; color: #64748b; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em;">Courier Tracking Number</p>
            <p style="margin: 5px 0 12px 0; font-size: 20px; font-family: monospace; font-weight: bold; color: #0f172a;">${trackingId}</p>
            <a href="https://www.bluedart.com/tracking?trackid=${trackingId}" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 8px 16px; font-size: 12px; font-weight: bold; text-decoration: none; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.05em;">Track Delivery Status</a>
          </div>
        `;
      }
    } else if (status === 'delivered') {
      statusTitle = "Your MIP Order has been Delivered! 🎉";
      statusDescription = `We hope your new fine jewellery adds beauty to your life. Your purchase order has been marked as successfully delivered. Thank you for shopping with MIP Jewellers.`;
    }

    const itemsHtml = order.items?.map(item => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px 0; font-size: 14px; color: #334155;">
          <strong>${item.name}</strong><br/>
          <span style="font-size: 11px; color: #64748b; text-transform: uppercase;">${item.metalWeightLocked}g (${item.metalPurityLocked})</span>
        </td>
        <td style="padding: 12px 0; text-align: right; font-size: 14px; color: #334155;">${item.quantity}</td>
        <td style="padding: 12px 0; text-align: right; font-size: 14px; font-weight: bold; color: #0f172a;">₹${item.finalPriceLocked.toLocaleString('en-IN')}</td>
      </tr>
    `).join('') || '';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${statusTitle}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; padding: 25px; margin: 0;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background-color: #0f172a; padding: 30px; text-align: center; border-bottom: 3px solid #b45309;">
              <h1 style="color: #ffffff; margin: 0; font-size: 26px; letter-spacing: 0.15em; font-family: Cinzel, Georgia, serif; text-transform: uppercase;">MIP JEWELLERS</h1>
              <p style="color: #94a3b8; margin: 5px 0 0 0; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase;">Pure Elegance, Timeless Craft</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #0f172a; margin-top: 0; font-size: 20px; font-weight: bold;">Dear ${customerName},</h2>
              <p style="color: #334155; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
                ${statusDescription}
              </p>
              
              ${trackingSection}

              <h3 style="color: #0f172a; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; margin-top: 30px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b;">Order Summary (#${orderIdLabel})</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                <thead>
                  <tr style="border-bottom: 2px solid #e2e8f0; text-align: left; font-size: 11px; text-transform: uppercase; color: #64748b;">
                    <th style="padding-bottom: 10px;">Item</th>
                    <th style="padding-bottom: 10px; text-align: right;">Qty</th>
                    <th style="padding-bottom: 10px; text-align: right;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                  <tr>
                    <td colspan="2" style="padding: 15px 0 5px 0; font-size: 14px; color: #64748b; text-align: right;">Subtotal:</td>
                    <td style="padding: 15px 0 5px 0; font-size: 14px; text-align: right; color: #334155;">₹${order.subTotal?.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding: 5px 0; font-size: 14px; color: #64748b; text-align: right;">GST (3%):</td>
                    <td style="padding: 5px 0; font-size: 14px; text-align: right; color: #334155;">₹${order.taxAmount?.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr style="border-top: 1px solid #e2e8f0;">
                    <td colspan="2" style="padding: 15px 0 0 0; font-size: 16px; font-weight: bold; color: #0f172a; text-align: right;">Grand Total:</td>
                    <td style="padding: 15px 0 0 0; font-size: 18px; font-weight: bold; text-align: right; color: #b45309;">₹${order.grandTotal?.toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>

              <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin-top: 40px; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 20px;">
                If you have any questions regarding your order, please reach out to our VIP support desk at <a href="mailto:support@mipjewellers.com" style="color: #b45309; text-decoration: none; font-weight: bold;">support@mipjewellers.com</a>.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 25px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
              &copy; ${new Date().getFullYear()} MIP Jewellers. All rights reserved.
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    if (isConfigured) {
      const mailOptions = {
        from: `"MIP Jewellers" <${user}>`,
        to: customerEmail,
        subject: `[MIP Jewellers] Order #${orderIdLabel} Status Updated to ${status.toUpperCase()}`,
        html: htmlContent
      };
      await transporter.sendMail(mailOptions);
      console.log(`[NOTIFICATION] Sent email alert successfully to ${customerEmail}`);
    } else {
      console.log(`\n======================================================`);
      console.log(`[SMTP MOCK NOTIFICATION] Transactional Email Triggered:`);
      console.log(`To: ${customerEmail}`);
      console.log(`Subject: [MIP Jewellers] Order #${orderIdLabel} Status Updated to ${status.toUpperCase()}`);
      console.log(`Status Transition: ${status}`);
      console.log(`Tracking ID: ${trackingId || 'None'}`);
      console.log(`HTML Payload Length: ${htmlContent.length} bytes`);
      console.log(`======================================================\n`);
    }
  } catch (error) {
    console.error('Failed to compile or dispatch order email notification:', error);
  }
}
