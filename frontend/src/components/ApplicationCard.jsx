import React from 'react';

export default function ApplicationCard({ app }){
  return (
    <div className="app-card">
      <div className="icon">🔒</div>
      <div className="info">
        <h3>{app.name}</h3>
        <p>{app.desc}</p>
      </div>
      <div className="actions">
        <button>Open</button>
      </div>
    </div>
  )
}
