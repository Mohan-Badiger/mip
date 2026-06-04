import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { withAuth } from '@/lib/withAuth';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const POST = withAuth(async function POST(req) {
  try {
    const body = await req.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json({ success: false, error: 'No image data provided' }, { status: 400 });
    }

    // Upload base64 image or URL string to Cloudinary
    const result = await cloudinary.uploader.upload(image, {
      folder: 'mip_jewellers',
    });

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id
    });
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}, ['admin', 'catalog-manager', 'cms-editor']);
