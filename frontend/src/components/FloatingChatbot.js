// frontend/src/components/FloatingChatbot.js
import React, { useState, useRef, useEffect } from 'react';
import { chatbotMessage } from '../services/api';

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    { 
      from: 'bot', 
      text: 'Hi! 👋 I\'m your AI Fuel Assistant!\n\nI can help you with:\n• Finding nearby gas stations 🗺️\n• Analyzing fuel expenses 📊\n• Tracking efficiency 📈\n• Price comparisons 💰\n\nWhat would you like to know?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const quickActions = [
    { text: 'Find stations near me', icon: '🗺️', color: 'primary' },
    { text: 'Monthly expenses', icon: '📊', color: 'success' },
    { text: 'Average fuel price', icon: '💰', color: 'warning' },
    { text: 'Help me', icon: '❓', color: 'info' }
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (message = null) => {
    const messageText = message || input;
    if (!messageText.trim()) return;

    const userMsg = { 
      from: 'user', 
      text: messageText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Get location for nearby queries
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
      } catch (e) {
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
      
      setIsTyping(false);
      
      const botReply = res.reply || formatStationResponse(res) || "I couldn't understand that. Try asking 'help' to see what I can do!";
      setMessages(prev => [...prev, { 
        from: 'bot', 
        text: botReply,
        timestamp: new Date()
      }]);
    } catch (error) {
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        from: 'bot', 
        text: '⚠️ Sorry, I encountered an error. Please try again or check your internet connection.',
        timestamp: new Date()
      }]);
    }
  };

  const formatStationResponse = (res) => {
    if (res.hasStations && res.stations) {
      return res.reply;
    }
    
    if (res.success && res.stations) {
      const stationList = res.stations.slice(0, 5).map((station, index) => 
        `${index + 1}. ${station.name}\n   📍 ${station.address}\n   📏 ${station.distance ? `${station.distance}m away` : ''}`
      ).join('\n\n');
      return `Found ${res.stations.length} stations:\n\n${stationList}`;
    }
    
    if (res.data && res.data.results) {
      return res.data.results.slice(0,5).map(s => `${s.name} — ${s.vicinity || s.formatted_address}`).join('\n');
    }
    
    return res.reply || "I couldn't find any stations nearby.";
  };

  const clearChat = () => {
    setMessages([
      { 
        from: 'bot', 
        text: 'Chat cleared! How can I help you today? 😊',
        timestamp: new Date()
      }
    ]);
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Floating Chat Button */}
      <div 
        className={`floating-chat-button ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="chat-button-icon">
          {isOpen ? '✕' : '🤖'}
        </div>
        <div className="chat-button-pulse"></div>
        <div className="chat-button-text">
          {isOpen ? 'Close' : 'AI Assistant'}
        </div>
      </div>

      {/* Floating Chat Window */}
      {isOpen && (
        <div className={`floating-chat-window ${isMinimized ? 'minimized' : ''}`}>
          {/* Chat Header */}
          <div className="floating-chat-header">
            <div className="chat-header-info">
              <div className="chat-avatar">🤖</div>
              <div className="chat-header-text">
                <h6>AI Fuel Assistant</h6>
                <span className="chat-status">
                  <span className="status-dot"></span>
                  Online
                </span>
              </div>
            </div>
            <div className="chat-header-controls">
              <button 
                className="chat-control-btn"
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? '⬆️' : '⬇️'}
              </button>
              <button 
                className="chat-control-btn"
                onClick={clearChat}
                title="Clear chat"
              >
                🗑️
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Chat Messages */}
              <div className="floating-chat-messages">
                {messages.map((msg, index) => (
                  <div key={index} className={`floating-message ${msg.from}`}>
                    {msg.from === 'bot' && (
                      <div className="message-avatar bot">🤖</div>
                    )}
                    <div className="message-bubble">
                      <div className="message-text">
                        {msg.text.split('\n').map((line, i) => (
                          <div key={i}>{line}</div>
                        ))}
                      </div>
                      <div className="message-time">
                        {formatTime(msg.timestamp)}
                      </div>
                    </div>
                    {msg.from === 'user' && (
                      <div className="message-avatar user">👤</div>
                    )}
                  </div>
                ))}
                
                {isTyping && (
                  <div className="floating-message bot">
                    <div className="message-avatar bot">🤖</div>
                    <div className="message-bubble typing">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Actions */}
              <div className="floating-quick-actions">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    className={`quick-action-btn ${action.color}`}
                    onClick={() => handleSend(action.text)}
                  >
                    {action.icon}
                  </button>
                ))}
              </div>

              {/* Chat Input */}
              <div className="floating-chat-input">
                <div className="chat-input-wrapper">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask me anything..."
                    className="chat-input"
                  />
                  <button
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isTyping}
                    className="chat-send-btn"
                  >
                    <span className="send-icon">🚀</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}