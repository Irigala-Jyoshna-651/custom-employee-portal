import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import Admin from './pages/admin/Admin'
import AdminUsers from './pages/admin/Users'
import AdminRoles from './pages/admin/Roles'
import AdminPermissions from './pages/admin/Permissions'
import AuditLogs from './pages/admin/AuditLogs'
import AppView from './pages/AppView'

export default function App(){
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login/>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>} />
          <Route path="/" element={<ProtectedRoute><Dashboard/></ProtectedRoute>} />
          <Route path="/app/:app" element={<ProtectedRoute><AppView/></ProtectedRoute>} />

          <Route path="/admin" element={<AdminRoute><Admin/></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers/></AdminRoute>} />
          <Route path="/admin/roles" element={<AdminRoute><AdminRoles/></AdminRoute>} />
          <Route path="/admin/permissions" element={<AdminRoute><AdminPermissions/></AdminRoute>} />
          <Route path="/admin/audit-logs" element={<AdminRoute><AuditLogs/></AdminRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
