import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [intake, setIntake] = useState(null);
  const [targets, setTargets] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.meal-actions')) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [intakeRes, targetsRes] = await Promise.all([
        axios.get(`${API_URL}/daily-intakes/${selectedDate}`),
        axios.get(`${API_URL}/targets`)
      ]);
      setIntake(intakeRes.data);
      setTargets(targetsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (current, target) => {
    if (!target || target === 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  const getStatusColor = (current, target, dietType) => {
    if (!target) return '#2563eb';
    const percentage = (current / target) * 100;
    
    if (dietType === 'deficit') {
      return percentage < 90 ? '#28a745' : percentage < 110 ? '#ffc107' : '#dc3545';
    } else if (dietType === 'surplus') {
      return percentage > 110 ? '#28a745' : percentage > 90 ? '#ffc107' : '#dc3545';
    } else {
      return percentage > 95 && percentage < 105 ? '#28a745' : percentage > 85 && percentage < 115 ? '#ffc107' : '#dc3545';
    }
  };

  const handleDeleteMeal = async (mealId) => {
    if (!window.confirm('Delete this meal?')) {
      setOpenMenu(null);
      return;
    }
    try {
      setDeleting(true);
      setMessage(null);
      const response = await axios.delete(`${API_URL}/daily-intakes/${selectedDate}/${mealId}`);
      setIntake(response.data);
      setMessage({ type: 'success', text: 'Meal deleted' });
      setTimeout(() => setMessage(null), 2500);
    } catch (error) {
      console.error('Error deleting meal:', error);
      setMessage({ type: 'error', text: 'Failed to delete meal' });
    } finally {
      setDeleting(false);
      setOpenMenu(null);
    }
  };

  if (loading) {
    return <div className="empty-state">Loading...</div>;
  }

  const totals = intake?.totals || { protein: 0, carbs: 0, fats: 0, calories: 0 };
  const targetValues = targets || { protein: 150, carbs: 200, fats: 65, calories: 2000 };

  const macroData = [
    { name: 'Protein', current: totals.protein, target: targetValues.protein },
    { name: 'Carbs', current: totals.carbs, target: targetValues.carbs },
    { name: 'Fats', current: totals.fats, target: targetValues.fats },
  ];

  const pieData = [
    { name: 'Protein', value: totals.protein, color: '#2563eb' },
    { name: 'Carbs', value: totals.carbs, color: '#1e40af' },
    { name: 'Fats', value: totals.fats, color: '#3b82f6' },
  ];

  return (
    <div>

      <div className="card">
        <h2>Daily Nutrition Dashboard</h2>
        <div className="form-group">
          <label>Select Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
        {message && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Calories</h3>
          <div className="value">{totals.calories.toFixed(0)}</div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${calculateProgress(totals.calories, targetValues.calories)}%`,
                background: getStatusColor(totals.calories, targetValues.calories, targets?.dietType)
              }}
            >
              {targetValues.calories > 0 && `${((totals.calories / targetValues.calories) * 100).toFixed(0)}%`}
            </div>
          </div>
          <p style={{ marginTop: '10px', fontSize: '0.9rem' }}>
            Target: {targetValues.calories} cal
          </p>
        </div>

        <div className="stat-card">
          <h3>Protein (g)</h3>
          <div className="value">{totals.protein.toFixed(1)}</div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${calculateProgress(totals.protein, targetValues.protein)}%`
              }}
            >
              {targetValues.protein > 0 && `${((totals.protein / targetValues.protein) * 100).toFixed(0)}%`}
            </div>
          </div>
          <p style={{ marginTop: '10px', fontSize: '0.9rem' }}>
            Target: {targetValues.protein} g
          </p>
        </div>

        <div className="stat-card">
          <h3>Carbs (g)</h3>
          <div className="value">{totals.carbs.toFixed(1)}</div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${calculateProgress(totals.carbs, targetValues.carbs)}%`
              }}
            >
              {targetValues.carbs > 0 && `${((totals.carbs / targetValues.carbs) * 100).toFixed(0)}%`}
            </div>
          </div>
          <p style={{ marginTop: '10px', fontSize: '0.9rem' }}>
            Target: {targetValues.carbs} g
          </p>
        </div>

        <div className="stat-card">
          <h3>Fats (g)</h3>
          <div className="value">{totals.fats.toFixed(1)}</div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${calculateProgress(totals.fats, targetValues.fats)}%`
              }}
            >
              {targetValues.fats > 0 && `${((totals.fats / targetValues.fats) * 100).toFixed(0)}%`}
            </div>
          </div>
          <p style={{ marginTop: '10px', fontSize: '0.9rem' }}>
            Target: {targetValues.fats} g
          </p>
        </div>
      </div>

      <div className="card">
        <h3>Macronutrient Breakdown</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={macroData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="current" fill="#2563eb" name="Current" />
            <Bar dataKey="target" fill="#1e40af" name="Target" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h3>Macronutrient Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {intake?.meals && intake.meals.length > 0 && (
        <div className="card">
          <h3>Meals for {format(new Date(selectedDate), 'MMMM dd, yyyy')}</h3>
          <div className="meal-list">
            {intake.meals.map((meal) => (
              <div key={meal._id || meal.id} className="meal-item">
                <div className="meal-header">
                  <h4>{meal.type}</h4>
                  <div className="meal-actions">
                    <button
                      type="button"
                      className="btn btn-tertiary btn-small"
                      onClick={() =>
                        setOpenMenu(
                          openMenu === (meal._id || meal.id) ? null : (meal._id || meal.id)
                        )
                      }
                      aria-label="Meal actions"
                    >
                      ⋮
                    </button>
                    {openMenu === (meal._id || meal.id) && (
                      <div className="meal-menu">
                        <button
                          type="button"
                          className="meal-menu-item danger"
                          onClick={() => handleDeleteMeal(meal._id || meal.id)}
                          disabled={deleting}
                        >
                          Delete meal
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {meal.dishes.map((dish, idx) => (
                  <div key={idx} className="dish-item">
                    <span>{dish.name} ({dish.quantity || 0}g)</span>
                    <span>
                      {dish.calories?.toFixed(0)} cal • P: {dish.protein?.toFixed(1)}g • C: {dish.carbs?.toFixed(1)}g • F: {dish.fats?.toFixed(1)}g
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {(!intake?.meals || intake.meals.length === 0) && (
        <div className="empty-state">
          <h3>No meals recorded for this date</h3>
          <p>Add a meal to start tracking your nutrition!</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

