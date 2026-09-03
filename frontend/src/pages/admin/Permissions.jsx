import React, { useEffect, useState } from 'react';
import api from '../../api';

export default function AdminPermissions(){
  const [perms, setPerms] = useState([]);
  useEffect(()=>{ api.get('/api/permissions').then(r=>setPerms(r.data)).catch(()=>{}); },[]);
  return (
    <div className="container">
      <h2>Permissions</h2>
      <ul>{perms.map(p=> <li key={p.id}>{p.name}</li>)}</ul>
    </div>
  )
}
