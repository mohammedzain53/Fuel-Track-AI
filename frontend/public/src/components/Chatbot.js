// frontend/src/components/Chatbot.js
import React, { useState } from 'react';
import { chatbotMessage } from '../services/api';

export default function Chatbot(){
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi! Ask me to find gas stations nearby or ask about your fuel expenses.' }
  ]);
  const [input, setInput] = useState('');

  async function send(){
    if(!input) return;
    const userMsg = { from:'user', text: input };
    setMessages(m=>[...m, userMsg]);
    // try to get location if message asks for 'near' or 'nearby'
    let pos = null;
    if (/(near|nearby|around|close)/i.test(input)) {
      try {
        pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(p => resolve(p.coords), err => resolve(null));
        });
      } catch(e){ pos = null; }
    }

    const payload = {
      text: input,
      lat: pos?.latitude,
      lng: pos?.longitude
    };

    const res = await chatbotMessage(payload);
    const botReply = res.reply || (res.data ? formatStationResponse(res) : "I couldn't find anything.");
    setMessages(m=>[...m, { from:'bot', text: botReply }]);
    setInput('');
  }

  function formatStationResponse(res){
    // if provider returned stations list (Google Places)
    const provider = res.provider || '';
    if (res.data && res.data.results) {
      return res.data.results.slice(0,5).map(s => `${s.name} — ${s.vicinity || s.formatted_address}`).join('\n');
    }
    if (res.data && res.data.elements) { // OSM Overpass
      return res.data.elements.slice(0,5).map(e => `${e.tags.name || 'Unknown'} — ${e.tags?.addr:street || ''}`).join('\n');
    }
    return JSON.stringify(res).slice(0,300);
  }

  return (
    <div className="card p-3">
      <div style={{height:250, overflow:'auto'}} className="mb-2">
        {messages.map((m,i)=>(
          <div key={i} className={m.from==='bot' ? 'text-left' : 'text-right'}>
            <div className={`p-2 mb-1 d-inline-block ${m.from==='bot' ? 'bg-light' : 'bg-primary text-white'}`} style={{borderRadius:8}}>
              <pre style={{margin:0,whiteSpace:'pre-wrap'}}>{m.text}</pre>
            </div>
          </div>
        ))}
      </div>

      <div className="d-flex">
        <input className="form-control me-2" value={input} onChange={e=>setInput(e.target.value)} placeholder="Ask: find gas stations near me..." />
        <button className="btn btn-primary" onClick={send}>Send</button>
      </div>
    </div>
  );
}
