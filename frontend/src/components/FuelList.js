// frontend/src/components/FuelList.js
import React, { useEffect, useState } from 'react';
import { fetchEntries } from '../services/api';

export default function FuelList({ refresh }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    q: '',
    startDate: '',
    endDate: '',
    vehicle: ''
  });

  useEffect(() => {
    loadEntries();
  }, [refresh, filters]);

  async function loadEntries() {
    try {
      setLoading(true);
      const data = await fetchEntries(filters);
      setEntries(data);
    } catch (err) {
      console.error('Failed to load entries:', err);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }

  function handleFilterChange(key, value) {
    setFilters(prev => ({ ...prev, [key]: value }));
  }

  if (loading) return <div className="text-center">Loading...</div>;

  return (
    <div>
      <h4>Fuel Entries</h4>
      
      {/* Quick Filters */}
      <div className="mb-3">
        <div className="btn-group btn-group-sm" role="group">
          <button 
            className="btn btn-outline-primary"
            onClick={() => {
              const today = new Date();
              const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
              setFilters({...filters, startDate: thisMonth.toISOString().split('T')[0], endDate: today.toISOString().split('T')[0]});
            }}
          >
            This Month
          </button>
          <button 
            className="btn btn-outline-primary"
            onClick={() => {
              const today = new Date();
              const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
              const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
              setFilters({...filters, startDate: lastMonth.toISOString().split('T')[0], endDate: lastMonthEnd.toISOString().split('T')[0]});
            }}
          >
            Last Month
          </button>
          <button 
            className="btn btn-outline-primary"
            onClick={() => {
              const today = new Date();
              const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
              setFilters({...filters, startDate: last30Days.toISOString().split('T')[0], endDate: today.toISOString().split('T')[0]});
            }}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="row mb-3">
        <div className="col-md-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search stations..."
            value={filters.q}
            onChange={(e) => handleFilterChange('q', e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <input
            type="date"
            className="form-control"
            placeholder="From Date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
          />
          <small className="text-muted">From Date</small>
        </div>
        <div className="col-md-3">
          <input
            type="date"
            className="form-control"
            placeholder="To Date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
          />
          <small className="text-muted">To Date</small>
        </div>
        <div className="col-md-3">
          <button 
            className="btn btn-outline-secondary w-100"
            onClick={() => setFilters({q: '', startDate: '', endDate: '', vehicle: ''})}
          >
            🔄 Clear Filters
          </button>
        </div>
      </div>

      {/* Entries Table */}
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Date</th>
              <th>Station</th>
              <th>Liters</th>
              <th>Price/L</th>
              <th>Total Cost</th>
              <th>Odometer</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center">No fuel entries found</td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={entry._id}>
                  <td>
                    {new Date(entry.date).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </td>
                  <td>
                    <strong>{entry.stationName || 'Unknown Station'}</strong>
                  </td>
                  <td>{entry.liters}L</td>
                  <td>₹{entry.pricePerLiter.toFixed(2)}</td>
                  <td><strong>₹{entry.totalCost.toFixed(2)}</strong></td>
                  <td>{entry.odometer || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}