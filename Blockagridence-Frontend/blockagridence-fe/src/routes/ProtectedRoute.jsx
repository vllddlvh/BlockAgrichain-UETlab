import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';

/**
 * Bảo vệ route: chỉ cho phép truy cập nếu đã xác thực
 * Nếu chưa đăng nhập → redirect về /login (kèm returnUrl)
 * @param {{ children: ReactNode, requiredRoles?: string[] }} props
 */
export default function ProtectedRoute({ children, requiredRoles = [] }) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Kiểm tra role nếu được chỉ định
  if (requiredRoles.length > 0) {
    const userRoles = user?.roles || [];
    const hasRequiredRole = requiredRoles.some((role) => userRoles.includes(role));
    
    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Chặn user  // Nếu tổ chức chưa được duyệt, cấm truy cập mọi trang ngoại trừ /certificates
  const lockedStatuses = ['REGISTERED', 'PENDING_APPROVAL', 'REJECTED'];
  if (lockedStatuses.includes(user?.orgStatus) && !location.pathname.startsWith('/certificates')) {
    return <Navigate to="/certificates" replace />;
  }

  return children;
}
