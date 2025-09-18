// frontend/src/services/api.js
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export async function fetchEntries(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/fuel?${qs}`, { credentials: 'include' });
  return res.json();
}

export async function createEntry(payload){
  const res = await fetch(`${API_BASE}/fuel`, {
    method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload), credentials: 'include'
  });
  return res.json();
}

export async function findStations(lat, lng){
  const res = await fetch(`${API_BASE}/stations/nearby?lat=${lat}&lng=${lng}`);
  return res.json();
}

export async function chatbotMessage(payload){
  const res = await fetch(`${API_BASE}/chatbot/message`, {
    method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload)
  });
  return res.json();
}
