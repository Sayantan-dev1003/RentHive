const moment = require('moment');

/**
 * Calculate rental price for order items with pricelist discounts
 * @param {Array} orderItems - Array of order items with productId, quantity, rentalDuration
 * @param {Array} pricelists - Array of applicable pricelists
 * @returns {Object} Price breakdown and total
 */
const calculatePrice = (orderItems, pricelists = []) => {
  const breakdown = [];
  let subtotal = 0;
  let totalDiscount = 0;

  orderItems.forEach((item, index) => {
    const {
      product,
      quantity,
      rentalDuration: { startDate, endDate }
    } = item;

    // Calculate rental duration
    const start = moment(startDate);
    const end = moment(endDate);
    const durationHours = end.diff(start, 'hours');
    const durationDays = Math.ceil(durationHours / 24);
    const durationWeeks = Math.floor(durationDays / 7);
    const remainderDays = durationDays % 7;

    // Determine best pricing unit and calculate base price
    let basePrice = 0;
    let pricingUnit = '';
    let pricingDetails = {};

    if (durationHours < 24) {
      // Use hourly pricing
      basePrice = durationHours * product.pricing.hour * quantity;
      pricingUnit = 'hourly';
      pricingDetails = {
        hours: durationHours,
        rate: product.pricing.hour,
        quantity
      };
    } else if (durationDays < 7) {
      // Use daily pricing
      basePrice = durationDays * product.pricing.day * quantity;
      pricingUnit = 'daily';
      pricingDetails = {
        days: durationDays,
        rate: product.pricing.day,
        quantity
      };
    } else if (durationWeeks > 0) {
      // Use weekly pricing with remainder days
      const weeklyPrice = durationWeeks * product.pricing.week * quantity;
      const remainderPrice = remainderDays * product.pricing.day * quantity;
      basePrice = weeklyPrice + remainderPrice;
      pricingUnit = 'weekly';
      pricingDetails = {
        weeks: durationWeeks,
        weeklyRate: product.pricing.week,
        remainderDays,
        dailyRate: product.pricing.day,
        quantity
      };
    } else {
      // Fallback to daily pricing
      basePrice = durationDays * product.pricing.day * quantity;
      pricingUnit = 'daily';
      pricingDetails = {
        days: durationDays,
        rate: product.pricing.day,
        quantity
      };
    }

    // Apply pricelist discounts
    let discountAmount = 0;
    let appliedPricelist = null;

    // Find the best applicable pricelist
    const applicablePricelists = pricelists.filter(pricelist => {
      if (!pricelist.isCurrentlyValid) return false;
      
      const applicableRules = pricelist.getApplicableRules(
        product.category,
        quantity,
        durationHours
      );
      
      return applicableRules.length > 0;
    });

    if (applicablePricelists.length > 0) {
      // Sort by priority and find best discount
      applicablePricelists.sort((a, b) => b.priority - a.priority);
      
      for (const pricelist of applicablePricelists) {
        const rules = pricelist.getApplicableRules(
          product.category,
          quantity,
          durationHours
        );
        
        if (rules.length > 0) {
          // Apply the first (best) rule
          const rule = rules[0];
          
          if (rule.discountType === 'percentage') {
            discountAmount = Math.max(discountAmount, (basePrice * rule.discountValue) / 100);
          } else {
            discountAmount = Math.max(discountAmount, rule.discountValue * quantity);
          }
          
          appliedPricelist = {
            id: pricelist._id,
            name: pricelist.name,
            type: pricelist.type,
            rule: rule
          };
          break;
        }
      }
    }

    const finalPrice = Math.max(0, basePrice - discountAmount);

    const itemBreakdown = {
      itemIndex: index,
      productId: product._id,
      productName: product.name,
      category: product.category,
      quantity,
      rentalDuration: {
        startDate,
        endDate,
        hours: durationHours,
        days: durationDays
      },
      pricingUnit,
      pricingDetails,
      basePrice: Math.round(basePrice * 100) / 100,
      discountAmount: Math.round(discountAmount * 100) / 100,
      finalPrice: Math.round(finalPrice * 100) / 100,
      appliedPricelist
    };

    breakdown.push(itemBreakdown);
    subtotal += basePrice;
    totalDiscount += discountAmount;
  });

  const total = Math.max(0, subtotal - totalDiscount);

  return {
    breakdown,
    summary: {
      subtotal: Math.round(subtotal * 100) / 100,
      totalDiscount: Math.round(totalDiscount * 100) / 100,
      total: Math.round(total * 100) / 100,
      currency: 'INR'
    },
    metadata: {
      calculatedAt: new Date(),
      itemCount: orderItems.length,
      pricelistsApplied: pricelists.length
    }
  };
};

/**
 * Calculate base rental price without discounts
 * @param {Object} product - Product with pricing information
 * @param {Number} quantity - Quantity to rent
 * @param {Date} startDate - Rental start date
 * @param {Date} endDate - Rental end date
 * @returns {Object} Base price calculation
 */
const calculateBasePrice = (product, quantity, startDate, endDate) => {
  const start = moment(startDate);
  const end = moment(endDate);
  const durationHours = end.diff(start, 'hours');
  const durationDays = Math.ceil(durationHours / 24);

  let price = 0;
  let unit = '';

  if (durationHours < 24) {
    price = durationHours * product.pricing.hour * quantity;
    unit = 'hour';
  } else if (durationDays < 7) {
    price = durationDays * product.pricing.day * quantity;
    unit = 'day';
  } else {
    const weeks = Math.floor(durationDays / 7);
    const remainderDays = durationDays % 7;
    price = (weeks * product.pricing.week + remainderDays * product.pricing.day) * quantity;
    unit = 'week';
  }

  return {
    price: Math.round(price * 100) / 100,
    unit,
    duration: {
      hours: durationHours,
      days: durationDays
    }
  };
};

/**
 * Calculate late fee for overdue items
 * @param {Array} items - Order items with rental durations
 * @param {Date} actualReturnDate - Actual return date
 * @returns {Number} Late fee amount
 */
const calculateLateFee = (items, actualReturnDate = new Date()) => {
  const lateFeePerDay = parseFloat(process.env.LATE_FEE_PER_DAY) || 100;
  let totalLateFee = 0;

  items.forEach(item => {
    const expectedReturnDate = moment(item.rentalDuration.endDate);
    const actualReturn = moment(actualReturnDate);
    
    if (actualReturn.isAfter(expectedReturnDate)) {
      const daysLate = actualReturn.diff(expectedReturnDate, 'days');
      const itemLateFee = daysLate * lateFeePerDay * item.quantity;
      totalLateFee += itemLateFee;
    }
  });

  return Math.round(totalLateFee * 100) / 100;
};

/**
 * Get pricing recommendations for a product
 * @param {Object} product - Product object
 * @param {Number} requestedHours - Requested rental duration in hours
 * @returns {Array} Array of pricing options
 */
const getPricingRecommendations = (product, requestedHours) => {
  const recommendations = [];
  
  // Hourly option
  if (requestedHours <= 24) {
    recommendations.push({
      unit: 'hour',
      duration: requestedHours,
      rate: product.pricing.hour,
      total: requestedHours * product.pricing.hour,
      savings: 0
    });
  }
  
  // Daily option
  const days = Math.ceil(requestedHours / 24);
  const dailyTotal = days * product.pricing.day;
  const hourlyTotal = requestedHours * product.pricing.hour;
  
  recommendations.push({
    unit: 'day',
    duration: days,
    rate: product.pricing.day,
    total: dailyTotal,
    savings: Math.max(0, hourlyTotal - dailyTotal)
  });
  
  // Weekly option
  if (requestedHours >= 168) { // 7 days
    const weeks = Math.floor(requestedHours / 168);
    const remainderHours = requestedHours % 168;
    const remainderDays = Math.ceil(remainderHours / 24);
    const weeklyTotal = weeks * product.pricing.week + remainderDays * product.pricing.day;
    
    recommendations.push({
      unit: 'week',
      duration: weeks + (remainderDays / 7),
      rate: product.pricing.week,
      total: weeklyTotal,
      savings: Math.max(0, dailyTotal - weeklyTotal)
    });
  }
  
  return recommendations.sort((a, b) => a.total - b.total);
};

module.exports = {
  calculatePrice,
  calculateBasePrice,
  calculateLateFee,
  getPricingRecommendations
};
