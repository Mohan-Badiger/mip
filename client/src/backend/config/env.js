function getEnv(key, defaultValue = '') {
  let value = process.env[key] || defaultValue;
  if (typeof value === 'string') {
    value = value.trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    if (value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1);
    }
  }
  return value;
}

export const MONGODB_URI = getEnv('MONGODB_URI', 'mongodb://localhost:27017/mip_jewellers');
export const JWT_SECRET = getEnv('JWT_SECRET');
export const RAZORPAY_KEY_ID = getEnv('RAZORPAY_KEY_ID');
export const RAZORPAY_KEY_SECRET = getEnv('RAZORPAY_KEY_SECRET');
