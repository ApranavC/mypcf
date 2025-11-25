const mongoose = require('mongoose');

const dishSchema = new mongoose.Schema({
  name: String,
  protein: Number,
  carbs: Number,
  fats: Number,
  calories: Number,
  quantity: Number,
}, { _id: false });

const mealSchema = new mongoose.Schema({
  type: String,
  dishes: [dishSchema],
  timestamp: Date,
}, { _id: true });

const dailyIntakeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  meals: [mealSchema],
  totals: {
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fats: { type: Number, default: 0 },
    calories: { type: Number, default: 0 },
  },
}, {
  timestamps: true,
});

// Compound index to ensure one intake per user per date
dailyIntakeSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyIntake', dailyIntakeSchema);

