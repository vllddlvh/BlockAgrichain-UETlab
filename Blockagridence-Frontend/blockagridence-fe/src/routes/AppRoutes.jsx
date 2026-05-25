import { Routes, Route, Navigate } from 'react-router-dom';
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
import UpdateTransit from '../pages/Transporter/UpdateTransit/UpdateTransit';

// Retailer pages
import ReceiveGoods from '../pages/Retailer/ReceiveGoods/ReceiveGoods';
import RetailDashboard from '../pages/Retailer/RetailDashboard/RetailDashboard';

// Admin pages
import RiskManagement from '../pages/Admin/RiskManagement/RiskManagement';
import Audit from '../pages/Admin/Audit/Audit';
import OrgApproval from '../pages/Admin/OrgApproval/OrgApproval';

// Role groups cho ProtectedRoute
const FARM_ROLES        = ['FARM_ADMIN', 'FARM_STAFF'];
const TRANSPORT_ROLES   = ['TRANSPORT_ADMIN', 'TRANSPORT_STAFF'];
const RETAIL_ROLES      = ['RETAIL_ADMIN', 'RETAIL_STAFF'];
const ADMIN_ROLES       = ['SYSTEM_ADMIN'];

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
          <ProtectedRoute requiredRoles={[...FARM_ROLES, ...TRANSPORT_ROLES, ...RETAIL_ROLES]}>
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
      <Route
        path="/update-transit"
        element={
          <ProtectedRoute requiredRoles={TRANSPORT_ROLES}>
            <DashboardLayout><UpdateTransit /></DashboardLayout>
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
        path="/org-approval"
        element={
          <ProtectedRoute requiredRoles={ADMIN_ROLES}>
            <DashboardLayout><OrgApproval /></DashboardLayout>
          </ProtectedRoute>
        }
      />
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
        element={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
            <h1>🚫 Không có quyền truy cập</h1>
            <p>Tài khoản của bạn không đủ quyền hạn để xem trang này.</p>
          </div>
        }
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
