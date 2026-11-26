const fs = require('fs');
const path = require('path');

const pantryStaples = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'data', 'pantryStaples.json'), 'utf8')
);

/**
 * Aggregates ingredients across a 7-day meal plan
 * @param {Object} plan - 1-day meal plan or array of 7 days
 * @param {Array} pantryItems - user already-owned items
 */
function generateGroceryList(plan, days = 7, userPantry = []) {
  const pantrySet = new Set(
    (userPantry || []).map(item => (typeof item === 'string' ? item.toLowerCase() : item.id?.toLowerCase()))
  );

  const ingredientMap = new Map();

  // Extract meals array
  let mealList = [];
  if (Array.isArray(plan)) {
    mealList = plan.flatMap(day => Object.values(day.meals || {}));
  } else if (plan && plan.meals) {
    // If single day plan, multiply ingredients by `days` (default 7)
    mealList = Object.values(plan.meals);
  }

  const multiplier = Array.isArray(plan) ? 1 : days;

  for (const meal of mealList) {
    if (!meal || !meal.ingredients) continue;
    for (const ing of meal.ingredients) {
      const key = ing.name.trim();
      const numAmount = parseFloat(ing.amount) || 1;
      const totalAmount = numAmount * multiplier;
      const totalCost = (ing.cost || 5) * multiplier;

      if (ingredientMap.has(key)) {
        const existing = ingredientMap.get(key);
        existing.amount += totalAmount;
        existing.cost += totalCost;
        existing.frequency += multiplier;
      } else {
        ingredientMap.set(key, {
          name: key,
          amount: totalAmount,
          unit: ing.unit || 'unit',
          cost: totalCost,
          frequency: multiplier,
          inPantry: false
        });
      }
    }
  }

  // Check against user pantry
  for (const [key, item] of ingredientMap.entries()) {
    const isOwned = [...pantrySet].some(p => key.toLowerCase().includes(p) || p.includes(key.toLowerCase()));
    item.inPantry = isOwned;
  }

  // Categorize items
  const categories = {
    'Dairy & Eggs': [],
    'Proteins, Dals & Pulses': [],
    'Grains, Flours & Bread': [],
    'Fresh Vegetables & Herbs': [],
    'Oils, Condiments & Spices': []
  };

  let totalEstimatedDailyLooseCost = 0;
  let totalEstimatedBulkStoreCost = 0;

  for (const item of ingredientMap.values()) {
    totalEstimatedDailyLooseCost += item.cost;

    // Categorization heuristic
    const nameLower = item.name.toLowerCase();
    let cat = 'Oils, Condiments & Spices';

    if (nameLower.includes('egg') || nameLower.includes('paneer') || nameLower.includes('curd') || nameLower.includes('dahi') || nameLower.includes('milk')) {
      cat = 'Dairy & Eggs';
    } else if (nameLower.includes('soya') || nameLower.includes('dal') || nameLower.includes('chana') || nameLower.includes('rajma') || nameLower.includes('sprout') || nameLower.includes('peanut') || nameLower.includes('chicken') || nameLower.includes('fish')) {
      cat = 'Proteins, Dals & Pulses';
    } else if (nameLower.includes('rice') || nameLower.includes('roti') || nameLower.includes('atta') || nameLower.includes('bread') || nameLower.includes('oats') || nameLower.includes('poha') || nameLower.includes('besan') || nameLower.includes('sattu') || nameLower.includes('rava') || nameLower.includes('dalia') || nameLower.includes('semiya')) {
      cat = 'Grains, Flours & Bread';
    } else if (nameLower.includes('onion') || nameLower.includes('tomato') || nameLower.includes('potato') || nameLower.includes('banana') || nameLower.includes('palak') || nameLower.includes('spinach') || nameLower.includes('chili') || nameLower.includes('cucumber') || nameLower.includes('peas') || nameLower.includes('lauki') || nameLower.includes('lemon')) {
      cat = 'Fresh Vegetables & Herbs';
    }

    // Bulk discount heuristic: buying 1-week or bulk packs saves 18-25% over single-portion loose canteen pricing
    const bulkDiscount = item.inPantry ? 0 : Math.round(item.cost * 0.22);
    const bulkPrice = item.inPantry ? 0 : Math.max(0, item.cost - bulkDiscount);

    item.bulkPrice = bulkPrice;
    if (!item.inPantry) {
      totalEstimatedBulkStoreCost += bulkPrice;
    }

    categories[cat].push({
      ...item,
      amountFormatted: `${Number(item.amount.toFixed(1))} ${item.unit}`
    });
  }

  const potentialWeeklySavings = Math.max(0, totalEstimatedDailyLooseCost - totalEstimatedBulkStoreCost);

  return {
    days,
    categories,
    totals: {
      dailyLoosePurchaseWeeklyCost: totalEstimatedDailyLooseCost,
      bulkWeeklyGroceryCost: totalEstimatedBulkStoreCost,
      estimatedSavings: potentialWeeklySavings,
      savingsPercent: totalEstimatedDailyLooseCost > 0 ? Math.round((potentialWeeklySavings / totalEstimatedDailyLooseCost) * 100) : 0
    },
    itemCount: ingredientMap.size
  };
}

module.exports = {
  generateGroceryList,
  getPantryStaples: () => pantryStaples
};
