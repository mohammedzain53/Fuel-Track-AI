// frontend/src/components/Chatbot.js
import React, { useState } from 'react';
import { chatbotMessage } from '../services/api';

export default function Chatbot(){
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi! I\'m your AI Fuel Assistant 🤖\n\nI can help you with:\n• Finding nearby gas stations 🗺️\n• Analyzing your fuel expenses 📊\n• Tracking fuel efficiency 📈\n• Price comparisons 💰\n\nWhat would you like to know?' }
  ]);
  const [input, setInput] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [quickActions] = useState([
    { text: 'Find stations near me', icon: '🗺️' },
    { text: 'Monthly expenses', icon: '📊' },
    { text: 'Average fuel price', icon: '💰' },
    { text: 'Last fill-up details', icon: '⛽' }
  ]);

  async function send(message = null){
    const messageText = message || input;
    if(!messageText.trim()) return;
    
    const userMsg = { from:'user', text: messageText };
    setMessages(m=>[...m, userMsg]);
    
    // Show typing indicator
    setMessages(m=>[...m, { from:'bot', text: '🤖 Typing...', isTyping: true }]);
    
    // try to get location if message asks for 'near' or 'nearby'
    let pos = null;
    if (/(near|nearby|around|close|find.*station|find.*pump)/i.test(messageText)) {
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
        text: messageText,
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
    
    if (!message) setInput('');
  }

  function handleQuickAction(actionText) {
    send(actionText);
  }

  function clearChat() {
    setMessages([
      { from: 'bot', text: 'Chat cleared! How can I help you today? 😊' }
    ]);
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
    <div className="chatbot-tab-container">
      {/* Chatbot Header */}
      <div className="chatbot-header-tab">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center">
            <div className="chatbot-avatar-tab">
              <span>🤖</span>
            </div>
            <div className="ms-3">
              <h4 className="mb-0 gradient-text">AI Fuel Assistant</h4>
              <small className="text-muted">Online • Ready to help with your fuel tracking!</small>
            </div>
          </div>
          <div className="chatbot-controls-tab">
            <button 
              className="btn btn-sm btn-outline-primary me-2" 
              onClick={clearChat}
              title="Clear chat"
            >
              🗑️ Clear
            </button>
            <button 
              className="btn btn-sm btn-outline-secondary" 
              onClick={() => setIsMinimized(!isMinimized)}
              title={isMinimized ? 'Expand Chat' : 'Minimize Chat'}
            >
              {isMinimized ? '⬆️ Expand' : '⬇️ Minimize'}
            </button>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      {!isMinimized && (
        <>
          <div className="chatbot-messages-tab">
            <div className="d-flex flex-column">
              {messages.map((m,i)=>(
                <div key={i} className={`chat-message-tab ${m.from}`}>
                  {m.from === 'bot' && (
                    <div className="message-avatar-tab">🤖</div>
                  )}
                  <div className="message-content-tab">
                    <pre style={{margin:0,whiteSpace:'pre-wrap', fontFamily:'inherit'}}>{m.text}</pre>
                    <small className="message-time-tab">
                      {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </small>
                  </div>
                  {m.from === 'user' && (
                    <div className="message-avatar-tab user-avatar-tab">👤</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions-tab">
            <h6 className="text-muted mb-3">🚀 Quick Actions:</h6>
            <div className="row">
              {quickActions.map((action, i) => (
                <div key={i} className="col-md-6 col-lg-3 mb-2">
                  <button
                    className="btn btn-outline-primary quick-action-btn-tab w-100"
                    onClick={() => handleQuickAction(action.text)}
                  >
                    {action.icon} {action.text}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="chatbot-input-tab">
            <div className="card">
              <div className="card-body">
                <div className="input-group input-group-lg">
                  <span className="input-group-text">💬</span>
                  <input 
                    className="form-control" 
                    value={input} 
                    onChange={e=>setInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && send()}
                    placeholder="Ask me anything about your fuel expenses or nearby stations..." 
                  />
                  <button 
                    className="btn btn-primary px-4" 
                    onClick={() => send()} 
                    disabled={!input.trim()}
                  >
                    <span className="d-none d-sm-inline">Send Message</span>
                    <span className="d-sm-none">📤</span>
                  </button>
                </div>
                <div className="mt-3">
                  <small className="text-muted">
                    💡 <strong>Try asking:</strong> "find gas stations near me", "what's my monthly fuel expense?", "show average fuel price", "when was my last fill-up?", or "help"
                  </small>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      
      {isMinimized && (
        <div className="text-center py-4">
          <div className="alert alert-info">
            <h5>🤖 AI Assistant Minimized</h5>
            <p className="mb-0">Click "Expand" above to start chatting with your AI fuel assistant!</p>
          </div>
        </div>
      )}
    </div>
  );
}
