import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Requests from './pages/Requests';
import LeaveManagement from './pages/LeaveManagement';
import Calendar from './pages/Calendar';
import Compliance from './pages/Compliance';
import Finance from './pages/Finance';
import Settings from './pages/Settings';
import Help from './pages/Help';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Notifications from './pages/Notifications';
import NotFound from './pages/NotFound';
import ShareDocument from './pages/ShareDocument';
import { useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Protected Route Guard with full Role-Based Access Control (RBAC) validation
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, effectiveRole } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(effectiveRole)) {
    // Redirect unauthorized roles back to the main dashboard
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Public Guest Route Guard to prevent logged-in users from visiting Login/Register pages
const GuestRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Guest Auth Routes */}
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
          <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
          
          {/* Public Verification Sharing Link */}
          <Route path="/requests/share/:docId" element={<ShareDocument />} />
          
          {/* Main Secure Layout Routes */}
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* Employee Management: Restricted from standard Employee role */}
            <Route path="employees" element={
              <ProtectedRoute allowedRoles={['HR_MANAGER', 'HR_AGENT', 'DEPARTMENT_MANAGER', 'INTERIM_MANAGER']}>
                <Employees />
              </ProtectedRoute>
            } />
            
            <Route path="requests" element={<Requests />} />
            <Route path="leave" element={<LeaveManagement />} />
            
            {/* Calendar & Scheduling: Restricted to HR Managers and HR Agents */}
            <Route path="calendar" element={
              <ProtectedRoute allowedRoles={['HR_MANAGER', 'HR_AGENT']}>
                <Calendar />
              </ProtectedRoute>
            } />
            
            {/* Regulatory Compliance: Restricted to HR Managers and HR Agents */}
            <Route path="compliance" element={
              <ProtectedRoute allowedRoles={['HR_MANAGER', 'HR_AGENT']}>
                <Compliance />
              </ProtectedRoute>
            } />
            
            {/* Finance Panel: Restricted exclusively to HR Manager */}
            <Route path="finance" element={
              <ProtectedRoute allowedRoles={['HR_MANAGER']}>
                <Finance />
              </ProtectedRoute>
            } />
            
            {/* Settings & Admin Console: Restricted exclusively to HR Manager */}
            <Route path="settings" element={
              <ProtectedRoute allowedRoles={['HR_MANAGER']}>
                <Settings />
              </ProtectedRoute>
            } />
            
            <Route path="help" element={<Help />} />
            <Route path="profile" element={<Profile />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>

          {/* Catch-all route for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
