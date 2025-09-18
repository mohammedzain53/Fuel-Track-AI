import React, { useState, useEffect } from 'react';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import FuelForm from './components/FuelForm';
import FuelList from './components/FuelList';
import Chatbot from './components/Chatbot';
import StationSearch from './components/StationSearch';

function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshList, setRefreshList] = useState(0);

  useEffect(() => {
    // Check for existing token
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token with backend
      fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          localStorage.removeItem('token');
        } else {
          setUser(data);
        }
      })
      .catch(() => localStorage.removeItem('token'));
    }
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setActiveTab('dashboard');
  };

  const handleEntrySaved = () => {
    setRefreshList(prev => prev + 1);
  };

  const [selectedStation, setSelectedStation] = useState(null);

  const handleStationSelect = (station) => {
    setSelectedStation(station);
    setActiveTab('add-fuel');
  };

  if (!user) {
    return <AuthForm onLogin={handleLogin} />;
  }

  return (
    <>
      {/* Navbar */}
      <nav className="navbar navbar-dark bg-dark">
        <div className="container">
          <span className="navbar-brand">Fuel Track AI</span>
          <div className="navbar-nav ms-auto">
            <span className="navbar-text me-3">Welcome, {user.name}!</span>
            <button className="btn btn-outline-light" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container">
        <div className="main-container fade-in-up">
          <nav>
            <div className="nav nav-tabs" id="nav-tab" role="tablist">
              <button 
                className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
                type="button"
              >
                Dashboard
              </button>
              <button 
                className={`nav-link ${activeTab === 'add-fuel' ? 'active' : ''}`}
                onClick={() => setActiveTab('add-fuel')}
                type="button"
              >
                Add Fuel Entry
              </button>
              <button 
                className={`nav-link ${activeTab === 'fuel-list' ? 'active' : ''}`}
                onClick={() => setActiveTab('fuel-list')}
                type="button"
              >
                Fuel History
              </button>
              <button 
                className={`nav-link ${activeTab === 'chatbot' ? 'active' : ''}`}
                onClick={() => setActiveTab('chatbot')}
                type="button"
              >
                AI Assistant
              </button>
            </div>
          </nav>
          
          <div className="tab-content mt-3">
            {activeTab === 'dashboard' && <Dashboard refresh={refreshList} />}
            
            {activeTab === 'add-fuel' && (
              <div className="row">
                <div className="col-md-6">
                  <FuelForm onSaved={handleEntrySaved} selectedStation={selectedStation} />
                </div>
                <div className="col-md-6">
                  <StationSearch onStationSelect={handleStationSelect} />
                </div>
              </div>
            )}
            
            {activeTab === 'fuel-list' && <FuelList refresh={refreshList} />}
            
            {activeTab === 'chatbot' && <Chatbot />}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
