import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Settings from '@/lib/models/Settings';
import { logAdminAction } from '@/lib/auditLogger';

export async function GET(req) {
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
}

export async function PUT(req) {
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
}
