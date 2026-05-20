import { useState } from 'react';
import MetaMaskModal from '../../../components/MetaMaskModal/MetaMaskModal';
import './TransferOwnership.css';

export default function TransferOwnership() {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedBatch, setScannedBatch] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [status, setStatus] = useState('idle');

  const startScan = () => {
    setIsScanning(true);
    // Simulate scan delay
    setTimeout(() => {
      setIsScanning(false);
      setScannedBatch({
        id: 'BATCH-88902',
        product: 'Dâu tây New Zealand',
        farmer: 'Hợp tác xã Nông nghiệp Đà Lạt',
        date: '12/05/2026'
      });
    }, 2000);
  };

  const handleAccept = () => {
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
        <h2>Chuyển giao Sở hữu Thành công!</h2>
        <p>Quyền sở hữu lô hàng <strong>#BATCH-88902</strong> đã được chuyển giao an toàn trên Blockchain.</p>
        <button className="btn-primary mt-3" onClick={() => { setStatus('idle'); setScannedBatch(null); }}>Tiếp tục Quét QR</button>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Chuyển giao Sở hữu</h1>
        <p className="page-subtitle">Quét QR nhận bàn giao lô hàng từ Nông dân (Ghi nhận On-chain)</p>
      </div>

      <div className="transfer-grid">
        <div className="scanner-card">
          <h3>Máy Quét Mã QR</h3>
          
          <div className={`scanner-viewport ${isScanning ? 'scanning' : ''}`}>
            {isScanning ? (
              <div className="scan-line"></div>
            ) : (
              <div className="scan-prompt">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <rect x="7" y="7" width="3" height="3"></rect>
                  <rect x="14" y="7" width="3" height="3"></rect>
                  <rect x="7" y="14" width="3" height="3"></rect>
                  <rect x="14" y="14" width="3" height="3"></rect>
                </svg>
                <p>Căn chỉnh mã QR vào khung hình</p>
              </div>
            )}
            <div className="corner corner-tl"></div>
            <div className="corner corner-tr"></div>
            <div className="corner corner-bl"></div>
            <div className="corner corner-br"></div>
          </div>
          
          <button 
            className="btn-primary w-100 mt-3" 
            onClick={startScan}
            disabled={isScanning}
          >
            {isScanning ? 'Đang quét...' : 'Kích hoạt Camera'}
          </button>
        </div>

        <div className="result-card">
          <h3>Thông tin Lô hàng</h3>
          
          {scannedBatch ? (
            <div className="batch-info-result">
              <div className="info-row">
                <span className="info-label">Mã Lô Hàng:</span>
                <span className="info-value font-semibold text-primary">{scannedBatch.id}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Sản phẩm:</span>
                <span className="info-value">{scannedBatch.product}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Người bàn giao:</span>
                <span className="info-value">{scannedBatch.farmer}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Ngày thu hoạch:</span>
                <span className="info-value">{scannedBatch.date}</span>
              </div>

              <div className="action-area mt-4">
                <p className="warning-note">
                  Bằng việc xác nhận, bạn sẽ chính thức nhận quyền sở hữu lô hàng này trên Blockchain.
                </p>
                <button className="btn-primary w-100" onClick={handleAccept}>
                  Xác nhận Nhận hàng (Ký Ví)
                </button>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <p>Chưa có thông tin lô hàng.</p>
              <p className="text-muted text-sm">Vui lòng quét mã QR để tải dữ liệu.</p>
            </div>
          )}
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
