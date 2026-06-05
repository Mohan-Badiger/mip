import GoldRate from '../models/GoldRate';
import Settings from '../models/Settings';
import dbConnect from '../config/dbConnect';

// Standard market rate fallback constants (in INR) to keep system robust
const DEFAULT_RATES = {
  gold: {
    '18KT': 6000,
    '22KT': 7200,
    '24KT': 7850
  },
  silver: {
    '950PT': 95 // generic silver
  },
  platinum: {
    '950PT': 3200
  }
};

let cachedRates = null;
let lastRatesFetch = 0;

let cachedGstRate = null;
let lastGstFetch = 0;

const CACHE_TTL = 30000; // 30 seconds cache

async function getLiveRates() {
  const now = Date.now();
  if (cachedRates && (now - lastRatesFetch < CACHE_TTL)) {
    return cachedRates;
  }
  try {
    await dbConnect();
    const rates = await GoldRate.find({}).lean();
    if (rates && rates.length > 0) {
      cachedRates = rates;
      lastRatesFetch = now;
      return rates;
    }
  } catch (err) {
    console.error('Failed to cache gold rates:', err);
  }
  return cachedRates || [];
}

async function getGstRate() {
  const now = Date.now();
  if (cachedGstRate !== null && (now - lastGstFetch < CACHE_TTL)) {
    return cachedGstRate;
  }
  try {
    await dbConnect();
    const activeSettings = await Settings.findOne().lean();
    if (activeSettings && activeSettings.gstRate !== undefined) {
      cachedGstRate = activeSettings.gstRate;
      lastGstFetch = now;
      return cachedGstRate;
    }
  } catch (err) {
    console.error('Failed to cache GST rate:', err);
  }
  return cachedGstRate !== null ? cachedGstRate : 3.0;
}

export async function calculateLiveProductPrice(product, preloadedRates = null) {
  let liveRate = 0;
  
  try {
    const rates = preloadedRates && Array.isArray(preloadedRates) && preloadedRates.length > 0
      ? preloadedRates
      : await getLiveRates();

    const rateRecord = rates.find(r => 
      r.metal === product.metalType && 
      r.purity === product.metalPurity
    );
    
    if (rateRecord) {
      liveRate = rateRecord.pricePerGram;
    } else {
      // Fallback to default index matrices if not initialized in database
      const metalRates = DEFAULT_RATES[product.metalType];
      liveRate = metalRates ? (metalRates[product.metalPurity] || 5000) : 5000;
    }
  } catch {
    const metalRates = DEFAULT_RATES[product.metalType];
    liveRate = metalRates ? (metalRates[product.metalPurity] || 5000) : 5000;
  }

  const rawMetalValue = product.metalWeight * liveRate;
  
  // Making Charges Formula logic
  let makingCharges = 0;
  if (product.makingChargeType === 'flat_per_gram') {
    makingCharges = product.metalWeight * product.makingChargeValue;
  } else if (product.makingChargeType === 'percentage') {
    makingCharges = rawMetalValue * (product.makingChargeValue / 100);
  } else {
    makingCharges = product.makingChargeValue; // flat total
  }

  // Gemstones accumulation value
  const gemstoneValue = product.gemstones ? product.gemstones.reduce((acc, gem) => acc + gem.value, 0) : 0;

  // Base and Tax calculations
  const basePrice = rawMetalValue + makingCharges + gemstoneValue;

  const gstRate = await getGstRate();
  const tax = basePrice * (gstRate / 100);
  const finalPrice = Math.round(basePrice + tax);

  return {
    rawMetalValue: Math.round(rawMetalValue),
    makingCharges: Math.round(makingCharges),
    stoneValue: Math.round(gemstoneValue),
    gemstoneValue: Math.round(gemstoneValue),
    tax: Math.round(tax),
    finalPrice,
    liveRateUsed: liveRate
  };
}


