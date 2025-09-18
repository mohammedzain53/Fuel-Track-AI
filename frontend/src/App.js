import React, { useState, useEffect } from 'react';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import FuelForm from './components/FuelForm';
import FuelList from './components/FuelList';
import Chatbot from './components/Chatbot';
import StationSearch from './components/StationSearch';
import Profile from './components/Profile';
import Settings from './components/Settings';
import HelpSupport from './components/HelpSupport';
import About from './components/About';

function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshList, setRefreshList] = useState(0);
  const [darkMode, setDarkMode] = useState(false);

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

    // Check for dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    document.body.classList.toggle('dark-mode', savedDarkMode);

    // Keyboard shortcuts
    const handleKeyPress = (e) => {
      if (e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'a':
            e.preventDefault();
            setActiveTab('add-fuel');
            break;
          case 'b':
            e.preventDefault();
            setActiveTab('chatbot');
            break;
          case 'd':
            e.preventDefault();
            setActiveTab('dashboard');
            break;
          case 'h':
            e.preventDefault();
            setActiveTab('fuel-list');
            break;
          default:
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);

    // Ensure Bootstrap dropdowns work properly
    const handleDropdownClick = (e) => {
      // Close other dropdowns when clicking outside
      if (!e.target.closest('.dropdown')) {
        const dropdowns = document.querySelectorAll('.dropdown-menu.show');
        dropdowns.forEach(dropdown => {
          dropdown.classList.remove('show');
        });
      }
    };

    document.addEventListener('click', handleDropdownClick);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.removeEventListener('click', handleDropdownClick);
    };
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

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    document.body.classList.toggle('dark-mode', newDarkMode);
  };

  if (!user) {
    return <AuthForm onLogin={handleLogin} />;
  }

  return (
    <>
      {/* Enhanced Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
        <div className="container">
          <span className="navbar-brand d-flex align-items-center">
            <span className="me-2">⛽</span>
            Fuel Track AI
          </span>
          
          <button 
            className="navbar-toggler" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <button 
                  className={`nav-link btn btn-link ${activeTab === 'dashboard' ? 'active' : ''}`}
                  onClick={() => setActiveTab('dashboard')}
                >
                  📊 Dashboard
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link btn btn-link ${activeTab === 'add-fuel' ? 'active' : ''}`}
                  onClick={() => setActiveTab('add-fuel')}
                >
                  ⛽ Add Fuel
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link btn btn-link ${activeTab === 'fuel-list' ? 'active' : ''}`}
                  onClick={() => setActiveTab('fuel-list')}
                >
                  📋 History
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link btn btn-link ${activeTab === 'chatbot' ? 'active' : ''}`}
                  onClick={() => setActiveTab('chatbot')}
                >
                  🤖 AI Assistant
                </button>
              </li>
            </ul>
            
            <div className="navbar-nav">
              {/* Dark Mode Toggle */}
              <div className="nav-item me-3">
                <button 
                  className="btn btn-outline-light btn-sm"
                  onClick={toggleDarkMode}
                  title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {darkMode ? '☀️' : '🌙'}
                </button>
              </div>
              
              <div className="nav-item dropdown">
                <button 
                  className="nav-link dropdown-toggle btn btn-link d-flex align-items-center" 
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  id="userDropdown"
                >
                  <div className="user-avatar me-2">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  {user.name}
                </button>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                  <li><h6 className="dropdown-header">Account</h6></li>
                  <li><button className="dropdown-item" onClick={() => setActiveTab('profile')}>👤 Profile</button></li>
                  <li><button className="dropdown-item" onClick={() => setActiveTab('settings')}>⚙️ Settings</button></li>
                  <li><hr className="dropdown-divider"/></li>
                  <li><h6 className="dropdown-header">Quick Actions</h6></li>
                  <li><button className="dropdown-item" onClick={() => setActiveTab('add-fuel')}>⚡ Quick Add Fuel <kbd>Alt+A</kbd></button></li>
                  <li><button className="dropdown-item" onClick={() => setActiveTab('chatbot')}>💬 Ask AI <kbd>Alt+B</kbd></button></li>
                  <li><button className="dropdown-item" onClick={() => setActiveTab('dashboard')}>📊 Dashboard <kbd>Alt+D</kbd></button></li>
                  <li><hr className="dropdown-divider"/></li>
                  <li><h6 className="dropdown-header">Help</h6></li>
                  <li><button className="dropdown-item" onClick={() => setActiveTab('help')}>❓ Help & Support</button></li>
                  <li><button className="dropdown-item" onClick={() => setActiveTab('about')}>ℹ️ About</button></li>
                  <li><hr className="dropdown-divider"/></li>
                  <li><button className="dropdown-item text-danger" onClick={handleLogout}>🚪 Logout</button></li>
                </ul>
              </div>
            </div>
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
            
            {activeTab === 'profile' && <Profile user={user} onLogout={handleLogout} onUpdateProfile={(updatedData) => setUser({...user, ...updatedData})} />}
            
            {activeTab === 'settings' && <Settings user={user} />}
            
            {activeTab === 'help' && <HelpSupport />}
            
            {activeTab === 'about' && <About />}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
