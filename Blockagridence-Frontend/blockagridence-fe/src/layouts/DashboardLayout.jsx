import { useNavigate, useLocation, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import './DashboardLayout.css';

export default function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, getProfileConfig } = useAuthStore();

  const profile = getProfileConfig();
  const userRoles = user?.roles || [];
  const currentPath = location.pathname;

  // Role checks
  const isFarmer      = userRoles.some(r => ['FARM_ADMIN', 'FARM_STAFF'].includes(r));
  const isTransporter = userRoles.some(r => ['TRANSPORT_ADMIN', 'TRANSPORT_STAFF'].includes(r));
  const isRetailer    = userRoles.some(r => ['RETAIL_ADMIN', 'RETAIL_STAFF'].includes(r));
  const isAdmin       = userRoles.includes('SYSTEM_ADMIN');

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const navActive = (path) => currentPath === path ? 'active' : '';

  const isPending = user?.orgStatus === 'PENDING';

  return (
    <div className="layout-container">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">BA</div>
          <h2>BlockAgridence</h2>
        </div>

        {/* HỆ THỐNG — Farmer & Admin đều xem được Dashboard truy xuất */}
        {!isPending && (isFarmer || isAdmin) && (
          <div className="sidebar-section">
            <p className="sidebar-title">HỆ THỐNG</p>
            <nav className="sidebar-nav">
              <Link to="/dashboard" className={`nav-item ${navActive('/dashboard')}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                Truy xuất nguồn gốc
              </Link>
            </nav>
          </div>
        )}

        {/* NÔNG DÂN HOẶC PENDING */}
        {(isFarmer || isPending) && (
          <div className="sidebar-section">
            <p className="sidebar-title">{isPending ? 'HỒ SƠ TỔ CHỨC' : 'NGHIỆP VỤ NÔNG DÂN'}</p>
            <nav className="sidebar-nav">
              <Link to="/certificates" className={`nav-item ${navActive('/certificates')}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line>
                </svg>
                Quản lý Chứng nhận
              </Link>
              {!isPending && isFarmer && (
                <>
                  <Link to="/products" className={`nav-item ${navActive('/products')}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                      <line x1="7" y1="7" x2="7.01" y2="7"></line>
                    </svg>
                    Quản lý Sản phẩm
                  </Link>
                  <Link to="/create-batch" className={`nav-item ${navActive('/create-batch')}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line>
                    </svg>
                    Khởi tạo Lô hàng
                  </Link>
                  <Link to="/batch-detail" className={`nav-item ${navActive('/batch-detail')}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line>
                    </svg>
                    Quản lý Xuất xưởng
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}

        {/* VẬN CHUYỂN */}
        {!isPending && isTransporter && (
          <div className="sidebar-section">
            <p className="sidebar-title">NGHIỆP VỤ VẬN CHUYỂN</p>
            <nav className="sidebar-nav">
              <Link to="/transfer-ownership" className={`nav-item ${navActive('/transfer-ownership')}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
                Chuyển giao Sở hữu
              </Link>
              <Link to="/update-transit" className={`nav-item ${navActive('/update-transit')}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="3" width="15" height="13"></rect>
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                  <circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle>
                </svg>
                Nhật ký Hành trình
              </Link>
            </nav>
          </div>
        )}

        {/* NHÀ BÁN LẺ */}
        {!isPending && isRetailer && (
          <div className="sidebar-section">
            <p className="sidebar-title">NGHIỆP VỤ BÁN LẺ</p>
            <nav className="sidebar-nav">
              <Link to="/receive-goods" className={`nav-item ${navActive('/receive-goods')}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                Nhập hàng vào Kho
              </Link>
              <Link to="/retail-dashboard" className={`nav-item ${navActive('/retail-dashboard')}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
                Quản lý Phân phối
              </Link>
            </nav>
          </div>
        )}

        {/* ADMIN */}
        {!isPending && isAdmin && (
          <div className="sidebar-section">
            <p className="sidebar-title">ADMIN / CƠ QUAN QL</p>
            <nav className="sidebar-nav">
              <Link to="/org-approval" className={`nav-item ${navActive('/org-approval')}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <path d="M9 15L11 17L15 13"></path>
                </svg>
                Phê duyệt Tổ chức
              </Link>
              <Link to="/product-approval" className={`nav-item ${navActive('/product-approval')}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                  <line x1="7" y1="7" x2="7.01" y2="7"></line>
                </svg>
                Duyệt Sản phẩm
              </Link>
              <Link to="/risk-management" className={`nav-item ${navActive('/risk-management')}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                Quản trị Rủi ro
              </Link>
              <Link to="/audit" className={`nav-item ${navActive('/audit')}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <path d="M9 15L11 17L15 13"></path>
                </svg>
                Thanh tra (Audit)
              </Link>
            </nav>
          </div>
        )}

        <div className="sidebar-bottom">
          <button className="nav-item btn-logout" onClick={handleLogout}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Đăng xuất
          </button>
        </div>
      </aside>

      <div className="main-wrapper">
        <header className="topbar">
          <div className="topbar-search">
            <input type="text" placeholder="Tìm kiếm mã lô hàng, mã hash..." />
          </div>
          <div className="topbar-actions">
            <div className="system-status">
              <span className="pulse-dot"></span>
              <span>Blockchain Node: Active</span>
            </div>
            <div className="user-profile">
              <div className="avatar" style={{ backgroundColor: profile.color }}>
                {profile.init}
              </div>
              <div className="user-info-topbar">
                <span className="user-name">{user?.fullName || profile.label}</span>
                <span className="user-email">{user?.email}</span>
              </div>
            </div>
          </div>
        </header>
        <main className="content-area">
          {children}
        </main>
      </div>
    </div>
  );
}
