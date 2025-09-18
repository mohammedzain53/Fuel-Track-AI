// frontend/src/components/Profile.js
import React, { useState, useEffect } from 'react';
import { getSummary } from '../services/api';
import ChangePasswordModal from './ChangePasswordModal';

export default function Profile({ user, onLogout, onUpdateProfile }) {
  const [stats, setStats] = useState({
    totalEntries: 0,
    totalSpent: 0,
    totalLiters: 0,
    avgPrice: 0,
    joinDate: null
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user.name,
    email: user.email
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    loadUserStats();
    const joinDate = new Date(user.createdAt || Date.now());
    setStats(prev => ({
      ...prev,
      joinDate: joinDate.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    }));
  }, [user]);

  const loadUserStats = async () => {
    try {
      const summary = await getSummary();
      if (summary && !summary.error) {
        setStats(prev => ({
          ...prev,
          totalEntries: summary.totalEntries || 0,
          totalSpent: summary.totalCost || 0,
          totalLiters: summary.totalLiters || 0,
          avgPrice: summary.avgPrice || 0
        }));
      }
    } catch (err) {
      console.error('Failed to load user stats:', err);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // TODO: Implement profile update API call
      // const response = await updateProfile(editForm);
      
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      
      // Call parent update function if provided
      if (onUpdateProfile) {
        onUpdateProfile(editForm);
      }
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      onLogout();
    }
  };

  const handleDeleteAccount = () => {
    const confirmation = window.prompt(
      'This action cannot be undone. All your data will be permanently deleted.\n\nType "DELETE" to confirm:'
    );
    
    if (confirmation === 'DELETE') {
      if (window.confirm('Are you absolutely sure? This will permanently delete your account and all data.')) {
        // TODO: Implement delete account API call
        alert('Account deletion feature will be implemented soon. Please contact support for now.');
      }
    }
  };

  const handleExportData = async () => {
    try {
      // TODO: Implement data export
      const data = {
        user: user,
        stats: stats,
        exportDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fuel-track-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setSuccess('Data exported successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to export data');
    }
  };

  return (
    <div className="row">
      <div className="col-md-4">
        <div className="card profile-card">
          <div className="card-body text-center">
            <div className="position-relative d-inline-block mb-3">
              <div className="user-avatar mx-auto" style={{width: '100px', height: '100px', fontSize: '2.5rem'}}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="position-absolute bottom-0 end-0">
                <span className="badge bg-success rounded-pill">
                  <i className="fas fa-check"></i> Active
                </span>
              </div>
            </div>
            
            {!isEditing ? (
              <>
                <h4 className="mb-1">{user.name}</h4>
                <p className="text-muted mb-3">{user.email}</p>
                <button 
                  className="btn btn-outline-primary btn-sm mb-3"
                  onClick={() => setIsEditing(true)}
                >
                  ✏️ Edit Profile
                </button>
              </>
            ) : (
              <form onSubmit={handleEditSubmit} className="mb-3">
                {error && <div className="alert alert-danger alert-sm">{error}</div>}
                {success && <div className="alert alert-success alert-sm">{success}</div>}
                
                <div className="mb-2">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    placeholder="Full Name"
                    required
                  />
                </div>
                <div className="mb-3">
                  <input
                    type="email"
                    className="form-control form-control-sm"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    placeholder="Email Address"
                    required
                  />
                </div>
                <div className="d-flex gap-2 justify-content-center">
                  <button 
                    type="submit" 
                    className="btn btn-success btn-sm"
                    disabled={loading}
                  >
                    {loading ? '💾 Saving...' : '💾 Save'}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => {
                      setIsEditing(false);
                      setEditForm({name: user.name, email: user.email});
                      setError('');
                      setSuccess('');
                    }}
                  >
                    ❌ Cancel
                  </button>
                </div>
              </form>
            )}
            
            <div className="mt-3 pt-3 border-top">
              <small className="text-muted">Member since</small>
              <div className="fw-bold text-primary">{stats.joinDate}</div>
            </div>
            
            <div className="mt-3 d-grid gap-2">
              <button 
                className="btn btn-outline-warning btn-sm"
                onClick={() => setShowPasswordModal(true)}
              >
                🔐 Change Password
              </button>
              <button 
                className="btn btn-outline-danger btn-sm"
                onClick={handleLogout}
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="col-md-8">
        {/* Stats Card */}
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="mb-0">📊 Your Fuel Tracking Stats</h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-6 col-md-3 text-center mb-3">
                <div className="stat-card">
                  <div className="h3 text-primary mb-1">{stats.totalEntries}</div>
                  <small className="text-muted">Total Entries</small>
                </div>
              </div>
              <div className="col-6 col-md-3 text-center mb-3">
                <div className="stat-card">
                  <div className="h3 text-success mb-1">₹{stats.totalSpent.toFixed(0)}</div>
                  <small className="text-muted">Total Spent</small>
                </div>
              </div>
              <div className="col-6 col-md-3 text-center mb-3">
                <div className="stat-card">
                  <div className="h3 text-info mb-1">{stats.totalLiters.toFixed(1)}L</div>
                  <small className="text-muted">Total Fuel</small>
                </div>
              </div>
              <div className="col-6 col-md-3 text-center mb-3">
                <div className="stat-card">
                  <div className="h3 text-warning mb-1">₹{stats.avgPrice.toFixed(2)}</div>
                  <small className="text-muted">Avg Price/L</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Management Card */}
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="mb-0">👤 Account Management</h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <h6 className="text-primary mb-3">🔐 Security & Account</h6>
                <div className="d-grid gap-2">
                  <button 
                    className="btn btn-outline-primary"
                    onClick={() => setShowPasswordModal(true)}
                  >
                    🔑 Change Password
                  </button>
                  <button 
                    className="btn btn-outline-danger"
                    onClick={handleDeleteAccount}
                  >
                    🗑️ Delete Account
                  </button>
                </div>
              </div>
              <div className="col-md-6">
                <h6 className="text-success mb-3">📊 Data Management</h6>
                <div className="d-grid gap-2">
                  <button 
                    className="btn btn-outline-success"
                    onClick={handleExportData}
                  >
                    📤 Export All Data
                  </button>
                  <div className="alert alert-info alert-sm mt-2">
                    <small>
                      <strong>💡 Coming Soon:</strong><br/>
                      • Two-factor authentication<br/>
                      • Privacy settings<br/>
                      • Automatic data backup
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements & Activity Card */}
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">🏆 Achievements & Activity</h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <h6 className="mb-3">🏅 Badges Earned</h6>
                <div className="d-flex flex-wrap gap-2 mb-3">
                  {stats.totalEntries > 0 && (
                    <span className="badge bg-primary p-2">🚗 First Entry</span>
                  )}
                  {stats.totalEntries >= 10 && (
                    <span className="badge bg-success p-2">💯 10+ Entries</span>
                  )}
                  {stats.totalEntries >= 50 && (
                    <span className="badge bg-warning p-2">⭐ Power User</span>
                  )}
                  {stats.totalSpent >= 10000 && (
                    <span className="badge bg-info p-2">💰 Big Spender</span>
                  )}
                  <span className="badge bg-secondary p-2">📅 Regular User</span>
                </div>
              </div>
              <div className="col-md-6">
                <h6 className="mb-3">📈 Fuel Insights</h6>
                <div className="activity-feed">
                  {stats.totalEntries > 0 ? (
                    <>
                      <div className="activity-item">
                        <span className="activity-icon">⛽</span>
                        <span className="activity-text">
                          Average per fill-up: ₹{(stats.totalSpent / stats.totalEntries).toFixed(0)}
                        </span>
                      </div>
                      <div className="activity-item">
                        <span className="activity-icon">📊</span>
                        <span className="activity-text">
                          Fuel per entry: {(stats.totalLiters / stats.totalEntries).toFixed(1)}L avg
                        </span>
                      </div>
                      <div className="activity-item">
                        <span className="activity-icon">💰</span>
                        <span className="activity-text">
                          {stats.avgPrice > 100 ? 'Premium fuel user' : 'Budget-conscious driver'}
                        </span>
                      </div>
                      {stats.totalEntries >= 5 && (
                        <div className="activity-item">
                          <span className="activity-icon">🎯</span>
                          <span className="activity-text">
                            Consistent tracking - {stats.totalEntries} entries logged
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="activity-item">
                      <span className="activity-icon">🚀</span>
                      <span className="activity-text">
                        Start adding fuel entries to see insights here!
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Change Password Modal */}
      <ChangePasswordModal
        show={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSuccess={(message) => {
          setSuccess(message);
          setTimeout(() => setSuccess(''), 3000);
        }}
      />
      
      {/* Success/Error Messages */}
      {(success || error) && (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1050 }}>
          <div className={`alert ${success ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`}>
            {success || error}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => {
                setSuccess('');
                setError('');
              }}
            ></button>
          </div>
        </div>
      )}
    </div>
  );
}