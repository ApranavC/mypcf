import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = '/api';

const Targets = () => {
  const [targets, setTargets] = useState({
    protein: '150',
    carbs: '200',
    fats: '65',
    calories: '2000',
    dietType: 'maintenance'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchTargets();
  }, []);

  const formatValue = (value) => {
    if (value === null || value === undefined) return '';
    return value.toString();
  };

  const fetchTargets = async () => {
    try {
      const response = await axios.get(`${API_URL}/targets`);
      const data = response.data || {};
      setTargets({
        protein: formatValue(data.protein),
        carbs: formatValue(data.carbs),
        fats: formatValue(data.fats),
        calories: formatValue(data.calories),
        dietType: data.dietType || 'maintenance'
      });
    } catch (error) {
      console.error('Error fetching targets:', error);
      setMessage({ type: 'error', text: 'Failed to load targets' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTargets({
      ...targets,
      [name]: name === 'dietType' ? value : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const payload = {
        dietType: targets.dietType,
        calories: parseFloat(targets.calories) || 0,
        protein: parseFloat(targets.protein) || 0,
        carbs: parseFloat(targets.carbs) || 0,
        fats: parseFloat(targets.fats) || 0,
      };
      await axios.put(`${API_URL}/targets`, payload);
      setTargets({
        protein: formatValue(payload.protein),
        carbs: formatValue(payload.carbs),
        fats: formatValue(payload.fats),
        calories: formatValue(payload.calories),
        dietType: payload.dietType
      });
      setMessage({ type: 'success', text: 'Targets updated successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error updating targets:', error);
      setMessage({ type: 'error', text: 'Failed to update targets' });
    } finally {
      setSaving(false);
    }
  };

  const getDietTypeDescription = (type) => {
    switch (type) {
      case 'deficit':
        return 'Calorie Deficit: Aim to consume fewer calories than your maintenance level to lose weight.';
      case 'surplus':
        return 'Calorie Surplus: Aim to consume more calories than your maintenance level to gain weight.';
      default:
        return 'Maintenance: Aim to maintain your current weight by consuming calories equal to your maintenance level.';
    }
  };

  if (loading) {
    return <div className="empty-state">Loading...</div>;
  }

  return (
    <div>
      <div className="card">
        <h2>Set Your Targets</h2>
        <p style={{ marginBottom: '20px', color: '#666' }}>
          Set your daily nutrition targets based on your goals. The app will track your progress
          and help you stay on track with your diet plan.
        </p>

        {message && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Diet Type</label>
            <select
              name="dietType"
              value={targets.dietType}
              onChange={handleChange}
            >
              <option value="maintenance">Maintenance</option>
              <option value="deficit">Calorie Deficit (Weight Loss)</option>
              <option value="surplus">Calorie Surplus (Weight Gain)</option>
            </select>
            <p style={{ marginTop: '8px', fontSize: '0.9rem', color: '#666' }}>
              {getDietTypeDescription(targets.dietType)}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            <div className="form-group">
              <label>Daily Calorie Target</label>
              <input
                type="number"
                name="calories"
                value={targets.calories}
                onChange={handleChange}
                required
                min="0"
                step="10"
              />
              <p style={{ marginTop: '5px', fontSize: '0.85rem', color: '#666' }}>
                Total calories per day
              </p>
            </div>

            <div className="form-group">
              <label>Daily Protein Target (g)</label>
              <input
                type="number"
                name="protein"
                value={targets.protein}
                onChange={handleChange}
                required
                min="0"
                step="1"
              />
              <p style={{ marginTop: '5px', fontSize: '0.85rem', color: '#666' }}>
                Recommended: 0.8-1g per lb of body weight
              </p>
            </div>

            <div className="form-group">
              <label>Daily Carbs Target (g)</label>
              <input
                type="number"
                name="carbs"
                value={targets.carbs}
                onChange={handleChange}
                required
                min="0"
                step="1"
              />
              <p style={{ marginTop: '5px', fontSize: '0.85rem', color: '#666' }}>
                Adjust based on activity level
              </p>
            </div>

            <div className="form-group">
              <label>Daily Fats Target (g)</label>
              <input
                type="number"
                name="fats"
                value={targets.fats}
                onChange={handleChange}
                required
                min="0"
                step="1"
              />
              <p style={{ marginTop: '5px', fontSize: '0.85rem', color: '#666' }}>
                Recommended: 20-35% of total calories
              </p>
            </div>
          </div>

          <div style={{ 
            background: '#f8f9fa', 
            padding: '15px', 
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <h4>Target Summary</h4>
            <p><strong>Calories:</strong> {targets.calories || 0} cal/day</p>
            <p><strong>Protein:</strong> {targets.protein || 0} g/day</p>
            <p><strong>Carbs:</strong> {targets.carbs || 0} g/day</p>
            <p><strong>Fats:</strong> {targets.fats || 0} g/day</p>
            <p style={{ marginTop: '10px', fontSize: '0.9rem', color: '#666' }}>
              These numbers are independent targets. Adjust them however you like for your plan.
            </p>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Targets'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Targets;

