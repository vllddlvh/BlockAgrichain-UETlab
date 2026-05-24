import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

// Layouts
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import PublicLayout from '../layouts/PublicLayout';

// Route guard
import ProtectedRoute from './ProtectedRoute';

// Auth pages
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';

// Public page (Consumer QR Scan)
import Dashboard from '../pages/Dashboard/Dashboard';
import CheckQR from '../pages/public/CheckQR/CheckQR';

// Farmer pages
import Certificates from '../pages/Farmer/Certificates/Certificates';
import Products from '../pages/Farmer/Products/Products';
import CreateBatch from '../pages/Farmer/CreateBatch/CreateBatch';
import Batches from '../pages/Farmer/BatchDetail/Batches';

// Transporter pages
import TransferOwnership from '../pages/Transporter/TransferOwnership/TransferOwnership';

// Retailer pages
import ReceiveGoods from '../pages/Retailer/ReceiveGoods/ReceiveGoods';
import RetailDashboard from '../pages/Retailer/RetailDashboard/RetailDashboard';

// Admin pages
import RiskManagement from '../pages/Admin/RiskManagement/RiskManagement';
import Audit from '../pages/Admin/Audit/Audit';

// Role groups cho ProtectedRoute
const FARM_ROLES        = ['FARM_ADMIN', 'FARM_STAFF'];
const TRANSPORT_ROLES   = ['TRANSPORT_ADMIN', 'TRANSPORT_STAFF'];
const RETAIL_ROLES      = ['RETAIL_ADMIN', 'RETAIL_STAFF'];
const ADMIN_ROLES       = ['SYSTEM_ADMIN'];

const UnauthorizedPage = () => {
  const { logout, getProfileConfig } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleGoHome = () => {
    navigate(getProfileConfig().defaultPath, { replace: true });
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '1rem', background: '#f8fafc' }}>
      <div style={{ background: 'white', padding: '3rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', textAlign: 'center' }}>
        <h1 style={{ color: '#ef4444', marginBottom: '1rem' }}>🚫 Không có quyền truy cập</h1>
        <p style={{ color: '#64748b' }}>Tài khoản của bạn không đủ quyền hạn để xem trang này.</p>
        <div style={{ display: 'flex', gap: '10px', marginTop: '2rem', justifyContent: 'center' }}>
          <button onClick={handleGoHome} style={{ padding: '10px 24px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>
            Về Trang Chủ
          </button>
          <button onClick={handleLogout} style={{ padding: '10px 24px', background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
};

export default function AppRoutes() {
  const { isAuthenticated, getProfileConfig } = useAuthStore();

  return (
    <Routes>
      {/* ===== PUBLIC: Người tiêu dùng quét QR ===== */}
      <Route
        path="/trace/:batchId?"
        element={
          <PublicLayout>
            <Dashboard />
          </PublicLayout>
        }
      />
      
      <Route
        path="/checkQR"
        element={
          <PublicLayout>
            <CheckQR />
          </PublicLayout>
        }
      />

      {/* ===== AUTH PAGES ===== */}
      <Route
        path="/login"
        element={
          isAuthenticated
            ? <Navigate to={getProfileConfig().defaultPath} replace />
            : <AuthLayout><Login /></AuthLayout>
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated
            ? <Navigate to={getProfileConfig().defaultPath} replace />
            : <AuthLayout><Register /></AuthLayout>
        }
      />

      {/* ===== PROTECTED: FARMER ===== */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requiredRoles={FARM_ROLES}>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/certificates"
        element={
          <ProtectedRoute requiredRoles={FARM_ROLES}>
            <DashboardLayout><Certificates /></DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute requiredRoles={FARM_ROLES}>
            <DashboardLayout><Products /></DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-batch"
        element={
          <ProtectedRoute requiredRoles={FARM_ROLES}>
            <DashboardLayout><CreateBatch /></DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/batch-detail"
        element={
          <ProtectedRoute requiredRoles={FARM_ROLES}>
            <DashboardLayout><Batches /></DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* ===== PROTECTED: TRANSPORTER ===== */}
      <Route
        path="/transfer-ownership"
        element={
          <ProtectedRoute requiredRoles={TRANSPORT_ROLES}>
            <DashboardLayout><TransferOwnership /></DashboardLayout>
          </ProtectedRoute>
        }
      />
    {/* ===== PROTECTED: RETAILER ===== */}
      <Route
        path="/receive-goods"
        element={
          <ProtectedRoute requiredRoles={RETAIL_ROLES}>
            <DashboardLayout><ReceiveGoods /></DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/retail-dashboard"
        element={
          <ProtectedRoute requiredRoles={RETAIL_ROLES}>
            <DashboardLayout><RetailDashboard /></DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* ===== PROTECTED: ADMIN ===== */}
      <Route
        path="/risk-management"
        element={
          <ProtectedRoute requiredRoles={ADMIN_ROLES}>
            <DashboardLayout><RiskManagement /></DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/audit"
        element={
          <ProtectedRoute requiredRoles={ADMIN_ROLES}>
            <DashboardLayout><Audit /></DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* ===== FALLBACKS ===== */}
      <Route
        path="/unauthorized"
        element={<UnauthorizedPage />}
      />
      <Route
        path="/"
        element={
          isAuthenticated
            ? <Navigate to={getProfileConfig().defaultPath} replace />
            : <Navigate to="/login" replace />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
