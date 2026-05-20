import { useState } from 'react';
import MetaMaskModal from '../../../components/MetaMaskModal/MetaMaskModal';
import './UpdateTransit.css';

export default function UpdateTransit() {
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
        <h2>Cập nhật Hành trình Thành công!</h2>
        <p>Bản ghi điều kiện bảo quản và GPS đã được lưu vĩnh viễn trên Blockchain.</p>
        <button className="btn-primary mt-3" onClick={() => setStatus('idle')}>Cập nhật trạm tiếp theo</button>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Nhật ký Hành trình</h1>
        <p className="page-subtitle">Cập nhật điều kiện bảo quản, nhiệt độ, độ ẩm và định vị GPS thời gian thực</p>
      </div>

      <div className="transit-layout">
        <div className="batch-context">
          <div className="context-card">
            <h3>Lô hàng đang vận chuyển</h3>
            <div className="context-item">
              <span className="label">Mã Lô:</span>
              <span className="value text-primary font-semibold">BATCH-88902</span>
            </div>
            <div className="context-item">
              <span className="label">Tuyến đường:</span>
              <span className="value">Đà Lạt → TP.HCM</span>
            </div>
            <div className="context-item">
              <span className="label">Trạng thái:</span>
              <span className="badge pending">Đang di chuyển</span>
            </div>
          </div>
        </div>

        <form className="transit-form" onSubmit={handleSubmit}>
          <h3>Cập nhật Trạm kiểm tra</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Nhiệt độ thùng xe (°C)</label>
              <div className="input-with-icon">
                <input type="number" placeholder="Vd: 4" required />
                <span className="icon-addon">°C</span>
              </div>
            </div>
            <div className="form-group">
              <label>Độ ẩm (%)</label>
              <div className="input-with-icon">
                <input type="number" placeholder="Vd: 85" required />
                <span className="icon-addon">%</span>
              </div>
            </div>
            <div className="form-group full-width">
              <label>Tọa độ GPS (Cập nhật tự động từ thiết bị)</label>
              <div className="gps-input">
                <input type="text" value="11.2345° N, 107.8901° E (Trạm trung chuyển Định Quán)" readOnly />
                <button type="button" className="btn-gps">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </button>
              </div>
            </div>
            <div className="form-group full-width">
              <label>Hình ảnh niêm phong / Thùng hàng</label>
              <div className="image-upload-area">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <p>Tải lên ảnh chụp thực tế từ camera giám sát</p>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary w-100">
              Ghi nhận & Ký xác thực Blockchain
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
