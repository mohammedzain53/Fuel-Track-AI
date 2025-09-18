// frontend/src/components/Dashboard.js
import React, { useEffect, useState } from 'react';

export default function Dashboard(){
  const [stats, setStats] = useState([]);
  useEffect(()=> {
    fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/fuel/stats`)
      .then(r=>r.json()).then(setStats).catch(()=>{});
  }, []);
  return (
    <div>
      <h4>Stats</h4>
      <pre>{JSON.stringify(stats, null, 2)}</pre>
    </div>
  );
}
