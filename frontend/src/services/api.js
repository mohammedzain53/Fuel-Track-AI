// frontend/src/services/api.js
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to get auth headers
function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

export async function fetchEntries(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/fuel?${qs}`, {
    headers: getAuthHeaders()
  });
  return res.json();
}

export async function createEntry(payload) {
  const res = await fetch(`${API_BASE}/fuel`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function getStats() {
  const res = await fetch(`${API_BASE}/fuel/stats`, {
    headers: getAuthHeaders()
  });
  return res.json();
}

export async function getSummary() {
  const res = await fetch(`${API_BASE}/fuel/summary`, {
    headers: getAuthHeaders()
  });
  return res.json();
}

export async function findStations(lat, lng) {
  const res = await fetch(`${API_BASE}/stations/nearby?lat=${lat}&lng=${lng}`);
  return res.json();
}

export async function chatbotMessage(payload) {
  const res = await fetch(`${API_BASE}/chatbot/message`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function changePassword(passwordData) {
  const res = await fetch(`${API_BASE}/auth/change-password`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(passwordData)
  });
  return res.json();
}
