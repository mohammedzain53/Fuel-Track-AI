// frontend/src/components/Chatbot.js
import React, { useState } from 'react';
import { chatbotMessage } from '../services/api';

export default function Chatbot(){
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi! Ask me to find gas stations nearby or ask about your fuel expenses.' }
  ]);
  const [input, setInput] = useState('');

  async function send(){
    if(!input.trim()) return;
    
    const userMsg = { from:'user', text: input };
    setMessages(m=>[...m, userMsg]);
    
    // Show typing indicator
    setMessages(m=>[...m, { from:'bot', text: '🤖 Typing...', isTyping: true }]);
    
    // try to get location if message asks for 'near' or 'nearby'
    let pos = null;
    if (/(near|nearby|around|close|find.*station|find.*pump)/i.test(input)) {
      try {
        pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            p => resolve(p.coords), 
            err => {
              console.log('Location error:', err);
              resolve(null);
            },
            { timeout: 10000, enableHighAccuracy: true }
          );
        });
      } catch(e){ 
        console.log('Location exception:', e);
        pos = null; 
      }
    }

    try {
      const payload = {
        text: input,
        lat: pos?.latitude,
        lng: pos?.longitude
      };

      const res = await chatbotMessage(payload);
      
      // Remove typing indicator
      setMessages(m => m.filter(msg => !msg.isTyping));
      
      const botReply = res.reply || formatStationResponse(res) || "I couldn't understand that. Try asking 'help' to see what I can do!";
      setMessages(m=>[...m, { from:'bot', text: botReply }]);
    } catch (error) {
      // Remove typing indicator
      setMessages(m => m.filter(msg => !msg.isTyping));
      
      setMessages(m=>[...m, { 
        from:'bot', 
        text: '⚠️ Sorry, I encountered an error. Please try again or check your internet connection.' 
      }]);
    }
    
    setInput('');
  }

  function formatStationResponse(res){
    // Handle the new station response format
    if (res.hasStations && res.stations) {
      return res.reply; // The backend now formats the response
    }
    
    // Fallback for direct API responses
    if (res.success && res.stations) {
      const stationList = res.stations.slice(0, 5).map((station, index) => 
        `${index + 1}. ${station.name}\n   📍 ${station.address}\n   📏 ${station.distance ? `${station.distance}m away` : ''}`
      ).join('\n\n');
      return `Found ${res.stations.length} stations:\n\n${stationList}`;
    }
    
    // Legacy format support
    if (res.data && res.data.results) {
      return res.data.results.slice(0,5).map(s => `${s.name} — ${s.vicinity || s.formatted_address}`).join('\n');
    }
    if (res.data && res.data.elements) {
      return res.data.elements.slice(0,5).map(e => `${e.name || 'Unknown'} — ${e.address || ''}`).join('\n');
    }
    
    return res.reply || "I couldn't find any stations nearby.";
  }

  return (
    <div className="chatbot-container p-4">
      <div className="mb-3">
        <h4 className="gradient-text mb-0">🤖 AI Fuel Assistant</h4>
        <small className="text-muted">Ask me about your fuel expenses or find nearby stations!</small>
      </div>
      
      <div style={{height:350, overflow:'auto'}} className="mb-3 p-3 bg-light rounded">
        <div className="d-flex flex-column">
          {messages.map((m,i)=>(
            <div key={i} className={`chat-message ${m.from}`}>
              <pre style={{margin:0,whiteSpace:'pre-wrap', fontFamily:'inherit'}}>{m.text}</pre>
            </div>
          ))}
        </div>
      </div>

      <div className="d-flex gap-2">
        <input 
          className="form-control" 
          value={input} 
          onChange={e=>setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && send()}
          placeholder="Ask: 'find gas stations near me' or 'how much have I spent?'" 
        />
        <button className="btn btn-primary px-4" onClick={send} disabled={!input.trim()}>
          Send
        </button>
      </div>
      
      <div className="mt-2">
        <small className="text-muted">
          💡 Try: "find stations", "monthly expenses", "average price", "last fill-up", or "help"
        </small>
      </div>
    </div>
  );
}
