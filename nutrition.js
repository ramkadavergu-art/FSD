/**
 * Nutrition & Macro Requirement Calculator
 * Implements Mifflin-St Jeor BMR formula tailored for Indian college students
 */

function calculateMacros(profile) {
  const {
    gender = 'male',
    age = 20,
    weightKg = 65,
    heightCm = 172,
    activityLevel = 'moderate', // 'sedentary', 'light', 'moderate', 'active', 'very_active'
    fitnessGoal = 'muscle_gain', // 'weight_loss', 'muscle_gain', 'maintenance'
    dailyBudgetCents = 120
  } = profile;

  // 1. Calculate Basal Metabolic Rate (BMR)
  let bmr;
  if (gender === 'female') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  }

  // 2. Activity Multiplier
  const activityMultipliers = {
    sedentary: 1.2,       // Studying, little walking
    light: 1.375,        // Walking between classes, light walking
    moderate: 1.55,      // Gym 3-4 days/week or active campus lifestyle
    active: 1.725,       // Intense sports / heavy gym
    very_active: 1.9     // Daily athletes
  };

  const multiplier = activityMultipliers[activityLevel] || 1.55;
  const tdee = Math.round(bmr * multiplier);

  // 3. Goal Adjustment
  let targetCalories;
  let proteinRatio; // grams per kg
  let fatPercent;

  switch (fitnessGoal) {
    case 'weight_loss':
      targetCalories = Math.max(1500, Math.round(tdee - 450));
      proteinRatio = 1.8; // High protein to preserve muscle in deficit
      fatPercent = 0.25;
      break;

    case 'muscle_gain':
      // Targeted around 2,100 - 2,200 kcal for the standard Indian student demo profile
      targetCalories = Math.max(2100, Math.round(tdee + 250));
      proteinRatio = 1.85; // ~1.8 - 2.0g/kg bodyweight
      fatPercent = 0.22;
      break;

    case 'maintenance':
    default:
      targetCalories = Math.round(tdee);
      proteinRatio = 1.4;
      fatPercent = 0.25;
      break;
  }

  // 4. Macro Grams Calculation
  let proteinGrams = Math.round(weightKg * proteinRatio);
  // Ensure minimum RDA
  if (fitnessGoal === 'muscle_gain' && proteinGrams < 90) proteinGrams = 95;
  if (proteinGrams < 60) proteinGrams = 60;

  const proteinCalories = proteinGrams * 4;
  const fatCalories = targetCalories * fatPercent;
  const fatGrams = Math.round(fatCalories / 9);

  const carbCalories = Math.max(0, targetCalories - (proteinCalories + fatCalories));
  const carbGrams = Math.round(carbCalories / 4);

  return {
    bmr: Math.round(bmr),
    tdee,
    targetCalories,
    macros: {
      protein: { grams: proteinGrams, calories: proteinCalories, percentage: Math.round((proteinCalories / targetCalories) * 100) },
      carbs: { grams: carbGrams, calories: carbCalories, percentage: Math.round((carbCalories / targetCalories) * 100) },
      fats: { grams: fatGrams, calories: Math.round(fatCalories), percentage: Math.round((fatCalories / targetCalories) * 100) }
    },
    dailyBudget: Number(dailyBudgetCents),
    fitnessGoal,
    fiberTargetGrams: 30
  };
}

module.exports = {
  calculateMacros
};
