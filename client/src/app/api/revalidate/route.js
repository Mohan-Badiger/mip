import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get('tag');
    const secret = searchParams.get('secret');

    // Validate the revalidation token/secret to prevent DOS attacks
    const expectedSecret = process.env.REVALIDATION_SECRET;
    if (!expectedSecret || secret !== expectedSecret) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    if (!tag) {
      return NextResponse.json({ message: 'Missing tag parameter' }, { status: 400 });
    }

    // Perform tag revalidation
    revalidateTag(tag);
    
    console.log(`[CLIENT CACHE] Revalidated tag: "${tag}"`);
    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
