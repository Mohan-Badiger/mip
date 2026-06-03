import { NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/backend/config/dbConnect';
import Subscriber from '@/backend/models/Subscriber';
import { sendNewsletterSubscriptionEmail } from '@/backend/services/emailService';

const subscribeSchema = z.object({
  email: z.string().trim().email({ message: 'Invalid email address' }).max(100),
});

export async function POST(req) {
  try {
    await dbConnect();
    
    const body = await req.json();
    const result = subscribeSchema.safeParse(body);

    if (!result.success) {
      const errorMsg = result.error.issues.map(err => err.message).join(', ');
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { email } = result.data;
    const normalizedEmail = email.toLowerCase();

    // Check if email already subscribed
    let subscriber = await Subscriber.findOne({ email: normalizedEmail });

    if (subscriber) {
      if (subscriber.active) {
        return NextResponse.json({
          success: true,
          message: 'Thank you! You are already subscribed to the MIP Family.'
        });
      } else {
        // Re-activate subscription
        subscriber.active = true;
        await subscriber.save();
      }
    } else {
      // Create new subscription
      subscriber = new Subscriber({
        email: normalizedEmail,
        active: true
      });
      await subscriber.save();
    }

    // Trigger newsletter welcome email asynchronously
    sendNewsletterSubscriptionEmail(normalizedEmail).catch(err => {
      console.error('[EMAIL ERROR] Failed to send newsletter welcome email:', err);
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you for joining our MIP Family!'
    });

  } catch (error) {
    console.error('[NEWSLETTER SUBSCRIBE ERROR] Failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
