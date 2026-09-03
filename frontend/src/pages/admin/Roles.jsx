import React, { useEffect, useState } from 'react';
import api from '../../api';

export default function AdminRoles(){
  const [roles, setRoles] = useState([]);
  useEffect(()=>{ api.get('/api/roles').then(r=>setRoles(r.data)).catch(()=>{}); },[]);
  return (
    <div className="container">
      <h2>Roles</h2>
      <ul>
        {roles.map(r=> <li key={r.id}>{r.name} — {r.permissions.join(', ')}</li>)}
      </ul>
    </div>
  )
}
