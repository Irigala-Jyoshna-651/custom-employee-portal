import React, { useContext } from 'react';
import { AuthContext } from '../auth/AuthProvider';
import ApplicationCard from '../components/ApplicationCard';

const APPS = [
  { key: 'people', name: 'Zoho People', desc: 'HR management', perm: 'zoho.people.access' },
  { key: 'crm', name: 'Zoho CRM', desc: 'Sales CRM', perm: 'zoho.crm.access' },
  { key: 'desk', name: 'Zoho Desk', desc: 'Support Desk', perm: 'zoho.desk.access' },
  { key: 'books', name: 'Zoho Books', desc: 'Finance', perm: 'zoho.books.access' }
];

export default function Dashboard(){
  const { user } = useContext(AuthContext);
  if (!user) return null;
  const perms = user.permissions || [];
  const visible = APPS.filter(a => perms.includes(a.perm) || (user.roles && user.roles.includes('Admin')));

  return (
    <div className="container">
      <h2>Welcome, {user.email}</h2>
      <div className="apps">
        {visible.map(a => <ApplicationCard key={a.key} app={a} />)}
        {visible.length === 0 && <div>No applications available</div>}
      </div>
    </div>
  )
}
