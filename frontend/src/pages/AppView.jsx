import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';

export default function AppView(){
  const { app } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    setLoading(true); setError(null);
    api.get(`/api/zoho/${app}/info`).then(r=> setData(r.data)).catch(e=> setError(e?.response?.data?.error || e.message)).finally(()=> setLoading(false));
  },[app]);

  return (
    <div className="container">
      <h2>{app}</h2>
      {loading && <div>Loading...</div>}
      {error && <div className="error">{error}</div>}
      {data && <pre style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(data,null,2)}</pre>}
    </div>
  )
}
