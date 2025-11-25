require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/database');
const { protect } = require('./middleware/auth');
const User = require('./models/User');
const FoodItem = require('./models/FoodItem');
const DailyIntake = require('./models/DailyIntake');
const Target = require('./models/Target');

// Connect to database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Only serve static files in production (when dist folder exists)
const distPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

// Storage configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, 'food-data-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'));
    }
  }
});

// ==================== AUTHENTICATION ROUTES ====================

// Register user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide name, email, and password' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Create user
    const user = await User.create({ name, email, password });

    // Create default targets for user
    await Target.create({
      user: user._id,
      protein: 150,
      carbs: 200,
      fats: 65,
      calories: 2000,
      dietType: 'maintenance'
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get current user
app.get('/api/auth/me', protect, async (req, res) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email
  });
});

// ==================== FOOD ITEMS ROUTES ====================

// Get all food items for user
app.get('/api/food-items', protect, async (req, res) => {
  try {
    const foodItems = await FoodItem.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(foodItems);
  } catch (error) {
    console.error('Error fetching food items:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add a food item manually (values should be per 100g)
app.post('/api/food-items', protect, async (req, res) => {
  try {
    const { name, protein, carbs, fats, calories } = req.body;
    const foodItem = await FoodItem.create({
      user: req.user._id,
      name,
      protein: parseFloat(protein) || 0, // per 100g
      carbs: parseFloat(carbs) || 0, // per 100g
      fats: parseFloat(fats) || 0, // per 100g
      calories: parseFloat(calories) || 0 // per 100g
    });
    res.json(foodItem);
  } catch (error) {
    console.error('Error adding food item:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a food item
app.delete('/api/food-items/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await FoodItem.findOneAndDelete({ _id: id, user: req.user._id });
    if (!deleted) {
      return res.status(404).json({ error: 'Food item not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting food item:', error);
    res.status(500).json({ error: error.message });
  }
});

// Parse Excel file and extract food data
app.post('/api/upload-excel', protect, upload.single('excelFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    // Process the data - values in Excel are per 100 grams
    const foodItemsData = data.map((row) => {
      const dish = row['Dish'] || row['dish'] || row['Food'] || row['food'] || row['Name'] || row['name'] || '';
      const protein = parseFloat(row['Protein'] || row['protein'] || row['P'] || row['p'] || 0);
      const carbs = parseFloat(row['Carbs'] || row['carbs'] || row['C'] || row['c'] || 0);
      const fats = parseFloat(row['Fats'] || row['fats'] || row['F'] || row['f'] || 0);
      const calories = parseFloat(row['Calories'] || row['calories'] || row['Cal'] || row['cal'] || 0);

      // Store values as per 100g (will be used to calculate based on actual quantity)
      return {
        user: req.user._id,
        name: dish,
        protein: isNaN(protein) ? 0 : protein, // per 100g
        carbs: isNaN(carbs) ? 0 : carbs, // per 100g
        fats: isNaN(fats) ? 0 : fats, // per 100g
        calories: isNaN(calories) ? 0 : calories // per 100g
      };
    }).filter(item => item.name);

    // Save to database
    const foodItems = await FoodItem.insertMany(foodItemsData);

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({ 
      success: true, 
      message: `Successfully imported ${foodItems.length} food items`,
      items: foodItems 
    });
  } catch (error) {
    console.error('Error parsing Excel:', error);
    res.status(500).json({ error: 'Error parsing Excel file: ' + error.message });
  }
});

// ==================== DAILY INTAKES ROUTES ====================

// Get intake for a specific date
app.get('/api/daily-intakes/:date', protect, async (req, res) => {
  try {
    const date = req.params.date;
    let intake = await DailyIntake.findOne({ user: req.user._id, date });

    if (!intake) {
      intake = {
        date,
        meals: [],
        totals: { protein: 0, carbs: 0, fats: 0, calories: 0 }
      };
    }

    res.json(intake);
  } catch (error) {
    console.error('Error fetching intake:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add meal entry
app.post('/api/daily-intakes', protect, async (req, res) => {
  try {
    const { date, mealType, dishes } = req.body;
    
    let intake = await DailyIntake.findOne({ user: req.user._id, date });
    
    if (!intake) {
      intake = await DailyIntake.create({
        user: req.user._id,
        date,
        meals: [],
        totals: { protein: 0, carbs: 0, fats: 0, calories: 0 }
      });
    }

    const meal = {
      type: mealType,
      dishes: dishes,
      timestamp: new Date()
    };

    intake.meals.push(meal);

    // Recalculate totals
    intake.totals = intake.meals.reduce((acc, meal) => {
      meal.dishes.forEach(dish => {
        acc.protein += dish.protein || 0;
        acc.carbs += dish.carbs || 0;
        acc.fats += dish.fats || 0;
        acc.calories += dish.calories || 0;
      });
      return acc;
    }, { protein: 0, carbs: 0, fats: 0, calories: 0 });

    await intake.save();
    res.json(intake);
  } catch (error) {
    console.error('Error adding meal:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete meal entry
app.delete('/api/daily-intakes/:date/:mealId', protect, async (req, res) => {
  try {
    const date = req.params.date;
    const mealId = req.params.mealId;
    
    const intake = await DailyIntake.findOne({ user: req.user._id, date });
    
    if (!intake) {
      return res.status(404).json({ error: 'Intake not found' });
    }

    // Remove meal (meals are stored as plain objects, so we need to find by index or recreate)
    intake.meals = intake.meals.filter((meal, index) => {
      // Since meals don't have _id, we'll use a different approach
      // We'll need to pass the meal index or use a different identifier
      return meal._id?.toString() !== mealId && index.toString() !== mealId;
    });
    
    // Recalculate totals
    intake.totals = intake.meals.reduce((acc, meal) => {
      meal.dishes.forEach(dish => {
        acc.protein += dish.protein || 0;
        acc.carbs += dish.carbs || 0;
        acc.fats += dish.fats || 0;
        acc.calories += dish.calories || 0;
      });
      return acc;
    }, { protein: 0, carbs: 0, fats: 0, calories: 0 });

    await intake.save();
    res.json(intake);
  } catch (error) {
    console.error('Error deleting meal:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== TARGETS ROUTES ====================

// Get targets
app.get('/api/targets', protect, async (req, res) => {
  try {
    let target = await Target.findOne({ user: req.user._id });
    
    if (!target) {
      // Create default targets
      target = await Target.create({
        user: req.user._id,
        protein: 150,
        carbs: 200,
        fats: 65,
        calories: 2000,
        dietType: 'maintenance'
      });
    }
    
    res.json(target);
  } catch (error) {
    console.error('Error fetching targets:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update targets
app.put('/api/targets', protect, async (req, res) => {
  try {
    let target = await Target.findOne({ user: req.user._id });
    
    if (!target) {
      target = await Target.create({
        user: req.user._id,
        ...req.body
      });
    } else {
      target = await Target.findOneAndUpdate(
        { user: req.user._id },
        req.body,
        { new: true, runValidators: true }
      );
    }
    
    res.json(target);
  } catch (error) {
    console.error('Error updating targets:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve React app for all non-API routes (for client-side routing)
// Only in production when dist folder exists
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, '../client/dist/index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ 
      error: 'Frontend not built. In development, use the Vite dev server at http://localhost:5173' 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
