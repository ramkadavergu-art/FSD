const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const { calculateMacros } = require('./services/nutrition');
const { optimizeMealPlan, getMealAlternatives, getAllRecipes } = require('./services/optimizer');
const { generateGroceryList, getPantryStaples } = require('./services/grocery');
const { standardMessPresets, analyzeMessMeal } = require('./services/messAdvisor');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Path to community hacks data file
const communityHacksPath = path.join(__dirname, 'data', 'communityHacks.json');
let communityHacks = [];
try {
  communityHacks = JSON.parse(fs.readFileSync(communityHacksPath, 'utf8'));
} catch (e) {
  communityHacks = [];
}

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'PlatePilot NutriNinja Budget Diet Planner',
    version: '1.0.0',
    totalRecipes: getAllRecipes().length
  });
});

// 2. Recipes catalog with filters
app.get('/api/recipes', (req, res) => {
  const { mealType, diet, maxCost, search } = req.query;
  let list = getAllRecipes();

  if (mealType) {
    list = list.filter(r => r.mealType.toLowerCase() === mealType.toLowerCase());
  }
  if (diet && diet !== 'all') {
    list = list.filter(r => {
      if (diet === 'vegan') return r.diet === 'vegan';
      if (diet === 'vegetarian') return r.diet === 'vegetarian' || r.diet === 'vegan';
      if (diet === 'eggetarian') return r.diet === 'eggetarian' || r.diet === 'vegetarian' || r.diet === 'vegan';
      return true;
    });
  }
  if (maxCost) {
    list = list.filter(r => r.cost <= parseFloat(maxCost));
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(r =>
      r.name.toLowerCase().includes(q) ||
      (r.tags && r.tags.some(t => t.toLowerCase().includes(q))) ||
      (r.ingredients && r.ingredients.some(i => i.name.toLowerCase().includes(q)))
    );
  }

  res.json({ count: list.length, recipes: list });
});

// 3. Macro & calorie calculation endpoint
app.post('/api/profile', (req, res) => {
  try {
    const profile = req.body;
    const nutrition = calculateMacros(profile);
    res.json({ success: true, profile: nutrition });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 4. Budget-constrained meal plan generator
app.post('/api/optimize', (req, res) => {
  try {
    const {
      dailyBudget = 120,
      fitnessGoal = 'muscle_gain',
      dietPreference = 'eggetarian',
      targetCalories = 2100,
      priceMultiplier = 1.0,
      pantryItems = []
    } = req.body;

    const plan = optimizeMealPlan({
      dailyBudget: Number(dailyBudget),
      fitnessGoal,
      dietPreference,
      targetCalories: Number(targetCalories),
      priceMultiplier: Number(priceMultiplier),
      pantryItems
    });

    res.json({ success: true, plan });
  } catch (err) {
    console.error('Optimization error:', err);
    res.status(400).json({ success: false, error: err.message });
  }
});

// 5. Meal swap alternative engine
app.post('/api/swap', (req, res) => {
  try {
    const {
      currentPlan,
      slotToSwap,
      dietPreference,
      dailyBudget = 120,
      priceMultiplier = 1.0,
      pantryItems = []
    } = req.body;

    const result = getMealAlternatives(
      currentPlan,
      slotToSwap,
      dietPreference,
      Number(dailyBudget),
      Number(priceMultiplier),
      pantryItems
    );

    res.json({ success: true, ...result });
  } catch (err) {
    console.error('Swap error:', err);
    res.status(400).json({ success: false, error: err.message });
  }
});

// 6. Smart grocery shopping list generator
app.post('/api/grocery-list', (req, res) => {
  try {
    const { plan, days = 7, pantryItems = [] } = req.body;
    const groceryList = generateGroceryList(plan, Number(days), pantryItems);
    res.json({ success: true, groceryList });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 7. Pantry staples
app.get('/api/pantry-staples', (req, res) => {
  res.json({ success: true, staples: getPantryStaples() });
});

// 8. Hostel mess presets and gap analyzer
app.get('/api/mess-presets', (req, res) => {
  res.json({ success: true, presets: standardMessPresets });
});

app.post('/api/mess-advisor', (req, res) => {
  try {
    const { presetId, targetProtein } = req.body;
    const analysis = analyzeMessMeal(presetId, targetProtein ? Number(targetProtein) : 30);
    res.json({ success: true, analysis });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 9. Community Recipe Hacks
app.get('/api/community-hacks', (req, res) => {
  res.json({ success: true, hacks: communityHacks });
});

app.post('/api/community-hacks', (req, res) => {
  try {
    const { title, author, dorm, cost, calories, protein, appliance, prepMinutes, description, tags } = req.body;
    if (!title || !cost || !description) {
      return res.status(400).json({ success: false, error: 'Title, cost, and description are required.' });
    }

    const newHack = {
      id: `hack-${Date.now()}`,
      title,
      author: author || 'Hostel Student',
      dorm: dorm || 'Campus Dorm',
      cost: Number(cost),
      calories: Number(calories) || 300,
      protein: Number(protein) || 15,
      appliance: appliance || 'Electric Kettle / Single Pan',
      prepMinutes: Number(prepMinutes) || 5,
      upvotes: 1,
      description,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : ['#HostelHack', '#BudgetMeal'])
    };

    communityHacks.unshift(newHack);
    fs.writeFileSync(communityHacksPath, JSON.stringify(communityHacks, null, 2), 'utf8');

    res.json({ success: true, hack: newHack });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/community-hacks/:id/upvote', (req, res) => {
  const { id } = req.params;
  const hack = communityHacks.find(h => h.id === id);
  if (!hack) {
    return res.status(404).json({ success: false, error: 'Hack not found.' });
  }
  hack.upvotes = (hack.upvotes || 0) + 1;
  fs.writeFileSync(communityHacksPath, JSON.stringify(communityHacks, null, 2), 'utf8');
  res.json({ success: true, upvotes: hack.upvotes });
});

// Fallback to index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`PlatePilot Server running at http://localhost:${PORT}`);
});
