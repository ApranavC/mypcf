import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Dashboard from './components/Dashboard';
import MealEntry from './components/MealEntry';
import FoodItems from './components/FoodItems';
import Targets from './components/Targets';
import ExcelUpload from './components/ExcelUpload';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

const AppContent = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, logout } = useAuth();

  // Listen for navigation events
  useEffect(() => {
    const handleNavigate = (event) => {
      setActiveTab(event.detail);
    };
    window.addEventListener('navigateToTab', handleNavigate);
    return () => window.removeEventListener('navigateToTab', handleNavigate);
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div>
            <h1>PCF & Calorie Tracker</h1>
            <p className="subtitle">Track your daily nutrition intake with precision</p>
          </div>
          <div className="user-actions">
            <p style={{ marginBottom: '5px', fontSize: '0.9rem' }}>Welcome, {user?.name}</p>
            <button 
              onClick={logout}
              className="btn btn-secondary btn-small"
              style={{ fontSize: '0.85rem' }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <nav className="nav-tabs">
        <button 
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={activeTab === 'meal' ? 'active' : ''}
          onClick={() => setActiveTab('meal')}
        >
          Add Meal
        </button>
        <button 
          className={activeTab === 'foods' ? 'active' : ''}
          onClick={() => setActiveTab('foods')}
        >
          Food Items
        </button>
        <button 
          className={activeTab === 'upload' ? 'active' : ''}
          onClick={() => setActiveTab('upload')}
        >
          Upload Excel
        </button>
        <button 
          className={activeTab === 'targets' ? 'active' : ''}
          onClick={() => setActiveTab('targets')}
        >
          Targets
        </button>
      </nav>

      <main className="app-main">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'meal' && <MealEntry />}
        {activeTab === 'foods' && <FoodItems />}
        {activeTab === 'upload' && <ExcelUpload />}
        {activeTab === 'targets' && <Targets />}
      </main>

      <footer className="app-footer">
        <p>Built with React • Track your nutrition journey</p>
      </footer>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppContent />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
