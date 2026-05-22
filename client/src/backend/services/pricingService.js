import GoldRate from '../models/GoldRate';

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

export async function calculateLiveProductPrice(product) {
  let liveRate = 0;
  
  try {
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
  const tax = basePrice * 0.03; // 3% GST
  const finalPrice = Math.round(basePrice + tax);

  return {
    rawMetalValue: Math.round(rawMetalValue),
    makingCharges: Math.round(makingCharges),
    gemstoneValue: Math.round(gemstoneValue),
    tax: Math.round(tax),
    finalPrice,
    liveRateUsed: liveRate
  };
}
