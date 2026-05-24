// In-memory sliding-window rate limiter for Next.js API routes

const rateLimitMap = new Map();

// Periodically clean up expired entries from the map to prevent memory leaks
if (global.rateLimitIntervalId) {
  clearInterval(global.rateLimitIntervalId);
}
global.rateLimitIntervalId = setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000); // run clean up every 5 minutes

export function rateLimit(key, limit = 5, windowMs = 60 * 1000) {
  const now = Date.now();
  let record = rateLimitMap.get(key);

  if (!record) {
    record = {
      requests: [now],
      resetTime: now + windowMs,
    };
    rateLimitMap.set(key, record);
    return { success: true, count: 1, limit, reset: record.resetTime };
  }

  // Filter out requests older than the sliding window
  record.requests = record.requests.filter((timestamp) => now - timestamp < windowMs);
  
  // Update resetTime to the next timestamp in line, or default window from now
  record.resetTime = record.requests.length > 0 
    ? record.requests[0] + windowMs 
    : now + windowMs;

  if (record.requests.length >= limit) {
    return { 
      success: false, 
      count: record.requests.length, 
      limit, 
      reset: record.resetTime 
    };
  }

  record.requests.push(now);
  return { 
    success: true, 
    count: record.requests.length, 
    limit, 
    reset: record.resetTime 
  };
}

export function resetRateLimit(key) {
  rateLimitMap.delete(key);
}

