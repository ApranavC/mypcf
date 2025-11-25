import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { format, parseISO, subDays, isWithinInterval } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');

const EMPTY_TOTALS = { protein: 0, carbs: 0, fats: 0, calories: 0 };

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [intake, setIntake] = useState(null);
  const [targets, setTargets] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [allIntakes, setAllIntakes] = useState([]);
  const [timeRange, setTimeRange] = useState('day');

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  useEffect(() => {
    fetchHistory();
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

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API_URL}/daily-intakes`);
      setAllIntakes(response.data || []);
    } catch (error) {
      console.error('Error fetching intake history:', error);
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
      fetchHistory();
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

  const rangeData = useMemo(() => {
    if (timeRange === 'day') {
      return { totals: intake?.totals || { ...EMPTY_TOTALS }, days: 1, trend: [] };
    }
    if (!allIntakes.length) {
      return { totals: { ...EMPTY_TOTALS }, days: 0, trend: [] };
    }

    const end = parseISO(selectedDate);
    let start;
    if (timeRange === 'week') {
      start = subDays(end, 6);
    } else if (timeRange === 'month') {
      start = subDays(end, 29);
    }

    let filtered = allIntakes;
    if (timeRange === 'week' || timeRange === 'month') {
      filtered = allIntakes.filter((entry) => {
        const entryDate = parseISO(entry.date);
        return isWithinInterval(entryDate, { start, end });
      });
    }

    if (!filtered.length) {
      return { totals: { ...EMPTY_TOTALS }, days: 0, trend: [] };
    }

    const totals = filtered.reduce(
      (acc, entry) => ({
        protein: acc.protein + (entry.totals?.protein || 0),
        carbs: acc.carbs + (entry.totals?.carbs || 0),
        fats: acc.fats + (entry.totals?.fats || 0),
        calories: acc.calories + (entry.totals?.calories || 0),
      }),
      { ...EMPTY_TOTALS }
    );

    const trend = filtered
      .slice()
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((entry) => ({
        date: format(parseISO(entry.date), 'MMM dd'),
        calories: entry.totals?.calories || 0,
        protein: entry.totals?.protein || 0,
        carbs: entry.totals?.carbs || 0,
        fats: entry.totals?.fats || 0,
      }));

    return { totals, days: filtered.length, trend };
  }, [timeRange, allIntakes, intake, selectedDate]);

  if (loading) {
    return <div className="empty-state">Loading...</div>;
  }

  const displayTotals = timeRange === 'day' ? (intake?.totals || { ...EMPTY_TOTALS }) : rangeData.totals;
  const targetValues = targets || { protein: 150, carbs: 200, fats: 65, calories: 2000 };
  const rangeLabel = {
    day: 'Daily Overview',
    week: 'Last 7 Days',
    month: 'Last 30 Days',
    all: 'All-Time Overview'
  }[timeRange];

  const averages =
    rangeData.days > 0
      ? {
          calories: (rangeData.totals.calories / rangeData.days).toFixed(0),
          protein: (rangeData.totals.protein / rangeData.days).toFixed(1),
          carbs: (rangeData.totals.carbs / rangeData.days).toFixed(1),
          fats: (rangeData.totals.fats / rangeData.days).toFixed(1),
        }
      : { calories: 0, protein: 0, carbs: 0, fats: 0 };

  const macroData = [
    { name: 'Protein', current: displayTotals.protein, target: targetValues.protein },
    { name: 'Carbs', current: displayTotals.carbs, target: targetValues.carbs },
    { name: 'Fats', current: displayTotals.fats, target: targetValues.fats },
  ];

  const pieData = [
    { name: 'Protein', value: displayTotals.protein, color: '#2563eb' },
    { name: 'Carbs', value: displayTotals.carbs, color: '#1e40af' },
    { name: 'Fats', value: displayTotals.fats, color: '#3b82f6' },
  ];

  return (
    <div>

      <div className="card">
        <h2>{rangeLabel}</h2>
        <div className="form-group">
          <label>Select Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
        <div className="range-controls">
          {['day', 'week', 'month', 'all'].map((range) => (
            <button
              key={range}
              type="button"
              className={timeRange === range ? 'active' : ''}
              onClick={() => setTimeRange(range)}
            >
              {range === 'day' ? 'Daily' : range === 'week' ? 'Weekly' : range === 'month' ? 'Monthly' : 'All Time'}
            </button>
          ))}
        </div>
        <p className="range-hint">
          Weekly and monthly views use the selected date as the end of the range.
        </p>
        {message && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Calories</h3>
          <div className="value">{displayTotals.calories.toFixed(0)}</div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${calculateProgress(displayTotals.calories, targetValues.calories)}%`,
                background: getStatusColor(displayTotals.calories, targetValues.calories, targets?.dietType)
              }}
            >
              {targetValues.calories > 0 && `${((displayTotals.calories / targetValues.calories) * 100).toFixed(0)}%`}
            </div>
          </div>
          <p style={{ marginTop: '10px', fontSize: '0.9rem' }}>
            Target: {targetValues.calories} cal
          </p>
        </div>

        <div className="stat-card">
          <h3>Protein (g)</h3>
          <div className="value">{displayTotals.protein.toFixed(1)}</div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${calculateProgress(displayTotals.protein, targetValues.protein)}%`
              }}
            >
              {targetValues.protein > 0 && `${((displayTotals.protein / targetValues.protein) * 100).toFixed(0)}%`}
            </div>
          </div>
          <p style={{ marginTop: '10px', fontSize: '0.9rem' }}>
            Target: {targetValues.protein} g
          </p>
        </div>

        <div className="stat-card">
          <h3>Carbs (g)</h3>
          <div className="value">{displayTotals.carbs.toFixed(1)}</div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${calculateProgress(displayTotals.carbs, targetValues.carbs)}%`
              }}
            >
              {targetValues.carbs > 0 && `${((displayTotals.carbs / targetValues.carbs) * 100).toFixed(0)}%`}
            </div>
          </div>
          <p style={{ marginTop: '10px', fontSize: '0.9rem' }}>
            Target: {targetValues.carbs} g
          </p>
        </div>

        <div className="stat-card">
          <h3>Fats (g)</h3>
          <div className="value">{displayTotals.fats.toFixed(1)}</div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${calculateProgress(displayTotals.fats, targetValues.fats)}%`
              }}
            >
              {targetValues.fats > 0 && `${((displayTotals.fats / targetValues.fats) * 100).toFixed(0)}%`}
            </div>
          </div>
          <p style={{ marginTop: '10px', fontSize: '0.9rem' }}>
            Target: {targetValues.fats} g
          </p>
        </div>
      </div>

      {timeRange !== 'day' && (
        <div className="card">
          <h3>{rangeLabel} Summary</h3>
          <p style={{ color: '#475569', marginBottom: '12px' }}>
            Tracking {rangeData.days} day{rangeData.days === 1 ? '' : 's'} in this window.
          </p>
          <div className="range-summary">
            <div>
              <span>Total Calories</span>
              <strong>{rangeData.totals.calories.toFixed(0)} cal</strong>
            </div>
            <div>
              <span>Avg Calories / day</span>
              <strong>{averages.calories} cal</strong>
            </div>
            <div>
              <span>Avg Protein / day</span>
              <strong>{averages.protein} g</strong>
            </div>
            <div>
              <span>Avg Carbs / day</span>
              <strong>{averages.carbs} g</strong>
            </div>
            <div>
              <span>Avg Fats / day</span>
              <strong>{averages.fats} g</strong>
            </div>
          </div>
          {rangeData.trend.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={rangeData.trend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="calories" stroke="#2563eb" name="Calories" />
                  <Line type="monotone" dataKey="protein" stroke="#16a34a" name="Protein" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

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

      {timeRange === 'day' && intake?.meals && intake.meals.length > 0 && (
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

      {timeRange === 'day' && (!intake?.meals || intake.meals.length === 0) && (
        <div className="empty-state">
          <h3>No meals recorded for this date</h3>
          <p>Add a meal to start tracking your nutrition!</p>
        </div>
      )}
      {timeRange !== 'day' && (
        <div className="empty-state">
          <h3>Meal details hidden</h3>
          <p>Switch back to Daily view to see individual meals.</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

