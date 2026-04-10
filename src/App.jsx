import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import OfficerDashboard from './pages/OfficerDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import SupervisorDashboard from './pages/SupervisorDashboard';
import Students from './pages/Students';
import StudentDetail from './pages/StudentDetail';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import UserManagement from './pages/UserManagement';
import ClassManagement from './pages/ClassManagement';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Certificate from './pages/Certificate';
import StudentReport from './pages/StudentReport';
import Rewards from './pages/Rewards';
import Layout from './components/Layout';

const Dashboard = () => {
  const { user } = useAuth();
  
  // Role-based dashboard content redirection
  if (user?.role === 'teacher') return <TeacherDashboard />;
  if (user?.role === 'officer') return <Navigate to="/register-student" replace />;
  if (['supervisor', 'manager', 'admin'].includes(user?.role)) return <Navigate to="/analytics" replace />;
  
  return <Navigate to="/settings" replace />;
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
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
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

          <Route 
            path="/school-structure" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'supervisor']}>
                <ClassManagement />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/certificate/:id" 
            element={
              <ProtectedRoute allowedRoles={['supervisor', 'admin', 'manager']}>
                <Certificate />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/report/:id" 
            element={
              <ProtectedRoute allowedRoles={['supervisor', 'admin', 'manager', 'teacher']}>
                <StudentReport />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/rewards" 
            element={
              <ProtectedRoute allowedRoles={['manager', 'admin', 'supervisor']}>
                <Rewards />
              </ProtectedRoute>
            } 
          />
          
          <Route path="/dashboard" element={<Navigate to="/dashboard" />} />
          <Route path="/unauthorized" element={<div className="p-8 text-dangerClr text-2xl font-bold bg-bgDarkAll h-screen">Access Denied</div>} />
          <Route path="*" element={<div className="p-8 text-2xl font-bold bg-bgDarkAll h-screen">404 - Not Found</div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
