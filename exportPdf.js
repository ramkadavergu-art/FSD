/**
 * PlatePilot Refrigerator Cheat Sheet Exporter
 * Generates formatted printable 7-day meal plan refrigerator sheet
 */

function setupPrintExporter() {
  const printBtn = document.getElementById('print-cheat-sheet-btn');
  if (!printBtn) return;

  printBtn.addEventListener('click', () => {
    generatePrintSheet();
    window.print();
  });
}

function generatePrintSheet() {
  const printContent = document.getElementById('print-content');
  if (!printContent) return;

  const currentPlan = window.currentMealPlan;
  if (!currentPlan || !currentPlan.meals) {
    alert('Please generate a meal plan first!');
    return;
  }

  const { meals, totals, budget } = currentPlan;

  let html = `
    <div style="margin: 15px 0; border: 1px solid #10b981; padding: 12px; border-radius: 8px; background: #ecfdf5;">
      <h3 style="margin: 0 0 6px 0; color: #065f46;">Daily Macro & Financial Budget Summary</h3>
      <p style="margin: 0; font-size: 14px;">
        <strong>Daily Budget:</strong> ₹${budget} | 
        <strong>Daily Cost:</strong> ₹${totals.cost} | 
        <strong>Calories:</strong> ${totals.calories} kcal | 
        <strong>Protein:</strong> ${totals.protein}g | 
        <strong>Carbs:</strong> ${totals.carbs}g | 
        <strong>Fats:</strong> ${totals.fats}g | 
        <strong>Fiber:</strong> ${totals.fiber}g
      </p>
    </div>

    <h3 style="margin-top: 20px; border-bottom: 2px solid #333; padding-bottom: 4px;">Daily Meal Schedule & Itemized Costs</h3>
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 10px;">
  `;

  const slots = [
    { key: 'breakfast', title: '🍳 Breakfast' },
    { key: 'lunch', title: '🍛 Lunch' },
    { key: 'snack', title: '☕ Evening Snack' },
    { key: 'dinner', title: '🍲 Dinner' }
  ];

  slots.forEach(slot => {
    const meal = meals[slot.key];
    if (!meal) return;
    html += `
      <div style="border: 1px solid #ddd; padding: 12px; border-radius: 6px;">
        <h4 style="margin: 0 0 4px 0;">${slot.title}: ${meal.name} (₹${meal.effectiveCost || meal.cost})</h4>
        <p style="margin: 0 0 8px 0; font-size: 12px; color: #555;">
          ${meal.calories} kcal | ${meal.protein}g Protein | ${meal.carbs}g Carbs | ${meal.fats}g Fat | Prep: ${meal.prepTime} mins (${meal.cookingMethod})
        </p>
        <div style="font-size: 11px; margin-bottom: 6px;">
          <strong>Ingredients:</strong> ${meal.ingredients.map(i => `${i.name} (${i.amount} ${i.unit} - ₹${i.cost})`).join(', ')}
        </div>
        <div style="font-size: 11px; color: #333;">
          <strong>Hostel Cooking Steps:</strong>
          <ol style="margin: 4px 0 0 16px; padding: 0;">
            ${meal.instructions.map(step => `<li>${step}</li>`).join('')}
          </ol>
        </div>
      </div>
    `;
  });

  html += `
    </div>

    <h3 style="margin-top: 25px; border-bottom: 2px solid #333; padding-bottom: 4px;">Weekly Supermarket / Mandi Bulk Grocery Cheat Sheet</h3>
    <p style="font-size: 12px; color: #666; margin: 4px 0 12px 0;">
      Buy these items in bulk at local supermarket/mandi once a week to save ~20-25% over loose canteen purchases.
    </p>
  `;

  if (window.currentGroceryList && window.currentGroceryList.categories) {
    html += `<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; font-size: 11px;">`;
    for (const [catName, items] of Object.entries(window.currentGroceryList.categories)) {
      html += `
        <div style="border: 1px solid #eee; padding: 8px; border-radius: 4px; background: #fafafa;">
          <h5 style="margin: 0 0 6px 0; font-size: 12px; color: #10b981;">${catName}</h5>
          <ul style="margin: 0; padding-left: 14px;">
            ${items.map(it => `<li>${it.name}: ${it.amountFormatted} (₹${it.bulkPrice})</li>`).join('')}
          </ul>
        </div>
      `;
    }
    html += `</div>`;
  }

  html += `
    <div style="margin-top: 20px; text-align: center; font-size: 11px; color: #777; border-top: 1px solid #ccc; padding-top: 8px;">
      PlatePilot NutriNinja Cup • College Student Budget Meal System • Printed: ${new Date().toLocaleDateString()}
    </div>
  `;

  printContent.innerHTML = html;
}

window.addEventListener('DOMContentLoaded', setupPrintExporter);
