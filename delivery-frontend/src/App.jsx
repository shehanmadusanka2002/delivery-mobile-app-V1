import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminLayout from './components/AdminLayout';
import AllDriversList from './components/AllDriversList';
import PendingDrivers from './components/PendingDrivers';
import AdminOrderHistory from './components/AdminOrderHistory';
import VehiclePricingSettings from './components/VehiclePricingSettings';
import FinanceManager from './components/FinanceManager';
import AdminReviews from './components/AdminReviews';
import ProtectedRoute from './components/ProtectedRoute';
import CustomerLayout from './components/CustomerLayout';
import CustomerHome from './pages/CustomerHome';
import CustomerHistory from './pages/CustomerHistory';
import CustomerWallet from './pages/CustomerWallet';
import CustomerProfile from './pages/CustomerProfile';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
        <Route path="/admin/pending-drivers" element={<AdminLayout><PendingDrivers /></AdminLayout>} />
        <Route path="/admin/drivers" element={<AdminLayout><AllDriversList /></AdminLayout>} />
        <Route path="/admin/orders" element={<AdminLayout><AdminOrderHistory /></AdminLayout>} />
        <Route path="/admin/pricing" element={<AdminLayout><VehiclePricingSettings /></AdminLayout>} />
        <Route path="/admin/finance" element={<AdminLayout><FinanceManager /></AdminLayout>} />
        <Route path="/admin/reviews" element={<AdminLayout><AdminReviews /></AdminLayout>} />
        <Route path="/admin-dashboard" element={<Navigate to="/admin" replace />} />
        
        {/* Customer Routes - Protected and Nested */}
        <Route
          path="/customer"
          element={
            <ProtectedRoute requiredRole="CUSTOMER">
              <CustomerLayout />
            </ProtectedRoute>
          }
        >
          <Route path="home" element={<CustomerHome />} />
          <Route path="history" element={<CustomerHistory />} />
          <Route path="wallet" element={<CustomerWallet />} />
          <Route path="profile" element={<CustomerProfile />} />
          <Route index element={<Navigate to="home" replace />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
