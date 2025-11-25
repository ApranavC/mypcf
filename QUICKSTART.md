# Quick Start Guide

## First Time Setup

1. **Install dependencies:**
   ```bash
   npm install
   cd client
   npm install
   cd ..
   ```

2. **Set up MongoDB:**
   
   You need a MongoDB database. Choose one option:
   
   **Option A: MongoDB Atlas (Free Cloud - Recommended)**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free account
   - Create a free cluster (M0 Sandbox)
   - Create database user (Database Access → Add New User)
   - Whitelist IP (Network Access → Add IP Address → Allow from anywhere for dev)
   - Get connection string (Database → Connect → Connect your application)
   - Copy the connection string

   **Option B: Local MongoDB**
   - Install MongoDB locally
   - Start MongoDB service
   - Use connection string: `mongodb://localhost:27017/pcf-calculator`

3. **Create .env file:**
   ```bash
   # Create .env file in the root directory
   touch .env
   ```
   
   Add to `.env`:
   ```env
   MONGODB_URI=your-mongodb-connection-string-here
   JWT_SECRET=your-random-secret-key-here
   PORT=5000
   NODE_ENV=development
   ```
   
   Replace `your-mongodb-connection-string-here` with your MongoDB connection string.
   Replace `your-random-secret-key-here` with a random string (or use: `openssl rand -base64 32`)

4. **Start the development server:**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend API server on `http://localhost:5000`
   - Frontend React app on `http://localhost:5173` (or another port)

5. **Open your browser:**
   Navigate to `http://localhost:5173` (or the port shown in terminal)

## Troubleshooting

- **MongoDB Connection Error**: Make sure MongoDB is running (local) or your Atlas connection string is correct
- **Server crashes on startup**: Check your `.env` file has the correct `MONGODB_URI`
- **API errors**: Ensure the backend server is running on port 5000

## Getting Started with the App

### Step 1: Upload Your Excel File
1. Go to the **"Upload Excel"** tab
2. Click the upload area and select your Excel file
3. Make sure your Excel file has columns: Dish, Protein, Carbs, Fats, Calories
4. Click "Upload File"

### Step 2: Set Your Targets
1. Go to the **"Targets"** tab
2. Select your diet type:
   - **Maintenance**: Maintain current weight
   - **Calorie Deficit**: Lose weight (consume fewer calories)
   - **Calorie Surplus**: Gain weight (consume more calories)
3. Set your daily targets for:
   - Calories
   - Protein (grams)
   - Carbs (grams)
   - Fats (grams)
4. Click "Save Targets"

### Step 3: Add Your Meals
1. Go to the **"Add Meal"** tab
2. Select the date
3. Choose meal type (Breakfast, Lunch, Dinner, Snack, Other)
4. Click "+ Add Dish" to add food items
5. Select a food item and specify the quantity (servings)
6. Add multiple dishes as needed
7. Review the meal summary
8. Click "Add Meal"

### Step 4: Track Your Progress
1. Go to the **"Dashboard"** tab
2. Select the date you want to view
3. See your progress with:
   - Progress bars for each macro
   - Visual charts showing intake vs targets
   - List of all meals for the day

## Tips

- You can manually add food items in the **"Food Items"** tab
- The dashboard shows color-coded progress:
  - Green: On track
  - Yellow: Close to target
  - Red: Over/under target
- For calorie deficit diets, being under your calorie target is good
- For calorie surplus diets, being over your calorie target is good

## Production Deployment

1. **Build the React app:**
   ```bash
   npm run build
   ```

2. **Start the production server:**
   ```bash
   npm start
   ```

The app will be available on `http://localhost:5000`

## Troubleshooting

- **Excel upload fails**: Make sure your file has the correct column names (case-insensitive)
- **Food items not showing**: Check that you've uploaded the Excel file or added items manually
- **Meals not saving**: Make sure the backend server is running on port 5000
- **Charts not displaying**: Check browser console for errors

