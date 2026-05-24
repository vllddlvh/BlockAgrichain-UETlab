import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import MetaMaskModal from '../../../components/MetaMaskModal/MetaMaskModal';
import batchService from '../../../services/api/batchService';
import './RetailDashboard.css';

export default function RetailDashboard() {
  const queryClient = useQueryClient();
  const [selectedBatch, setSelectedBatch] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [status, setStatus] = useState('idle');

  const [packagingType, setPackagingType] = useState('Giữ nguyên bao bì gốc');
  const [displayLocation, setDisplayLocation] = useState('');
  const [retailStatus, setRetailStatus] = useState('DELIVERED'); // 'DELIVERED' = on shelf, 'DEPLETED' = sold out

  const { data: batches = [], isLoading } = useQuery({
    queryKey: ['retailBatches'],
    queryFn: batchService.getBatches
  });

  const updateMutation = useMutation({
    mutationFn: async ({ batchId, newStatus, metadata }) => {
      // Nếu chọn Hết hàng (DEPLETED), chuyển status. Nếu không, chỉ append event.
      if (newStatus === 'DEPLETED') {
        await batchService.updateBatchStatus(batchId, 'DEPLETED');
      }
      return await batchService.appendEvent(batchId, {
        eventType: 'RETAIL',
        metadata
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retailBatches'] });
      setIsModalOpen(false);
      setStatus('success');
    },
    onError: (err) => {
      console.error(err);
      alert('Có lỗi xảy ra: ' + err.message);
      setIsModalOpen(false);
      setStatus('idle');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedBatch) return;
    setIsModalOpen(true);
  };

  const handleSign = async () => {
    setStatus('signing');
    updateMutation.mutate({
      batchId: selectedBatch.id,
      newStatus: retailStatus,
      metadata: {
        action: 'Cập nhật phân phối',
        packaging: packagingType,
        location: displayLocation || 'Không xác định',
        retailStatus: retailStatus === 'DEPLETED' ? 'Đã bán hết' : 'Đang trưng bày'
      }
    });
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
        <h2>Cập nhật Thành công!</h2>
        <p>Thông tin phân phối lô hàng <strong>#{selectedBatch?.batchCode}</strong> đã được xác thực.</p>
        <button className="btn-primary mt-3" onClick={() => { setStatus('idle'); setSelectedBatch(null); }}>Quản lý lô hàng khác</button>
      </div>
    );
  }

  // Lọc ra các lô hàng thuộc sở hữu của siêu thị
  const myBatches = batches.filter(b => b.status === 'DELIVERED' || b.status === 'DEPLETED');

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Quản lý Phân phối</h1>
        <p className="page-subtitle">Đóng gói lại, trưng bày và cập nhật trạng thái "Hết hàng"</p>
      </div>

      <div className="dashboard-grid">
        <div className="inventory-list">
          <h3>Hàng Trong Kho ({myBatches.length})</h3>
          
          {isLoading ? (
             <div className="loading-state"><span className="spinner"></span> Đang tải...</div>
          ) : myBatches.length === 0 ? (
             <div className="empty-state">Chưa có lô hàng nào. Hãy sang trang Nhập Kho quét mã QR.</div>
          ) : (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
               {myBatches.map(b => (
                 <div 
                   key={b.id} 
                   className={`inventory-card ${selectedBatch?.id === b.id ? 'active' : ''}`}
                   onClick={() => setSelectedBatch(b)}
                   style={{ cursor: 'pointer', border: selectedBatch?.id === b.id ? '2px solid #27ae60' : '1px solid #eee' }}
                 >
                   <div className="card-top">
                     <span className="batch-id">{b.batchCode}</span>
                     <span className={`badge ${b.status === 'DEPLETED' ? 'error' : 'success'}`}>
                       {b.status === 'DEPLETED' ? 'Đã Bán Hết' : 'Đang Lên Kệ'}
                     </span>
                   </div>
                   <h4>{b.product?.name}</h4>
                   <p className="text-muted text-sm">Còn lại: {b.currentQuantity} {b.unit?.code}</p>
                 </div>
               ))}
             </div>
          )}
        </div>

        <div className="result-card">
          {selectedBatch ? (
            <form className="retail-form" onSubmit={handleSubmit}>
              <h3>Cập nhật Lô: {selectedBatch.batchCode}</h3>
              
              <div className="form-group" style={{ marginTop: '15px' }}>
                <label>Tình trạng đóng gói</label>
                <select className="form-select" value={packagingType} onChange={e => setPackagingType(e.target.value)} style={{ width: '100%', padding: '10px' }}>
                  <option value="Giữ nguyên bao bì gốc">Giữ nguyên bao bì gốc</option>
                  <option value="Đóng gói lại (Khay nhỏ)">Đóng gói lại (Khay nhỏ)</option>
                  <option value="Đóng gói lại (Túi lưới)">Đóng gói lại (Túi lưới)</option>
                </select>
              </div>

              <div className="form-group mt-3" style={{ marginTop: '15px' }}>
                <label>Vị trí trưng bày</label>
                <input type="text" value={displayLocation} onChange={e => setDisplayLocation(e.target.value)} placeholder="Vd: Quầy rau hữu cơ, Tầng 1" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
              </div>

              <div className="form-group mt-3" style={{ marginTop: '15px' }}>
                <label>Trạng thái kinh doanh</label>
                <select className="form-select" value={retailStatus} onChange={e => setRetailStatus(e.target.value)} style={{ width: '100%', padding: '10px' }}>
                  <option value="DELIVERED">Đang trưng bày / Còn hàng</option>
                  <option value="DEPLETED">Đã bán hết (Kết thúc lô hàng)</option>
                </select>
              </div>

              <div className="form-actions" style={{ marginTop: '20px' }}>
                <button type="submit" className="btn-primary w-100" disabled={selectedBatch.status === 'DEPLETED'}>
                  {selectedBatch.status === 'DEPLETED' ? 'Lô hàng đã kết thúc' : 'Cập nhật & Ký xác thực'}
                </button>
              </div>
            </form>
          ) : (
             <div className="empty-state">
               <p>Vui lòng chọn một lô hàng bên trái để thao tác.</p>
             </div>
          )}
        </div>
      </div>

      <MetaMaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSignSuccess={handleSign}
        batchId={selectedBatch?.batchCode}
        onchainHash={selectedBatch?.onchainHash || '0x' + '1'.repeat(64)}
      />
    </div>
  );
}
