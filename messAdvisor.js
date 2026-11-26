/**
 * Hostel Mess Gap Analyzer & Cheap Outside Supplement Engine
 */

const standardMessPresets = [
  {
    id: "mess-lunch-std",
    name: "Typical Hostel Mess Lunch",
    mealType: "lunch",
    description: "Watery yellow toor dal, steamed white rice, aloo-gobi/cabbage sabzi, 2 dry rotis, papad/pickle",
    estimatedNutrition: { calories: 640, protein: 14, carbs: 112, fats: 14, fiber: 7 },
    critic: "High refined carbohydrate load with acute protein deficiency (only 14g vs ideal 32g). Will cause post-lunch lethargy.",
    messPicks: [
      "Ask mess staff to scoop dal from the bottom of the container where lentils settle.",
      "Limit rice to 1 katori and take 1 extra dry roti.",
      "Skip deep-fried papad and excess oily sabzi gravy."
    ],
    recommendedSupplements: [
      {
        name: "2 Boiled Eggs from Campus Tapri",
        cost: 14,
        proteinBonus: 13,
        calorieBonus: 140,
        prep: "Zero prep. Buy outside hostel gate.",
        category: "eggetarian"
      },
      {
        name: "Amul / Mother Dairy Masti Curd (150g cup)",
        cost: 10,
        proteinBonus: 7,
        calorieBonus: 95,
        prep: "Pick up from campus canteen cooler.",
        category: "vegetarian"
      },
      {
        name: "Kettle Boiled Soya Chunks (30g) mixed into Mess Rice",
        cost: 8,
        proteinBonus: 16,
        calorieBonus: 105,
        prep: "Soak 30g soya chunks in kettle for 3 mins, take in tiffin and mix directly into mess dal rice.",
        category: "vegan"
      },
      {
        name: "Pocket Roasted Chana (40g)",
        cost: 8,
        proteinBonus: 9,
        calorieBonus: 150,
        prep: "Eat alongside meal for crunch and fiber.",
        category: "vegan"
      }
    ]
  },
  {
    id: "mess-dinner-std",
    name: "Typical Hostel Mess Dinner",
    mealType: "dinner",
    description: "Thin mixed dal, lauki/tinda sabzi, 3 rotis, plain white rice",
    estimatedNutrition: { calories: 510, protein: 13, carbs: 90, fats: 10, fiber: 8 },
    critic: "Under-caloric for recovery, deficient in quality essential amino acids.",
    messPicks: [
      "Prioritize rotis over rice at night for steady glycemic release.",
      "Take curd or buttermilk if offered in special dinner."
    ],
    recommendedSupplements: [
      {
        name: "Fresh Paneer Slice (50g raw from dairy booth)",
        cost: 16,
        proteinBonus: 11,
        calorieBonus: 145,
        prep: "Slice and sprinkle chat masala, eat with mess rotis.",
        category: "vegetarian"
      },
      {
        name: "Double Boiled Eggs with Pepper",
        cost: 14,
        proteinBonus: 13,
        calorieBonus: 140,
        prep: "Night canteen staple.",
        category: "eggetarian"
      },
      {
        name: "Curd (100g) + 20g Roasted Peanuts",
        cost: 12,
        proteinBonus: 10,
        calorieBonus: 180,
        prep: "Mix peanuts into curd for protein & magnesium for better sleep.",
        category: "vegetarian"
      }
    ]
  },
  {
    id: "mess-breakfast-std",
    name: "Typical Hostel Mess Breakfast",
    mealType: "breakfast",
    description: "Sweet Poha / Oily Poori Aloo / Bread Jam with sugary Chai",
    estimatedNutrition: { calories: 480, protein: 7, carbs: 85, fats: 15, fiber: 3 },
    critic: "Zero sustained protein; rapid insulin spike causing brain fog in 10 AM lectures.",
    messPicks: [
      "Take plain toast/bread without artificial sugary mixed fruit jam.",
      "Dunk black tea or drink plain warm water."
    ],
    recommendedSupplements: [
      {
        name: "2 Whole Boiled Eggs",
        cost: 14,
        proteinBonus: 13,
        calorieBonus: 140,
        prep: "Keep in dorm or buy from breakfast cart.",
        category: "eggetarian"
      },
      {
        name: "Dorm Sattu Water Shaker (40g)",
        cost: 8,
        proteinBonus: 14,
        calorieBonus: 145,
        prep: "Quick shake in dorm before walking to lecture hall.",
        category: "vegan"
      },
      {
        name: "Peanut Butter (1 tbsp) on Mess Toast",
        cost: 7,
        proteinBonus: 5,
        calorieBonus: 95,
        prep: "Carry peanut butter jar to mess dining table.",
        category: "vegan"
      }
    ]
  }
];

function analyzeMessMeal(presetId = 'mess-lunch-std', targetProteinPerMeal = 30) {
  const preset = standardMessPresets.find(p => p.id === presetId) || standardMessPresets[0];
  const proteinShortfall = Math.max(0, targetProteinPerMeal - preset.estimatedNutrition.protein);

  return {
    preset,
    proteinShortfall,
    targetProteinPerMeal,
    estimatedNutrition: preset.estimatedNutrition,
    supplements: preset.recommendedSupplements
  };
}

module.exports = {
  standardMessPresets,
  analyzeMessMeal
};
