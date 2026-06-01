import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Review from '@/lib/models/Review';
import { withAuth } from '@/lib/withAuth';

const INITIAL_REVIEWS = [
  {
    author: "Aishwarya R.",
    email: "aishwarya.r@gmail.com",
    rating: 5,
    product: "22KT Bridal Gold Choker Set",
    date: "May 14, 2026",
    text: "Absolutely stunning design! The hallmark certification was verified and the billing was highly transparent according to live rates. The packaging felt extremely luxurious.",
    approved: true,
    hidden: false
  },
  {
    author: "Vikram S.",
    email: "vikram.singh@outlook.com",
    rating: 5,
    product: "Signature Platinum Ring",
    date: "May 10, 2026",
    text: "Excellent craftsmanship. The diamond sparkles beautifully and has great fire under lighting. Will definitely purchase again.",
    approved: true,
    hidden: false
  },
  {
    author: "Nalini Gowda",
    email: "nalini.gowda@gmail.com",
    rating: 4,
    product: "Anti-tarnish Silver Bracelet",
    date: "May 12, 2026",
    text: "Beautiful piece of jewellery, although delivery was delayed by a day. Customer service kept me informed and the bracelet quality is superb.",
    approved: false,
    hidden: false
  },
  {
    author: "Priya M.",
    email: "priya.m@gmail.com",
    rating: 5,
    product: "Antique Temple Earrings",
    date: "May 18, 2026",
    text: "The earrings look exactly as shown in the images. Exquisite finish and lightweight to wear. Fits my bridal look perfectly.",
    approved: true,
    hidden: false
  },
  {
    author: "Siddharth K.",
    email: "sid.k@yahoo.com",
    rating: 3,
    product: "Mens Gold Kada 24KT",
    date: "May 08, 2026",
    text: "The design is very traditional and heavy. However, the clasp is a bit tight and takes effort to open. Hope it loosens up with use.",
    approved: false,
    hidden: false
  }
];

export const GET = withAuth(async function GET() {
  try {
    await dbConnect();
    let reviews = await Review.find({});
    
    // Seed initial reviews if empty
    if (reviews.length === 0) {
      await Review.insertMany(INITIAL_REVIEWS);
      reviews = await Review.find({});
    }
    
    return NextResponse.json({ success: true, data: reviews });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});
