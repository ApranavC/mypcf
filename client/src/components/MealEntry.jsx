import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const MealEntry = () => {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [mealType, setMealType] = useState('Breakfast');
  const [foodItems, setFoodItems] = useState([]);
  const [selectedDishes, setSelectedDishes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [showNewFoodForm, setShowNewFoodForm] = useState(false);
  const [newFood, setNewFood] = useState({
    name: '',
    protein: '',
    carbs: '',
    fats: '',
    calories: ''
  });
  const [addingFood, setAddingFood] = useState(false);

  useEffect(() => {
    fetchFoodItems();
  }, []);

  const fetchFoodItems = async () => {
    try {
      const response = await axios.get(`${API_URL}/food-items`);
      setFoodItems(response.data);
    } catch (error) {
      console.error('Error fetching food items:', error);
      setMessage({ type: 'error', text: 'Failed to load food items' });
    }
  };

  const addDish = () => {
    setSelectedDishes([...selectedDishes, { foodId: '', quantityInGrams: 100 }]);
  };

  const removeDish = (index) => {
    setSelectedDishes(selectedDishes.filter((_, i) => i !== index));
  };

  const updateDish = (index, field, value) => {
    const updated = [...selectedDishes];
    updated[index][field] = value;
    setSelectedDishes(updated);
  };

  const getDishDetails = (foodId, quantityInGrams) => {
    const food = foodItems.find(f => f._id === foodId || f.id === foodId);
    if (!food) return null;
    
    // Calculate based on quantity in grams (food values are per 100g)
    const multiplier = quantityInGrams / 100;
    
    return {
      name: food.name,
      protein: (food.protein * multiplier),
      carbs: (food.carbs * multiplier),
      fats: (food.fats * multiplier),
      calories: (food.calories * multiplier),
      quantity: quantityInGrams
    };
  };

  const handleAddFood = async (e) => {
    e.preventDefault();
    if (!newFood.name.trim()) {
      setMessage({ type: 'error', text: 'Food name is required' });
      return;
    }
    setAddingFood(true);
    setMessage(null);
    try {
      const response = await axios.post(`${API_URL}/food-items`, newFood);
      setFoodItems((items) => [response.data, ...items]);
      setShowNewFoodForm(false);
      setNewFood({
        name: '',
        protein: '',
        carbs: '',
        fats: '',
        calories: ''
      });
      setMessage({ type: 'success', text: 'Food item created. You can select it now.' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error adding food:', error);
      setMessage({ type: 'error', text: 'Failed to add food item' });
    } finally {
      setAddingFood(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const dishes = selectedDishes
      .map(dish => getDishDetails(dish.foodId, dish.quantityInGrams || 100))
      .filter(dish => dish !== null);

    if (dishes.length === 0) {
      setMessage({ type: 'error', text: 'Please add at least one dish' });
      setLoading(false);
      return;
    }

    try {
      await axios.post(`${API_URL}/daily-intakes`, {
        date,
        mealType,
        dishes
      });
      setMessage({ type: 'success', text: 'Meal added successfully!' });
      setSelectedDishes([]);
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error adding meal:', error);
      setMessage({ type: 'error', text: 'Failed to add meal' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="card">
        <h2>Add Meal Entry</h2>
        {message && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Meal Type</label>
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
              required
            >
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
              <option value="Snack">Snack</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Dishes</label>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-secondary btn-small"
                onClick={() => setShowNewFoodForm(!showNewFoodForm)}
              >
                {showNewFoodForm ? 'Close New Food Form' : "Can't find food? Add new"}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={addDish}
                style={{ marginTop: '10px' }}
              >
                + Add Dish
              </button>
            </div>

            {showNewFoodForm && (
              <form onSubmit={handleAddFood} style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                <h4 style={{ marginBottom: '10px' }}>Add New Food Item</h4>
                <div className="form-group">
                  <label>Food Name</label>
                  <input
                    type="text"
                    value={newFood.name}
                    onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
                    required
                    placeholder="e.g., Paneer Bhurji"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
                  {['protein', 'carbs', 'fats', 'calories'].map((field) => (
                    <div className="form-group" key={field}>
                      <label>{field.charAt(0).toUpperCase() + field.slice(1)} (per 100g)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={newFood[field]}
                        onChange={(e) => setNewFood({ ...newFood, [field]: e.target.value })}
                        required
                      />
                    </div>
                  ))}
                </div>
                <button type="submit" className="btn btn-primary" disabled={addingFood}>
                  {addingFood ? 'Adding...' : 'Save Food'}
                </button>
              </form>
            )}

            {selectedDishes.map((dish, index) => (
              <div key={index} style={{ 
                display: 'flex', 
                gap: '10px', 
                marginBottom: '10px',
                alignItems: 'center'
              }}>
                <select
                  value={dish.foodId}
                  onChange={(e) => updateDish(index, 'foodId', e.target.value)}
                  required
                  style={{ flex: 2 }}
                >
                  <option value="">Select a food item</option>
                  {foodItems.map(food => (
                    <option key={food._id || food.id} value={food._id || food.id}>
                      {food.name} (per 100g: P: {food.protein}g, C: {food.carbs}g, F: {food.fats}g, Cal: {food.calories})
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={dish.quantityInGrams || 100}
                  onChange={(e) => updateDish(index, 'quantityInGrams', parseFloat(e.target.value) || 0)}
                  placeholder="Grams"
                  required
                  style={{ flex: 1, maxWidth: '120px' }}
                />
                <span style={{ fontSize: '0.9rem', color: '#666', minWidth: '50px' }}>grams</span>
                <button
                  type="button"
                  className="btn btn-danger btn-small"
                  onClick={() => removeDish(index)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {selectedDishes.length > 0 && (() => {
            const totals = selectedDishes
              .map(dish => getDishDetails(dish.foodId, dish.quantityInGrams || 100))
              .filter(dish => dish !== null)
              .reduce((acc, dish) => ({
                protein: acc.protein + dish.protein,
                carbs: acc.carbs + dish.carbs,
                fats: acc.fats + dish.fats,
                calories: acc.calories + dish.calories
              }), { protein: 0, carbs: 0, fats: 0, calories: 0 });
            
            const dishDetails = selectedDishes
              .map(dish => getDishDetails(dish.foodId, dish.quantityInGrams || 100))
              .filter(dish => dish !== null);
            
            return (
              <div style={{ 
                background: '#f8f9fa', 
                padding: '15px', 
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <h4>Meal Summary</h4>
                {dishDetails.map((dish, idx) => (
                  <p key={idx} style={{ fontSize: '0.9rem', marginBottom: '5px' }}>
                    <strong>{dish.name}:</strong> {dish.quantity}g → 
                    P: {dish.protein.toFixed(1)}g, C: {dish.carbs.toFixed(1)}g, 
                    F: {dish.fats.toFixed(1)}g, {dish.calories.toFixed(0)} cal
                  </p>
                ))}
                <hr style={{ margin: '10px 0', border: 'none', borderTop: '1px solid #ddd' }} />
                <p><strong>Total Calories:</strong> {totals.calories.toFixed(0)} cal</p>
                <p><strong>Total Protein:</strong> {totals.protein.toFixed(1)} g</p>
                <p><strong>Total Carbs:</strong> {totals.carbs.toFixed(1)} g</p>
                <p><strong>Total Fats:</strong> {totals.fats.toFixed(1)} g</p>
              </div>
            );
          })()}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || selectedDishes.length === 0}
          >
            {loading ? 'Adding...' : 'Add Meal'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MealEntry;

