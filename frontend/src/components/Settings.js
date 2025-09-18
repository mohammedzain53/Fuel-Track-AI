// frontend/src/components/Settings.js
import React, { useState } from 'react';

export default function Settings({ user }) {
  const [settings, setSettings] = useState(() => {
    // Load settings from localStorage if available
    const saved = localStorage.getItem('fuelTrackSettings');
    return saved ? JSON.parse(saved) : {
      currency: 'INR',
      units: 'metric',
      defaultFuelType: 'petrol'
    };
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = () => {
    // Save settings to localStorage for now
    localStorage.setItem('fuelTrackSettings', JSON.stringify(settings));
    alert('Settings saved successfully! These preferences will be remembered.');
  };

  return (
    <div className="row">
      <div className="col-md-8 mx-auto">
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">⚙️ Application Settings</h5>
          </div>
          <div className="card-body">
            
            {/* General Settings */}
            <div className="mb-4">
              <h6 className="text-primary mb-3">🔧 General</h6>
              
              <div className="row mb-3">
                <div className="col-sm-6">
                  <label className="form-label">Currency</label>
                  <select 
                    className="form-select"
                    value={settings.currency}
                    onChange={(e) => handleSettingChange('currency', e.target.value)}
                  >
                    <option value="INR">₹ Indian Rupee (INR)</option>
                    <option value="USD">$ US Dollar (USD)</option>
                    <option value="EUR">€ Euro (EUR)</option>
                  </select>
                </div>
                <div className="col-sm-6">
                  <label className="form-label">Units</label>
                  <select 
                    className="form-select"
                    value={settings.units}
                    onChange={(e) => handleSettingChange('units', e.target.value)}
                  >
                    <option value="metric">Metric (Liters, KM)</option>
                    <option value="imperial">Imperial (Gallons, Miles)</option>
                  </select>
                </div>
              </div>
              
              <div className="mb-3">
                <label className="form-label">Default Fuel Type</label>
                <select 
                  className="form-select"
                  value={settings.defaultFuelType}
                  onChange={(e) => handleSettingChange('defaultFuelType', e.target.value)}
                >
                  <option value="petrol">⛽ Petrol</option>
                  <option value="diesel">🚛 Diesel</option>
                  <option value="cng">🌿 CNG</option>
                  <option value="electric">⚡ Electric</option>
                </select>
              </div>
            </div>

            {/* Account Information */}
            <div className="mb-4">
              <h6 className="text-info mb-3">👤 Account Information</h6>
              
              <div className="alert alert-info">
                <div className="row">
                  <div className="col-md-6">
                    <strong>📧 Email:</strong> {user.email}
                  </div>
                  <div className="col-md-6">
                    <strong>📅 Member Since:</strong> {new Date(user.createdAt || Date.now()).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long', 
                      year: 'numeric'
                    })}
                  </div>
                </div>
              </div>
              
              <div className="alert alert-warning">
                <h6 className="mb-2">💡 Need More Settings?</h6>
                <small>
                  Advanced features like notifications, data backup, and account management 
                  are available in the <strong>Profile</strong> section. Use the navigation 
                  menu to access your profile for more options.
                </small>
              </div>
            </div>

            {/* Save Button */}
            <div className="text-center">
              <button className="btn btn-success btn-lg" onClick={saveSettings}>
                💾 Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}