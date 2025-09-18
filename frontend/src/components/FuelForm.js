// frontend/src/components/FuelForm.js
import React, { useState, useEffect } from 'react';
import { createEntry } from '../services/api';

export default function FuelForm({ onSaved, selectedStation }){
  const [form, setForm] = useState({ 
    liters:'', 
    pricePerLiter:'', 
    stationName:'', 
    odometer:'',
    date: new Date().toISOString().split('T')[0] // Today's date in YYYY-MM-DD format
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Update form when station is selected
  useEffect(() => {
    if (selectedStation) {
      setForm(prev => ({
        ...prev,
        stationName: selectedStation.name // Use the full Google Maps style name
      }));
      setSuccess(`Station selected: ${selectedStation.name}`);
      setTimeout(() => setSuccess(''), 3000);
    }
  }, [selectedStation]);

  async function submit(e){
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        liters: parseFloat(form.liters),
        pricePerLiter: parseFloat(form.pricePerLiter),
        totalCost: parseFloat(form.liters) * parseFloat(form.pricePerLiter),
        stationName: form.stationName || 'Unknown Station',
        odometer: form.odometer ? parseInt(form.odometer) : undefined,
        date: form.date ? new Date(form.date) : new Date()
      };
      
      const res = await createEntry(payload);
      
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess('Fuel entry saved successfully!');
        onSaved(res);
        setForm({ 
          liters:'', 
          pricePerLiter:'', 
          stationName:'', 
          odometer:'',
          date: new Date().toISOString().split('T')[0]
        });
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('Failed to save entry. Please try again.');
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">⛽ Add Fuel Entry</h5>
      </div>
      <div className="card-body">
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        
        <form onSubmit={submit}>
          <div className="mb-3">
            <label className="form-label">Date *</label>
            <input 
              type="date"
              required
              value={form.date} 
              onChange={e=>setForm({...form, date:e.target.value})} 
              className="form-control"
              max={new Date().toISOString().split('T')[0]} // Can't select future dates
            />
            <small className="text-muted">You can add entries for previous dates</small>
          </div>
          
          <div className="mb-3">
            <label className="form-label">Station Name</label>
            <input 
              value={form.stationName} 
              onChange={e=>setForm({...form, stationName:e.target.value})} 
              placeholder="e.g., Indian Oil Petrol Pump, HP Petrol Pump" 
              className="form-control" 
            />
            <small className="text-muted">Use "Find Stations Near Me" to auto-fill with accurate names</small>
          </div>
          
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">Liters *</label>
              <input 
                required 
                type="number" 
                step="0.01"
                value={form.liters} 
                onChange={e=>setForm({...form, liters:e.target.value})} 
                placeholder="0.00" 
                className="form-control"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Price per Liter *</label>
              <input 
                required 
                type="number" 
                step="0.01"
                value={form.pricePerLiter} 
                onChange={e=>setForm({...form, pricePerLiter:e.target.value})} 
                placeholder="₹0.00" 
                className="form-control"
              />
            </div>
          </div>
          
          <div className="mb-3">
            <label className="form-label">Odometer Reading</label>
            <input 
              type="number"
              value={form.odometer} 
              onChange={e=>setForm({...form, odometer:e.target.value})} 
              placeholder="Current km reading (optional)" 
              className="form-control" 
            />
          </div>
          
          {form.liters && form.pricePerLiter && (
            <div className="alert alert-info">
              <strong>Total Cost: ₹{(parseFloat(form.liters || 0) * parseFloat(form.pricePerLiter || 0)).toFixed(2)}</strong>
            </div>
          )}
          
          <button className="btn btn-success w-100" type="submit" disabled={loading}>
            {loading ? (
              <>
                <span className="loading-spinner me-2"></span>
                Saving...
              </>
            ) : (
              <>💾 Save Fuel Entry</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
