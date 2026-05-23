export async function triggerClientRevalidate(tag) {
  try {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const secret = process.env.REVALIDATION_SECRET || 'mip-secret';
    
    // Construct the endpoint target on client
    const targetUrl = `${clientUrl}/api/revalidate?tag=${encodeURIComponent(tag)}&secret=${encodeURIComponent(secret)}`;
    
    console.log(`[REVALIDATE TRIGGER] Purging client cache for tag: "${tag}" via ${clientUrl}...`);
    
    // Send fire-and-forget or async revalidate request
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    const data = await response.json();
    if (data.revalidated) {
      console.log(`[REVALIDATE SUCCESS] Purged tag: "${tag}" successfully on client cache.`);
    } else {
      console.log(`[REVALIDATE WARNING] Client returned cache non-revalidated status:`, data);
    }
  } catch (error) {
    // Gracefully catch errors if the client is not running, or revalidation endpoint is not yet mounted
    console.warn(`[REVALIDATE WARNING] Failed to connect to client revalidate handler (Client might be offline or route not mounted yet):`, error.message);
  }
}
