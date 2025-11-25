const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  protein: {
    type: Number,
    required: true,
    default: 0,
  },
  carbs: {
    type: Number,
    required: true,
    default: 0,
  },
  fats: {
    type: Number,
    required: true,
    default: 0,
  },
  calories: {
    type: Number,
    required: true,
    default: 0,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('FoodItem', foodItemSchema);


