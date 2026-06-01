import { NextResponse } from 'next/server';
import dbConnect from '@/backend/config/dbConnect';
import PurchasePlanEnrolment from '@/backend/models/PurchasePlanEnrolment';
import { authenticate } from '@/backend/middlewares/authMiddleware';

export async function POST(req) {
  try {
    await dbConnect();
    const user = await authenticate(req);
    if (!user) {
      return NextResponse.json({ error: 'Please log in to enrol in a purchase plan.' }, { status: 401 });
    }

    const { planName, amount, tenure, panCard } = await req.json();
    if (!planName || !amount || !tenure || !panCard) {
      return NextResponse.json({ error: 'Please fill all required enrollment fields.' }, { status: 400 });
    }

    const enrolment = new PurchasePlanEnrolment({
      user: user._id,
      planName,
      amount: Number(amount),
      tenure,
      panCard: panCard.trim().toUpperCase()
    });

    await enrolment.save();

    return NextResponse.json({ success: true, enrolmentId: enrolment._id });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
