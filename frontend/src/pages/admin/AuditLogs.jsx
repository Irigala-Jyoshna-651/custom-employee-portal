import React, { useEffect, useState } from 'react';
import api from '../../api';

export default function AuditLogs(){
  const [logs, setLogs] = useState([]);
  useEffect(()=>{ api.get('/api/audit-logs').then(r=>setLogs(r.data.items)).catch(()=>{}); },[]);
  return (
    <div className="container">
      <h2>Audit Logs</h2>
      <table className="data-table">
        <thead><tr><th>Time</th><th>Action</th><th>Entity</th><th>EntityId</th><th>By</th><th>Meta</th></tr></thead>
        <tbody>{logs.map(l=> (
          <tr key={l.id}><td>{new Date(l.createdAt).toLocaleString()}</td><td>{l.action}</td><td>{l.entity}</td><td>{l.entityId}</td><td>{l.performedById}</td><td>{JSON.stringify(l.meta)}</td></tr>
        ))}</tbody>
      </table>
    </div>
  )
}
