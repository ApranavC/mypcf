import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const FoodItems = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    protein: '',
    carbs: '',
    fats: '',
    calories: ''
  });
  const [message, setMessage] = useState(null);

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
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await axios.post(`${API_URL}/food-items`, formData);
      setMessage({ type: 'success', text: 'Food item added successfully!' });
      setFormData({ name: '', protein: '', carbs: '', fats: '', calories: '' });
      setShowForm(false);
      fetchFoodItems();
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error adding food item:', error);
      setMessage({ type: 'error', text: 'Failed to add food item' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this food item?')) {
      return;
    }
    try {
      await axios.delete(`${API_URL}/food-items/${id}`);
      setFoodItems((items) => items.filter((item) => (item._id || item.id) !== id));
    } catch (error) {
      console.error('Error deleting food item:', error);
      setMessage({ type: 'error', text: 'Failed to delete food item' });
    }
  };

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <h2>Food Items Database</h2>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? 'Cancel' : '+ Add Food Item'}
            </button>
          </div>
        </div>
        
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          background: '#e7f3ff', 
          borderRadius: '8px',
          border: '1px solid #b3d9ff'
        }}>
          <p style={{ margin: 0, fontSize: '0.95rem' }}>
            <strong>Tip:</strong> You can bulk import food items by uploading an Excel file. 
            Go to the <strong>"Upload Excel"</strong> tab in the navigation above to get started!
          </p>
        </div>

        {message && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
            <div className="form-group">
              <label>Food Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., Chicken Breast"
              />
            </div>

            <p style={{ marginBottom: '15px', fontSize: '0.9rem', color: '#666', fontStyle: 'italic' }}>
              All values should be per 100 grams
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
              <div className="form-group">
                <label>Protein (g per 100g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.protein}
                  onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                  required
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Carbs (g per 100g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.carbs}
                  onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                  required
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Fats (g per 100g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.fats}
                  onChange={(e) => setFormData({ ...formData, fats: e.target.value })}
                  required
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Calories (per 100g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.calories}
                  onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                  required
                  min="0"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add Food Item'}
            </button>
          </form>
        )}
      </div>

      {loading && foodItems.length === 0 ? (
        <div className="empty-state">Loading...</div>
      ) : foodItems.length === 0 ? (
        <div className="empty-state">
          <h3>No food items yet</h3>
          <p>Add food items manually or upload an Excel file to get started!</p>
        </div>
      ) : (
        <div className="food-grid">
          {foodItems.map((item) => (
            <div key={item._id || item.id} className="food-card">
              <h4>{item.name}</h4>
              <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '10px', fontStyle: 'italic' }}>
                Per 100 grams
              </p>
              <div className="nutrients">
                <div>
                  <strong>Protein:</strong> {item.protein}g
                </div>
                <div>
                  <strong>Carbs:</strong> {item.carbs}g
                </div>
                <div>
                  <strong>Fats:</strong> {item.fats}g
                </div>
                <div>
                  <strong>Calories:</strong> {item.calories} cal
                </div>
              </div>
              <button
                type="button"
                className="btn btn-danger btn-small"
                style={{ marginTop: '15px' }}
                onClick={() => handleDelete(item._id || item.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FoodItems;

