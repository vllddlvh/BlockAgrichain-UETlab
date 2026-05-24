import { useEffect, useState, useRef } from 'react';
import MetaMaskModal from '../../../components/MetaMaskModal/MetaMaskModal';
import { Html5QrcodeScanner } from 'html5-qrcode';
import batchService from '../../../services/api/batchService';
import ipfsService from '../../../services/api/ipfsService';
import './TransferOwnership.css';

export default function TransferOwnership() {
  const [scannedBatch, setScannedBatch] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [status, setStatus] = useState('idle');
  const [isLoading, setIsLoading] = useState(false);
  const [actionType, setActionType] = useState('TRANSFER'); // 'TRANSFER' or 'UPDATE_TRANSIT'

  // States for Transit Update
  const [temperature, setTemperature] = useState('');
  const [humidity, setHumidity] = useState('');
  const [gps, setGps] = useState('11.9404° N, 108.4583° E');
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

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
            
            // Logic to determine action type
            // Assuming if it's already IN_TRANSIT, we just update checkpoints
            if (batch.status === 'IN_TRANSIT') {
               setActionType('UPDATE_TRANSIT');
            } else {
               setActionType('TRANSFER');
            }
          } catch (error) {
            console.error(error);
            alert('Không tìm thấy dữ liệu lô hàng từ mã QR này!');
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

  const handleActionClick = (e) => {
    if (e) e.preventDefault();
    if (actionType === 'UPDATE_TRANSIT') {
      // Just simulate blockchain anchor for transit update via the same modal
      // Or in a real app, maybe transit events don't need a separate anchor if not required
      // But we will use the modal for consistency
      setIsModalOpen(true);
    } else {
      setIsModalOpen(true);
    }
  };

  const handleSign = async () => {
    setStatus('signing');
    try {
      if (actionType === 'TRANSFER') {
        // Cập nhật trạng thái thành Đang vận chuyển
        await batchService.updateBatchStatus(scannedBatch.id, 'IN_TRANSIT');
        
        // Ghi nhận sự kiện chuyển giao
        await batchService.appendEvent(scannedBatch.id, {
          eventType: 'TRANSPORT',
          metadata: {
            action: 'Nhận bàn giao vận chuyển',
            status: 'Bắt đầu hành trình'
          }
        });
      } else {
        // UPDATE_TRANSIT logic
        let imageCid = null;
        if (selectedImage) {
          const ipfsRes = await ipfsService.uploadFile(selectedImage);
          imageCid = ipfsRes.ipfsHash;
        }

        await batchService.appendEvent(scannedBatch.id, {
          eventType: 'TRANSPORT',
          gpsLatitude: 11.9404,
          gpsLongitude: 108.4583,
          imageCids: imageCid ? [imageCid] : [],
          metadata: {
            action: 'Cập nhật Trạm tiếp theo',
            temperature: `${temperature}°C`,
            humidity: `${humidity}%`
          }
        });
      }

      setIsModalOpen(false);
      setStatus('success');
    } catch (e) {
      console.error(e);
      alert('Có lỗi xảy ra khi cập nhật lô hàng!');
      setIsModalOpen(false);
      setStatus('idle');
    }
  };

  const resetScanner = () => {
    setStatus('idle');
    setScannedBatch(null);
    setTemperature('');
    setHumidity('');
    setSelectedImage(null);
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
        <h2>{actionType === 'TRANSFER' ? 'Chuyển giao Sở hữu Thành công!' : 'Cập nhật Hành trình Thành công!'}</h2>
        <p>Bản ghi cập nhật lô hàng <strong>#{scannedBatch?.batchCode}</strong> đã được lưu an toàn trên Blockchain.</p>
        <button className="btn-primary mt-3" onClick={resetScanner}>Tiếp tục Quét QR</button>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Giao nhận & Hành trình (Nhà Vận Chuyển)</h1>
        <p className="page-subtitle">Quét QR để nhận bàn giao lô hàng hoặc cập nhật thông tin trên đường đi</p>
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
              <button className="btn-secondary mt-2" onClick={resetScanner}>Quét lại lô khác</button>
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
                <span className="info-label">Trạng thái hiện tại:</span>
                <span className="info-value font-semibold" style={{ color: actionType === 'UPDATE_TRANSIT' ? '#f39c12' : '#2980b9' }}>
                  {scannedBatch.status}
                </span>
              </div>
              
              {actionType === 'TRANSFER' ? (
                <div className="action-area mt-4">
                  <p className="warning-note">Lô hàng này đã sẵn sàng để bàn giao. Bằng việc xác nhận, bạn sẽ chính thức nhận quyền sở hữu để vận chuyển lô hàng này.</p>
                  <button className="btn-primary w-100" onClick={handleActionClick}>Xác nhận Nhận hàng (Ký Ví)</button>
                </div>
              ) : (
                <form className="transit-form mt-4" onSubmit={handleActionClick} style={{ borderTop: '1px solid #eee', paddingTop: '15px' }}>
                  <h4 style={{ marginBottom: '15px', color: '#2c3e50' }}>Cập nhật Trạm kiểm tra</h4>
                  <div className="form-group" style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#7f8c8d' }}>Nhiệt độ (°C)</label>
                    <input type="number" placeholder="Vd: 4" value={temperature} onChange={e => setTemperature(e.target.value)} required style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                  </div>
                  <div className="form-group" style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#7f8c8d' }}>Độ ẩm (%)</label>
                    <input type="number" placeholder="Vd: 85" value={humidity} onChange={e => setHumidity(e.target.value)} required style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                  </div>
                  <div className="form-group" style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#7f8c8d' }}>Ảnh cập nhật (IPFS)</label>
                    <input type="file" ref={fileInputRef} onChange={e => setSelectedImage(e.target.files[0])} accept="image/*" style={{ display: 'block', width: '100%', fontSize: '0.9rem' }} />
                  </div>
                  
                  <button type="submit" className="btn-primary w-100 mt-3" disabled={status === 'signing'}>
                    {status === 'signing' ? 'Đang tải...' : 'Ghi nhận Nhật ký (Ký Ví)'}
                  </button>
                </form>
              )}
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
        // Use mock data for signing transit events if needed, or don't ask for MM for simple events
        // Since we are reusing the modal, we can pass dummy hashes if not anchoring
        batchId={scannedBatch?.batchCode}
        onchainHash={scannedBatch?.onchainHash || '0x' + '1'.repeat(64)}
      />
    </div>
  );
}
