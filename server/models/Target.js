const mongoose = require('mongoose');

const targetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  protein: {
    type: Number,
    default: 150,
  },
  carbs: {
    type: Number,
    default: 200,
  },
  fats: {
    type: Number,
    default: 65,
  },
  calories: {
    type: Number,
    default: 2000,
  },
  dietType: {
    type: String,
    enum: ['maintenance', 'deficit', 'surplus'],
    default: 'maintenance',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Target', targetSchema);


