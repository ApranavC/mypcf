# PCF & Calorie Tracker

A modern web application for tracking your daily nutrition intake, including Protein, Carbs, Fats (PCF), and Calories. Perfect for monitoring your diet goals whether you're aiming for weight loss, maintenance, or weight gain.

## Features

- 🔐 **User Authentication**: Secure login/signup with JWT tokens
- 👥 **Multi-User Support**: Each user has their own data and targets
- 📊 **Dashboard**: Visualize your daily nutrition intake with progress bars and charts
- ➕ **Meal Entry**: Add meals with multiple dishes and specify quantity in grams
- 🍎 **Food Database**: Manage your food items with PCF and calorie information (per 100g)
- 📤 **Excel Import**: Upload Excel files to bulk import food items
- 🎯 **Target Setting**: Set daily targets for calories and macros based on your diet goals
- 📈 **Progress Tracking**: Monitor your progress with visual indicators
- 🎨 **Modern UI**: Beautiful, responsive design perfect for sharing on LinkedIn
- 💾 **Persistent Storage**: Data saved in MongoDB - your data persists across sessions

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account (free) or local MongoDB installation

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd PCF_calculator
```

2. Install dependencies:
```bash
npm install
cd client
npm install
cd ..
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your MongoDB connection string:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pcf-calculator
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5000
```

**Getting MongoDB Atlas (Free):**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new cluster (free tier available)
4. Create a database user
5. Whitelist your IP address (or use 0.0.0.0/0 for development)
6. Get your connection string and add it to `.env`

4. Start the development server:
```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend development server on `http://localhost:5173` (or another port)

5. Open your browser:
Navigate to `http://localhost:5173` (or the port shown in terminal)

## Excel File Format

Your Excel file should have the following columns (case-insensitive). **All values must be per 100 grams:**

| Column Name | Description | Example |
|------------|-------------|---------|
| Dish / Food / Name | Name of the food item | Chicken Breast |
| Protein / P | Protein in grams (per 100g) | 31 |
| Carbs / C | Carbohydrates in grams (per 100g) | 0 |
| Fats / F | Fats in grams (per 100g) | 3.6 |
| Calories / Cal | Total calories (per 100g) | 165 |

## Usage

### First Time Setup

1. **Sign Up**: Create a new account with your name, email, and password
2. **Upload Excel File**: Go to the "Upload Excel" tab and upload your food database
3. **Set Targets**: Navigate to "Targets" and set your daily nutrition goals
4. **Start Tracking**: Add meals and track your progress!

### Adding Meals

1. Go to the **"Add Meal"** tab
2. Select the date
3. Choose meal type (Breakfast, Lunch, Dinner, Snack, Other)
4. Click "+ Add Dish" to add food items
5. Select a food item and specify the quantity in **grams** (e.g., 150g, 200g)
6. The app automatically calculates the exact PCF and calories based on the quantity
7. Add multiple dishes as needed
8. Review the meal summary
9. Click "Add Meal"

### How Quantity Calculation Works

- All food items in the database store values **per 100 grams**
- When you add a meal, you specify the quantity in grams
- The app calculates: `Actual Value = (Quantity in grams / 100) × Value per 100g`
- Example: If chicken breast has 31g protein per 100g, and you eat 150g:
  - Protein = (150/100) × 31 = 46.5g protein

## Diet Types

- **Maintenance**: Maintain your current weight
- **Calorie Deficit**: Lose weight by consuming fewer calories (being under target is good)
- **Calorie Surplus**: Gain weight by consuming more calories (being over target is good)

## Tech Stack

- **Frontend**: React, Vite, React Router, Recharts, Axios
- **Backend**: Node.js, Express
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT tokens
- **File Upload**: Multer for Excel file processing

## Project Structure

```
PCF_calculator/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # Auth context
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # Entry point
│   └── package.json
├── server/                 # Express backend
│   ├── config/            # Database configuration
│   ├── models/            # MongoDB models
│   ├── middleware/        # Auth middleware
│   ├── index.js           # Server entry point
│   └── uploads/           # Temporary Excel uploads
└── package.json
```

## Production Deployment

1. **Build the React app:**
   ```bash
   npm run build
   ```

2. **Set environment variables** on your hosting platform

3. **Start the production server:**
   ```bash
   npm start
   ```

## License

MIT

## Author

Built with ❤️ for tracking your nutrition journey
