// frontend/src/components/FuelForm.js
import React, { useState } from 'react';
import { createEntry } from '../services/api';

export default function FuelForm({ onSaved }){
  const [form, setForm] = useState({ liters:'', pricePerLiter:'', stationName:'', odometer:'' });
  async function submit(e){
    e.preventDefault();
    const payload = {
      liters: parseFloat(form.liters),
      pricePerLiter: parseFloat(form.pricePerLiter),
      totalCost: parseFloat(form.liters) * parseFloat(form.pricePerLiter),
      stationName: form.stationName,
      odometer: form.odometer ? parseInt(form.odometer) : undefined
    };
    const res = await createEntry(payload);
    onSaved(res);
    setForm({ liters:'', pricePerLiter:'', stationName:'', odometer:'' });
  }
  return (
    <form onSubmit={submit}>
      <div className="mb-2"><input value={form.stationName} onChange={e=>setForm({...form, stationName:e.target.value})} placeholder="Station name" className="form-control" /></div>
      <div className="mb-2 row">
        <div className="col"><input required value={form.liters} onChange={e=>setForm({...form, liters:e.target.value})} placeholder="Liters" className="form-control"/></div>
        <div className="col"><input required value={form.pricePerLiter} onChange={e=>setForm({...form, pricePerLiter:e.target.value})} placeholder="Price/L" className="form-control"/></div>
      </div>
      <div className="mb-2"><input value={form.odometer} onChange={e=>setForm({...form, odometer:e.target.value})} placeholder="Odometer (optional)" className="form-control" /></div>
      <button className="btn btn-success" type="submit">Save fuel entry</button>
    </form>
  );
}
