import { useEffect, useState } from 'react';
import MetaMaskModal from '../../../components/MetaMaskModal/MetaMaskModal';
import { Html5QrcodeScanner } from 'html5-qrcode';
import batchService from '../../../services/api/batchService';
import './TransferOwnership.css';

export default function TransferOwnership() {
  const [scannedBatch, setScannedBatch] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [status, setStatus] = useState('idle');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let scanner = null;
    if (!scannedBatch && status === 'idle') {
      const initScanner = () => {
        scanner = new Html5QrcodeScanner('reader-transfer', {
          qrbox: { width: 250, height: 250 },
          fps: 5,
        }, false);

        scanner.render(async (result) => {
          scanner.clear();
          setIsLoading(true);
          try {
            let batchId = result;
            try {
              const url = new URL(result);
              if (url.pathname.startsWith('/trace/')) {
                 batchId = url.pathname.split('/').pop();
              }
            } catch(e) {}
            if (batchId.startsWith('/trace/')) batchId = batchId.replace('/trace/', '');

            const batch = await batchService.getBatchDetail(batchId);
            setScannedBatch(batch);
          } catch (error) {
            console.error(error);
            alert('Không tìm thấy dữ liệu lô hàng từ mã QR này!');
            // Re-init scanner if failed so user can try again
            setTimeout(initScanner, 500);
          } finally {
            setIsLoading(false);
          }
        }, () => {});
      };

      const timer = setTimeout(initScanner, 100);

      return () => {
        clearTimeout(timer);
        if (scanner) scanner.clear().catch(e => console.error(e));
      };
    }
  }, [scannedBatch, status]);

  const handleAccept = () => {
    setIsModalOpen(true);
  };

  const handleSign = async () => {
    setStatus('signing');
    try {
      // Cập nhật trạng thái thành Đang vận chuyển
      await batchService.updateBatchStatus(scannedBatch.id, 'IN_TRANSIT');
      
      // Ghi nhận sự kiện chuyển giao
      await batchService.appendEvent(scannedBatch.id, {
        eventType: 'TRANSPORT',
        metadata: {
          action: 'Nhận bàn giao vận chuyển',
          status: 'Đã nhận hàng'
        }
      });

      setIsModalOpen(false);
      setStatus('success');
    } catch (e) {
      console.error(e);
      alert('Có lỗi xảy ra khi cập nhật lô hàng!');
      setIsModalOpen(false);
      setStatus('idle');
    }
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
        <p>Quyền sở hữu lô hàng <strong>#{scannedBatch?.batchCode}</strong> đã được chuyển giao an toàn trên Blockchain.</p>
        <button className="btn-primary mt-3" onClick={() => { setStatus('idle'); setScannedBatch(null); }}>Tiếp tục Quét QR</button>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Chuyển giao Sở hữu (Nhà Vận Chuyển)</h1>
        <p className="page-subtitle">Quét QR nhận bàn giao lô hàng từ Nông dân (Ghi nhận On-chain)</p>
      </div>

      <div className="transfer-grid">
        <div className="scanner-card">
          <h3>Máy Quét Mã QR</h3>
          
          {!scannedBatch && !isLoading && (
             <div id="reader-transfer" style={{ width: '100%', border: 'none' }}></div>
          )}

          {isLoading && (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <span className="spinner" style={{ display: 'inline-block', width: '24px', height: '24px', border: '3px solid #ccc', borderTopColor: '#27ae60', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
              <p>Đang tải dữ liệu lô hàng...</p>
            </div>
          )}

          {scannedBatch && (
            <div style={{ padding: '2rem', textAlign: 'center', background: '#e8f8f5', borderRadius: '8px', color: '#27ae60' }}>
              <p><strong>Quét thành công!</strong></p>
              <button className="btn-secondary mt-2" onClick={() => setScannedBatch(null)}>Quét lại</button>
            </div>
          )}
        </div>

        <div className="result-card">
          <h3>Thông tin Lô hàng</h3>
          
          {scannedBatch ? (
            <div className="batch-info-result">
              <div className="info-row">
                <span className="info-label">Mã Lô Hàng:</span>
                <span className="info-value font-semibold text-primary">{scannedBatch.batchCode}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Sản phẩm:</span>
                <span className="info-value">{scannedBatch.product?.name}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Người bàn giao:</span>
                <span className="info-value">{scannedBatch.currentOwnerOrg?.name}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Khối lượng:</span>
                <span className="info-value">{scannedBatch.currentQuantity} {scannedBatch.unit?.code}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Ngày quét:</span>
                <span className="info-value">{new Date().toLocaleString('vi-VN')}</span>
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
        onSignSuccess={handleSign}
      />
    </div>
  );
}
