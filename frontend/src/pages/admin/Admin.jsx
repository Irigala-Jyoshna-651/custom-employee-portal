import React from 'react';
import { Link } from 'react-router-dom';

export default function Admin(){
  return (
    <div className="container">
      <h2>Admin Dashboard</h2>
      <div className="admin-grid">
        <Link to="/admin/users" className="card">Users</Link>
        <Link to="/admin/roles" className="card">Roles</Link>
        <Link to="/admin/permissions" className="card">Permissions</Link>
        <Link to="/admin/audit-logs" className="card">Audit Logs</Link>
      </div>
    </div>
  )
}
