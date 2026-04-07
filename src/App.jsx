import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

// Pages
import Login from './pages/Login';
import OfficerDashboard from './pages/OfficerDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import SupervisorDashboard from './pages/SupervisorDashboard';
import Students from './pages/Students';
import StudentDetail from './pages/StudentDetail';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import UserManagement from './pages/UserManagement';
import Layout from './components/Layout';

const Dashboard = () => {
  const { user } = useAuth();
  
  // Role-based dashboard content or redirect
  if (user?.role === 'teacher') return <TeacherDashboard />;
  
  return (
    <div className="animate-fadeInUp">
      <h1 className="text-3xl font-bold text-primaryClr mb-4">Welcome back, {user?.first_name}!</h1>
      <p className="text-secondaryClr text-lg mb-8">Access your tools and insights from the sidebar.</p>
      
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 border-l-4 border-primaryClr">
          <p className="text-xs text-secondaryClr uppercase tracking-wider mb-1">Your Role</p>
          <p className="text-xl font-bold capitalize">{user?.role}</p>
        </div>
      </div>
    </div>
  );
};

// Route Protectors
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) return <div className="h-screen flex items-center justify-center bg-bgDarkAll text-primaryClr">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) return <Navigate to="/unauthorized" />;

  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/register-student" 
            element={
              <ProtectedRoute allowedRoles={['officer', 'supervisor', 'admin']}>
                <OfficerDashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/review-incidents" 
            element={
              <ProtectedRoute allowedRoles={['supervisor', 'admin']}>
                <SupervisorDashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/students" 
            element={
              <ProtectedRoute allowedRoles={['officer', 'teacher', 'supervisor', 'manager']}>
                <Students />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/students/:id" 
            element={
              <ProtectedRoute allowedRoles={['officer', 'teacher', 'supervisor', 'manager']}>
                <StudentDetail />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute allowedRoles={['supervisor', 'admin', 'manager']}>
                <Analytics />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/users" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'supervisor']}>
                <UserManagement />
              </ProtectedRoute>
            } 
          />
          
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/unauthorized" element={<div className="p-8 text-dangerClr text-2xl font-bold bg-bgDarkAll h-screen">Access Denied</div>} />
          <Route path="*" element={<div className="p-8 text-2xl font-bold bg-bgDarkAll h-screen">404 - Not Found</div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
