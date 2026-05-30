import GoldRate from '../models/GoldRate';
import Settings from '../models/Settings';

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

export async function calculateLiveProductPrice(product, preloadedRates = null) {
  let liveRate = 0;
  
  try {
    if (preloadedRates && Array.isArray(preloadedRates)) {
      const rateRecord = preloadedRates.find(r => 
        r.metal === product.metalType && 
        r.purity === product.metalPurity
      );
      if (rateRecord) {
        liveRate = rateRecord.pricePerGram;
      }
    }
    
    if (liveRate === 0) {
      const rateRecord = await GoldRate.findOne({ 
        metal: product.metalType, 
        purity: product.metalPurity 
      });
      if (rateRecord) {
        liveRate = rateRecord.pricePerGram;
      } else {
        // Fallback to default index matrices if not initialized in database
        const metalRates = DEFAULT_RATES[product.metalType];
        liveRate = metalRates ? (metalRates[product.metalPurity] || 5000) : 5000;
      }
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

  let gstRate = 3.0;
  try {
    const activeSettings = await Settings.findOne();
    if (activeSettings && activeSettings.gstRate !== undefined) {
      gstRate = activeSettings.gstRate;
    }
  } catch (err) {
    console.error('Failed to fetch GST rate from DB settings:', err);
  }

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

