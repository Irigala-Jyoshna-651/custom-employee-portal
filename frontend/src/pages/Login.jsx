import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../auth/AuthProvider';

export default function Login(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { login } = useContext(AuthContext);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      nav('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="container auth">
      <form onSubmit={submit} className="card">
        <h2>Login</h2>
        {error && <div className="error">{error}</div>}
        <label>Email</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} type="email" />
        <label>Password</label>
        <input value={password} onChange={e=>setPassword(e.target.value)} type="password" />
        <button type="submit">Login</button>
      </form>
    </div>
  )
}
