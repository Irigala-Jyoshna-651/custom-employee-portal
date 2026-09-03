import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../auth/AuthProvider';

export default function Navbar(){
  const { user, logout } = useContext(AuthContext);
  const nav = useNavigate();
  return (
    <nav className="navbar">
      <div className="brand"><Link to="/">Employee Portal</Link></div>
      <div className="nav-actions">
        {user ? (
          <>
            <span>{user.email}</span>
            <button onClick={() => { logout(); nav('/login'); }}>Logout</button>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </nav>
  )
}
