// frontend/src/components/FuelForm.js
import React, { useState, useEffect } from 'react';
import { createEntry } from '../services/api';

export default function FuelForm({ onSaved, selectedStation }){
  const [form, setForm] = useState({ 
    liters:'', 
    pricePerLiter:'', 
    stationName:'', 
    odometer:'',
    date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    fuelType: 'petrol'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Predefined fuel prices with correct units
  const fuelPrices = {
    petrol: 102.45,    // per liter
    diesel: 90.59,     // per liter
    cng: 84.00,        // per kg
    electric: 350.00   // per full charge
  };

  const fuelTypes = [
    { value: 'petrol', label: '⛽ Petrol', icon: '⛽', unit: 'L', unitLabel: 'per liter' },
    { value: 'diesel', label: '🚛 Diesel', icon: '🚛', unit: 'L', unitLabel: 'per liter' },
    { value: 'cng', label: '🌿 CNG', icon: '🌿', unit: 'kg', unitLabel: 'per kg' },
    { value: 'electric', label: '⚡ Electric', icon: '⚡', unit: 'charge', unitLabel: 'per full charge' }
  ];

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

  // Handle fuel type change and auto-fill price
  const handleFuelTypeChange = (fuelType) => {
    setForm(prev => ({
      ...prev,
      fuelType: fuelType,
      pricePerLiter: fuelPrices[fuelType].toString()
    }));
  };

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
        date: form.date ? new Date(form.date) : new Date(),
        fuelType: form.fuelType
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
          date: new Date().toISOString().split('T')[0],
          fuelType: 'petrol'
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
            <label className="form-label">Fuel Type *</label>
            <div className="fuel-type-selector">
              {fuelTypes.map(fuel => (
                <button
                  key={fuel.value}
                  type="button"
                  className={`btn fuel-type-btn ${form.fuelType === fuel.value ? 'active' : 'btn-outline-primary'}`}
                  onClick={() => handleFuelTypeChange(fuel.value)}
                >
                  {fuel.icon} {fuel.label}
                  <small className="d-block">₹{fuelPrices[fuel.value]}/{fuel.unit}</small>
                </button>
              ))}
            </div>
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
              <label className="form-label">
                {form.fuelType === 'cng' ? 'Kilograms *' : 
                 form.fuelType === 'electric' ? 'Full Charges *' : 'Liters *'}
              </label>
              <input 
                required 
                type="number" 
                step={form.fuelType === 'electric' ? '1' : '0.01'}
                value={form.liters} 
                onChange={e=>setForm({...form, liters:e.target.value})} 
                placeholder={form.fuelType === 'electric' ? '1' : '0.00'} 
                className="form-control"
              />
              <small className="text-muted">
                {form.fuelType === 'cng' ? 'CNG is measured in kilograms' : 
                 form.fuelType === 'electric' ? 'Number of full charges' : 'Fuel quantity in liters'}
              </small>
            </div>
            <div className="col-md-6">
              <label className="form-label">
                Price per {fuelTypes.find(f => f.value === form.fuelType)?.unit || 'unit'} *
              </label>
              <div className="input-group">
                <span className="input-group-text">₹</span>
                <input 
                  required 
                  type="number" 
                  step="0.01"
                  value={form.pricePerLiter} 
                  onChange={e=>setForm({...form, pricePerLiter:e.target.value})} 
                  placeholder="0.00" 
                  className="form-control"
                />
                <button 
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setForm({...form, pricePerLiter: fuelPrices[form.fuelType].toString()})}
                  title="Use current market price"
                >
                  💰 Auto
                </button>
              </div>
              <small className="text-muted">
                Current {form.fuelType} price: ₹{fuelPrices[form.fuelType]}/{fuelTypes.find(f => f.value === form.fuelType)?.unit}
              </small>
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
              <br />
              <small>
                {form.liters} {fuelTypes.find(f => f.value === form.fuelType)?.unit} × ₹{form.pricePerLiter}/{fuelTypes.find(f => f.value === form.fuelType)?.unit}
              </small>
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
