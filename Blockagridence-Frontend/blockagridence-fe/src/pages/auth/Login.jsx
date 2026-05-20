import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Redirect về trang trước đó nếu có (sau khi login xong)
  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    try {
      const defaultPath = await login(email, password);
      // Nếu có returnUrl → về đó, nếu không → về trang mặc định của role
      navigate(from || defaultPath, { replace: true });
    } catch {
      // Lỗi đã được set vào store bởi authStore.login()
    }
  };

  const handleConsumerScan = () => {
    navigate('/trace');
  };

  return (
    <div className="auth-form-container">
      <div className="auth-header">
        <h3>Đăng nhập Hệ thống</h3>
        <p>Truy cập nền tảng truy xuất nguồn gốc nông sản</p>
      </div>

      {error && (
        <div className="error-banner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Nhập địa chỉ email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            autoComplete="email"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Mật khẩu</label>
          <input
            id="password"
            type="password"
            placeholder="Nhập mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            autoComplete="current-password"
          />
        </div>

        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? (
            <span className="loading-content">
              <span className="spinner"></span>
              Đang đăng nhập...
            </span>
          ) : 'Đăng nhập'}
        </button>
      </form>

      <div className="divider"><span>HOẶC</span></div>

      <button className="btn-consumer-scan" onClick={handleConsumerScan} type="button">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <rect x="7" y="7" width="3" height="3"></rect>
          <rect x="14" y="7" width="3" height="3"></rect>
          <rect x="7" y="14" width="3" height="3"></rect>
          <rect x="14" y="14" width="3" height="3"></rect>
        </svg>
        Quét QR Truy xuất (Người Tiêu Dùng)
      </button>

      <div className="auth-footer">
        <p>
          Chưa có tài khoản tổ chức?{' '}
          <Link to="/register" className="btn-link">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
}
