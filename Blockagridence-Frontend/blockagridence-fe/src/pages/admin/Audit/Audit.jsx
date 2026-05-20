import { useState } from 'react';
import MetaMaskModal from '../../../components/MetaMaskModal/MetaMaskModal';
import './Audit.css';

export default function Audit() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [status, setStatus] = useState('idle');

  const handleApprove = () => {
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
        <h2>Thanh tra Chứng nhận Thành công!</h2>
        <p>Hồ sơ VietGAP của cơ sở đã được phê duyệt và lưu vĩnh viễn trạng thái hợp lệ trên Blockchain.</p>
        <button className="btn-primary mt-3" onClick={() => setStatus('idle')}>Tiếp tục Thanh tra</button>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Thanh tra Định kỳ (Audit)</h1>
        <p className="page-subtitle">Đối chiếu chứng nhận ATVSTP/VietGAP thực tế với hồ sơ lưu trữ Blockchain</p>
      </div>

      <div className="audit-grid">
        <div className="audit-list-section">
          <h3>Hồ sơ chờ duyệt (3)</h3>
          
          <div className="audit-card active">
            <div className="audit-meta">
              <span className="badge pending">Chờ thanh tra</span>
              <span className="date">14/05/2026</span>
            </div>
            <h4>Chứng nhận VietGAP 2026</h4>
            <p className="entity-name">HTX Nông nghiệp Đà Lạt</p>
          </div>
          
          <div className="audit-card">
            <div className="audit-meta">
              <span className="badge pending">Chờ thanh tra</span>
              <span className="date">12/05/2026</span>
            </div>
            <h4>Chứng nhận ATVSTP</h4>
            <p className="entity-name">Kho bãi Miền Nam</p>
          </div>
        </div>

        <div className="audit-detail-section">
          <div className="detail-header">
            <h3>Chi tiết Hồ sơ: Chứng nhận VietGAP 2026</h3>
          </div>
          
          <div className="document-preview">
            <div className="mock-doc">
              <div className="doc-seal">GIẤY CHỨNG NHẬN VietGAP</div>
              <p>Cấp cho: HTX Nông nghiệp Đà Lạt</p>
              <p>Mã số: VG-2026-889</p>
              <p>Ngày cấp: 10/05/2026</p>
              <p>Cơ quan cấp: Cục Trồng trọt</p>
              <div className="doc-signature">Đã ký dấu đỏ</div>
            </div>
          </div>

          <div className="verification-box mt-4">
            <h4>Đối soát Dữ liệu Blockchain</h4>
            <div className="hash-check">
              <div className="hash-item">
                <span className="label">Bản gốc (Tải lên bởi HTX):</span>
                <code className="text-muted">8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92</code>
              </div>
              <div className="hash-item">
                <span className="label">Bản lưu On-chain:</span>
                <code className="text-primary">8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92</code>
              </div>
            </div>
            <div className="match-status mt-2">
              <span className="badge success">✓ Trùng khớp Mã Hash</span>
              <span className="text-sm text-muted ml-2">Tài liệu chưa bị chỉnh sửa từ lúc tải lên.</span>
            </div>
          </div>

          <div className="audit-actions mt-4">
            <button className="btn-secondary w-50">
              Từ chối (Tài liệu giả mạo)
            </button>
            <button className="btn-primary w-50" onClick={handleApprove}>
              Duyệt & Ký On-chain
            </button>
          </div>
        </div>
      </div>

      <MetaMaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSign={handleSign}
      />
    </div>
  );
}
