import React, { useEffect, useState } from 'react';
import api from '../../api';

export default function AdminUsers(){
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    api.get('/api/users').then(r=>setUsers(r.data)).catch(()=>{}).finally(()=>setLoading(false));
  },[]);

  return (
    <div className="container">
      <h2>Users</h2>
      {loading ? <div>Loading...</div> : (
        <table className="data-table">
          <thead><tr><th>Email</th><th>Active</th><th>Roles</th></tr></thead>
          <tbody>
            {users.map(u=> (
              <tr key={u.id}><td>{u.email}</td><td>{String(u.active)}</td><td>{u.roles.join(', ')}</td></tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
