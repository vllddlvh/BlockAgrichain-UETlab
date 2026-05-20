import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import organizationService from '../../services/api/organizationService';
import './Register.css';

const ORG_TYPES = [
  { value: 'FARM',       label: '🌾 Nông trại / HTX Nông nghiệp' },
  { value: 'TRANSPORTER',label: '🚚 Đơn vị Vận chuyển / Logistics' },
  { value: 'RETAILER',   label: '🛒 Nhà bán lẻ / Siêu thị' },
];

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    orgWalletAddress: '',
    name: '',
    taxCode: '',
    representativeName: '',
    addressDetail: '',
    orgType: '',
    adminEmail: '',
    adminPassword: '',
    adminConfirmPassword: '',
    adminFullName: '',
  });
  const [formError, setFormError] = useState('');

  const mutation = useMutation({
    mutationFn: (data) => organizationService.register(data),
    onSuccess: () => {
      navigate('/login', {
        state: { message: 'Đăng ký thành công! Vui lòng chờ Quản trị viên phê duyệt tổ chức của bạn.' },
      });
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.';
      setFormError(message);
    },
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormError('');
  };

  const connectMetaMask = async () => {
    if (!window.ethereum) {
      setFormError('MetaMask chưa được cài đặt. Vui lòng cài tiện ích MetaMask cho trình duyệt.');
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setForm({ ...form, orgWalletAddress: accounts[0] });
    } catch {
      setFormError('Người dùng từ chối kết nối ví MetaMask.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (form.adminPassword !== form.adminConfirmPassword) {
      setFormError('Mật khẩu xác nhận không khớp.');
      return;
    }
    if (!form.orgType) {
      setFormError('Vui lòng chọn loại tổ chức.');
      return;
    }

    const { adminConfirmPassword, ...submitData } = form;
    mutation.mutate(submitData);
  };

  return (
    <div className="auth-form-container register-container">
      <div className="auth-header">
        <h3>Đăng ký Tổ chức</h3>
        <p>Tạo tài khoản quản trị cho tổ chức của bạn trên BlockAgridence</p>
      </div>

      {formError && (
        <div className="error-banner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        {/* ====== THÔNG TIN TỔ CHỨC ====== */}
        <div className="form-section-title">Thông tin Tổ chức</div>

        <div className="form-group">
          <label>Địa chỉ Ví MetaMask (Định danh On-chain) *</label>
          <div className="wallet-input-group">
            <input
              name="orgWalletAddress"
              type="text"
              placeholder="0x..."
              value={form.orgWalletAddress}
              onChange={handleChange}
              required
            />
            <button type="button" className="btn-connect-wallet" onClick={connectMetaMask}>
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
                alt="MetaMask"
                width="18"
                height="18"
              />
              Kết nối
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>Tên Tổ chức *</label>
          <input name="name" type="text" placeholder="Vd: HTX Nông nghiệp Đà Lạt" value={form.name} onChange={handleChange} required />
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label>Mã số Thuế</label>
            <input name="taxCode" type="text" placeholder="Vd: 5800123456" value={form.taxCode} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Người đại diện</label>
            <input name="representativeName" type="text" placeholder="Họ và tên" value={form.representativeName} onChange={handleChange} />
          </div>
        </div>

        <div className="form-group">
          <label>Địa chỉ</label>
          <input name="addressDetail" type="text" placeholder="Địa chỉ chi tiết" value={form.addressDetail} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Loại Tổ chức *</label>
          <div className="org-type-grid">
            {ORG_TYPES.map((type) => (
              <label
                key={type.value}
                className={`org-type-option ${form.orgType === type.value ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name="orgType"
                  value={type.value}
                  checked={form.orgType === type.value}
                  onChange={handleChange}
                />
                {type.label}
              </label>
            ))}
          </div>
        </div>

        {/* ====== THÔNG TIN ADMIN ====== */}
        <div className="form-section-title mt-4">Tài khoản Quản trị viên</div>

        <div className="form-group">
          <label>Họ và tên Admin *</label>
          <input name="adminFullName" type="text" placeholder="Nhập họ và tên" value={form.adminFullName} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Email Admin *</label>
          <input name="adminEmail" type="email" placeholder="admin@example.com" value={form.adminEmail} onChange={handleChange} required autoComplete="email" />
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label>Mật khẩu *</label>
            <input name="adminPassword" type="password" placeholder="Ít nhất 8 ký tự" value={form.adminPassword} onChange={handleChange} required autoComplete="new-password" />
          </div>
          <div className="form-group">
            <label>Xác nhận Mật khẩu *</label>
            <input name="adminConfirmPassword" type="password" placeholder="Nhập lại mật khẩu" value={form.adminConfirmPassword} onChange={handleChange} required />
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={mutation.isPending}>
          {mutation.isPending ? (
            <span className="loading-content">
              <span className="spinner"></span>
              Đang đăng ký...
            </span>
          ) : 'Đăng ký Tổ chức'}
        </button>
      </form>

      <div className="auth-footer">
        <p>Đã có tài khoản? <Link to="/login" className="btn-link">Đăng nhập</Link></p>
      </div>
    </div>
  );
}
