import { useState } from 'react';
import MetaMaskModal from '../../../components/MetaMaskModal/MetaMaskModal';
import './RetailDashboard.css';

export default function RetailDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [status, setStatus] = useState('idle');

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const handleSign = () => {
    setStatus('signing');
    setTimeout(() => {
      setIsModalOpen(false);
      setStatus('success');
    }, 2000);
  };

  if (status === 'success') {
    return (
      <div className="page-container success-container">
        <div className="success-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <h2>Lên Kệ Thành công!</h2>
        <p>Lô hàng <strong>#BATCH-88902</strong> đã sẵn sàng phục vụ người tiêu dùng. Trạng thái đã được xác thực trên chuỗi khối.</p>
        <button className="btn-primary mt-3" onClick={() => setStatus('idle')}>Quản lý lô hàng khác</button>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Quản lý Phân phối</h1>
        <p className="page-subtitle">Đóng gói, dán nhãn lại và cập nhật trạng thái "Lên kệ"</p>
      </div>

      <div className="dashboard-grid">
        <div className="inventory-list">
          <h3>Hàng Trong Kho</h3>
          <div className="inventory-card active">
            <div className="card-top">
              <span className="batch-id">BATCH-88902</span>
              <span className="badge pending">Trong kho</span>
            </div>
            <h4>Dâu tây New Zealand</h4>
            <p className="text-muted text-sm">Nhập lúc: 13/05/2026 - 08:30 AM</p>
          </div>
          <div className="inventory-card">
            <div className="card-top">
              <span className="batch-id">BATCH-88901</span>
              <span className="badge success">Đã Lên Kệ</span>
            </div>
            <h4>Dưa lưới Đế Vương</h4>
            <p className="text-muted text-sm">Nhập lúc: 12/05/2026 - 15:00 PM</p>
          </div>
        </div>

        <form className="retail-form" onSubmit={handleSubmit}>
          <h3>Cập nhật Trạng thái Lô: BATCH-88902</h3>
          
          <div className="form-group">
            <label>Tình trạng đóng gói (Tùy chọn)</label>
            <select className="form-select">
              <option>Giữ nguyên bao bì gốc (10kg/thùng)</option>
              <option>Đóng gói lại (Hộp 500g)</option>
              <option>Đóng gói lại (Hộp 1kg)</option>
            </select>
          </div>

          <div className="form-group mt-3">
            <label>Trạng thái phân phối</label>
            <div className="status-options">
              <label className="radio-option">
                <input type="radio" name="status" value="storage" defaultChecked />
                <span>Lưu kho lạnh</span>
              </label>
              <label className="radio-option active-option">
                <input type="radio" name="status" value="shelf" />
                <span>Lên kệ (On-shelf)</span>
              </label>
            </div>
          </div>

          <div className="form-group mt-3">
            <label>Vị trí trưng bày (Tùy chọn)</label>
            <input type="text" placeholder="Vd: Quầy trái cây tươi, Tầng 1" />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary w-100">
              Cập nhật & Ký xác thực
            </button>
          </div>
        </form>
      </div>

      <MetaMaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSign={handleSign}
      />
    </div>
  );
}
