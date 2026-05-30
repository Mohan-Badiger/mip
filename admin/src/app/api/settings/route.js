import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Settings from '@/lib/models/Settings';
import { logAdminAction } from '@/lib/auditLogger';
import { withAuth } from '@/lib/withAuth';

export const GET = withAuth(async function GET(req) {
  try {
    await dbConnect();
    let settings = await Settings.findOne();
    if (!settings) {
      // Create default settings if they do not exist
      settings = await Settings.create({
        autoUpdateRates: false,
        showLiveBanner: false,
        autoRecalculatePricing: true,
        goldRateOffset: 0
      });
    }
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});

export const PUT = withAuth(async function PUT(req) {
  try {
    await dbConnect();
    const body = await req.json();

    let settings = await Settings.findOne();
    const originalSettings = settings ? settings.toObject() : {};

    if (!settings) {
      settings = new Settings();
    }

    // Update settings fields
    if (body.autoUpdateRates !== undefined) settings.autoUpdateRates = body.autoUpdateRates;
    if (body.showLiveBanner !== undefined) settings.showLiveBanner = body.showLiveBanner;
    if (body.autoRecalculatePricing !== undefined) settings.autoRecalculatePricing = body.autoRecalculatePricing;
    if (body.goldRateOffset !== undefined) settings.goldRateOffset = Number(body.goldRateOffset);
    if (body.smtpHost !== undefined) settings.smtpHost = body.smtpHost;
    if (body.smtpPort !== undefined) settings.smtpPort = Number(body.smtpPort);
    if (body.smtpUser !== undefined) settings.smtpUser = body.smtpUser;
    if (body.smtpPass !== undefined) settings.smtpPass = body.smtpPass;

    // Store general profile
    if (body.brandName !== undefined) settings.brandName = body.brandName;
    if (body.supportPhone !== undefined) settings.supportPhone = body.supportPhone;
    if (body.supportEmail !== undefined) settings.supportEmail = body.supportEmail;
    if (body.storeAddress !== undefined) settings.storeAddress = body.storeAddress;

    // Custom Banner / Announcement
    if (body.bannerEnabled !== undefined) settings.bannerEnabled = body.bannerEnabled;
    if (body.bannerText !== undefined) settings.bannerText = body.bannerText;
    if (body.bannerBgColor !== undefined) settings.bannerBgColor = body.bannerBgColor;
    if (body.bannerTextColor !== undefined) settings.bannerTextColor = body.bannerTextColor;

    // Financial & Taxes
    if (body.gstRate !== undefined) settings.gstRate = Number(body.gstRate);
    if (body.makingChargeGstRate !== undefined) settings.makingChargeGstRate = Number(body.makingChargeGstRate);

    // Shipping & Logistics
    if (body.freeShippingThreshold !== undefined) settings.freeShippingThreshold = Number(body.freeShippingThreshold);
    if (body.shippingCharge !== undefined) settings.shippingCharge = Number(body.shippingCharge);
    if (body.insuranceFee !== undefined) settings.insuranceFee = Number(body.insuranceFee);

    // COD
    if (body.codAllowed !== undefined) settings.codAllowed = body.codAllowed;
    if (body.codLimit !== undefined) settings.codLimit = Number(body.codLimit);
    if (body.codExtraCharge !== undefined) settings.codExtraCharge = Number(body.codExtraCharge);

    // Returns
    if (body.allowReturns !== undefined) settings.allowReturns = body.allowReturns;
    if (body.returnPeriodDays !== undefined) settings.returnPeriodDays = Number(body.returnPeriodDays);

    const savedSettings = await settings.save();

    // Log admin action
    await logAdminAction(req, {
      action: 'UPDATE',
      entity: 'Settings',
      entityId: savedSettings._id,
      description: 'Updated system parameters and configuration settings',
      changes: {
        original: originalSettings,
        updated: savedSettings.toObject()
      }
    });

    return NextResponse.json({ success: true, data: savedSettings });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}, ['admin']);
