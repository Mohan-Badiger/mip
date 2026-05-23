import { NextResponse } from 'next/server';
import { triggerClientRevalidate } from '@/lib/revalidateHelper';
import { logAdminAction } from '@/lib/auditLogger';

export async function POST(req) {
  try {
    const body = await req.json();
    const { tag } = body;

    if (!tag) {
      return NextResponse.json({ success: false, error: 'Revalidation tag is required' }, { status: 400 });
    }

    console.log(`[ADMIN ACTION] Manual cache purge requested for tag: "${tag}"`);

    // Trigger revalidation on client
    await triggerClientRevalidate(tag);

    // Log the admin action
    await logAdminAction(req, {
      action: 'PURGE_CACHE',
      entity: 'Cache',
      entityId: tag,
      description: `Manually purged cache for client tag: ${tag}`
    });

    return NextResponse.json({ success: true, message: `Successfully triggered client revalidation for tag: ${tag}` });
  } catch (error) {
    console.error('Error triggering manual revalidation:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
