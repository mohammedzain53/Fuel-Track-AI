// frontend/src/components/Dashboard.js
import React, { useEffect, useState } from 'react';
import { getStats, getSummary } from '../services/api';

export default function Dashboard({ refresh }) {
  const [stats, setStats] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [refresh]);

  async function loadStats() {
    try {
      setLoading(true);
      console.log('Loading dashboard stats...');
      
      // Load both stats and summary
      const [statsData, summaryData] = await Promise.all([
        getStats().catch(err => {
          console.error('Stats error:', err);
          return [];
        }),
        getSummary().catch(err => {
          console.error('Summary error:', err);
          return null;
        })
      ]);
      
      console.log('Stats data received:', statsData);
      console.log('Summary data received:', summaryData);
      
      setStats(Array.isArray(statsData) ? statsData : []);
      setSummary(summaryData);
      
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setStats([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return (
    <div className="text-center">
      <div className="loading-spinner me-2"></div>
      Loading dashboard...
    </div>
  );

  // Use summary data if available, otherwise calculate from stats
  const totalSpent = summary?.totalCost || stats.reduce((sum, month) => sum + (month.totalCost || 0), 0);
  const totalLiters = summary?.totalLiters || stats.reduce((sum, month) => sum + (month.totalLiters || 0), 0);
  const avgPrice = summary?.avgPrice || (totalLiters > 0 ? totalSpent / totalLiters : 0);
  const totalEntries = summary?.totalEntries || stats.reduce((sum, month) => sum + (month.count || 0), 0);

  // Show no data message if no entries
  if (!loading && totalEntries === 0) {
    return (
      <div className="text-center py-5">
        <div className="mb-4">
          <h4>📊 Dashboard</h4>
          <div className="alert alert-info">
            <h5>🚗 Welcome to Fuel Track AI!</h5>
            <p>You haven't added any fuel entries yet. Start by:</p>
            <ol className="text-start">
              <li>Go to the "Add Fuel Entry" tab</li>
              <li>Fill in your fuel purchase details</li>
              <li>Use "Find Stations Near Me" to discover nearby pumps</li>
              <li>Save your entry to see statistics here</li>
            </ol>
            <p className="mb-0">💡 Your dashboard will show expense trends, averages, and insights once you add some data!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h4>📊 Dashboard</h4>
      
      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card dashboard-card text-center">
            <div className="card-body">
              <div className="card-title">Total Spent</div>
              <h3 className="text-primary">₹{totalSpent.toFixed(2)}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card dashboard-card text-center">
            <div className="card-body">
              <div className="card-title">Total Liters</div>
              <h3 className="text-success">{totalLiters.toFixed(2)}L</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card dashboard-card text-center">
            <div className="card-body">
              <div className="card-title">Avg Price/L</div>
              <h3 className="text-warning">₹{avgPrice.toFixed(2)}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card dashboard-card text-center">
            <div className="card-body">
              <div className="card-title">Entries</div>
              <h3 className="text-info">{totalEntries}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Breakdown */}
      {stats.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">Monthly Breakdown</h5>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Month/Year</th>
                    <th>Total Cost</th>
                    <th>Total Liters</th>
                    <th>Avg Price/L</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.map((month, index) => (
                    <tr key={index}>
                      <td>{month._id?.month || 'N/A'}/{month._id?.year || 'N/A'}</td>
                      <td>₹{(month.totalCost || 0).toFixed(2)}</td>
                      <td>{(month.totalLiters || 0).toFixed(2)}L</td>
                      <td>₹{(month.avgPrice || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
