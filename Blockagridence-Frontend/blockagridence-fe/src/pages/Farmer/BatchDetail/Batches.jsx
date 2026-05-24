import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import batchService from '../../../services/api/batchService';
import MetaMaskModal from '../../../components/MetaMaskModal/MetaMaskModal';
import './BatchDetail.css'; // Giữ nguyên file CSS cũ

export default function Batches() {
  const queryClient = useQueryClient();
  const [selectedBatch, setSelectedBatch] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hashToSign, setHashToSign] = useState(null);
  const [signingBatchId, setSigningBatchId] = useState(null);
  const [signingBatchDbId, setSigningBatchDbId] = useState(null);

  // Fetch danh sách lô hàng
  const { data: batches = [], isLoading } = useQuery({
    queryKey: ['batches'],
    queryFn: batchService.getBatches
  });

  // Đổi trạng thái lô hàng (VD: PACKAGED, DELIVERING)
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      return await batchService.updateBatchStatus(id, status);
    },
    onSuccess: (updatedBatch) => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      setSelectedBatch(updatedBatch);
      
      // Nếu trạng thái chuyển sang Sẵn sàng bán, backend sẽ gen ra onchainHash
      if ((updatedBatch.status === 'READY_FOR_SALE' || updatedBatch.status === 'DEPLETED') && updatedBatch.onchainHash) {
        setSigningBatchId(updatedBatch.batchCode);
        setSigningBatchDbId(updatedBatch.id);
        setHashToSign(updatedBatch.onchainHash);
        setIsModalOpen(true);
      }
    }
  });

  const confirmAnchorMutation = useMutation({
    mutationFn: async ({ batchId, txHash, dataHash }) => {
      return await batchService.confirmBlockchainAnchor(batchId, { txHash, dataHash });
    },
    onSuccess: (updatedBatch) => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      setSelectedBatch(updatedBatch);
      setHashToSign(null);
      setSigningBatchId(null);
      setSigningBatchDbId(null);
    }
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CREATED': return <span className="badge pending">Mới tạo</span>;
      case 'PLANTED': return <span className="badge pending">Đã gieo trồng</span>;
      case 'HARVESTED': return <span className="badge pending">Đã thu hoạch</span>;
      case 'PROCESSED': return <span className="badge pending">Đã chế biến</span>;
      case 'PACKAGED': return <span className="badge pending">Đã đóng gói</span>;
      case 'IN_TRANSIT': return <span className="badge info">Đang vận chuyển</span>;
      case 'DELIVERED': return <span className="badge info">Đã giao hàng</span>;
      case 'ON_SHELF': return <span className="badge success">Đang bán</span>;
      case 'SOLD': return <span className="badge success">Đã bán</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  const handleUpdateStatus = (batch, newStatus) => {
    updateStatusMutation.mutate({ id: batch.id, status: newStatus });
  };

  const handleSignSuccess = async (txHash) => {
    setIsModalOpen(false);
    try {
      await confirmAnchorMutation.mutateAsync({
        batchId: signingBatchDbId,
        txHash,
        dataHash: hashToSign
      });
      alert(`Đã ký, lưu lên blockchain và xác nhận backend thành công!\nTx Hash: ${txHash}`);
    } catch (error) {
      alert(`Blockchain transaction đã mined nhưng backend chưa xác nhận được proof.\nTx Hash: ${txHash}\nLỗi: ${error?.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Quản lý Xuất xưởng</h1>
        <p className="page-subtitle">Danh sách lô hàng của tổ chức, quản lý trạng thái và in mã QR.</p>
      </div>

      {isLoading ? (
        <div className="loading-state"><span className="spinner"></span> Đang tải danh sách lô hàng...</div>
      ) : batches.length === 0 ? (
        <div className="empty-state">Chưa có lô hàng nào. Hãy sang màn hình "Khởi tạo Lô hàng".</div>
      ) : (
        <div className="batch-detail-grid">
          {/* CỘT TRÁI: Danh sách Lô hàng */}
          <div className="detail-card">
            <div className="card-header">
              <h3>Danh sách Lô hàng ({batches.length})</h3>
            </div>
            
            <div className="info-list" style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {batches.map(batch => (
                <div 
                  key={batch.id} 
                  className={`batch-list-item ${selectedBatch?.id === batch.id ? 'active' : ''}`}
                  onClick={() => setSelectedBatch(batch)}
                  style={{
                    padding: '1rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: selectedBatch?.id === batch.id ? '#f0fdf4' : 'white',
                    borderColor: selectedBatch?.id === batch.id ? 'var(--primary)' : 'var(--border-color)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <strong>{batch.batchCode}</strong>
                    {getStatusBadge(batch.status)}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <span>Sản phẩm: {batch.product?.name}</span><br/>
                    <span>Khối lượng: {batch.currentQuantity} {batch.unit?.code}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CỘT PHẢI: Chi tiết và QR Code */}
          {selectedBatch ? (
            <div className="qr-card">
              <h3>Chi tiết Lô hàng: {selectedBatch.batchCode}</h3>
              <div className="info-item hash-box mt-3 mb-4">
                <span className="info-label">Current Owner Org:</span>
                <code>{selectedBatch.currentOwnerOrg?.name}</code>
              </div>
              
              <div className="batch-actions mb-4" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <p className="text-muted w-100" style={{ width: '100%', marginBottom: '0.5rem' }}>Chuyển trạng thái:</p>
                {/* Giả sử nông dân thu hoạch xong thì đóng gói */}
                <button 
                  className="btn-secondary" 
                  onClick={() => handleUpdateStatus(selectedBatch, 'PACKAGED')}
                  disabled={updateStatusMutation.isPending || selectedBatch.status === 'PACKAGED' || selectedBatch.status === 'READY_FOR_SALE'}
                >
                  📦 Đóng gói
                </button>
                <button 
                  className="btn-secondary" 
                  style={{ background: 'var(--primary)', color: 'white' }}
                  onClick={() => handleUpdateStatus(selectedBatch, 'READY_FOR_SALE')}
                  disabled={updateStatusMutation.isPending || selectedBatch.status === 'READY_FOR_SALE'}
                >
                  🚚 Sẵn sàng xuất bán
                </button>
              </div>

              <h3>Mã QR Tem Nhãn</h3>
              <p className="text-muted">In và dán mã QR này lên bao bì sản phẩm để người dùng truy xuất.</p>
              
              <div className="qr-container">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=http://localhost:5173/trace/${selectedBatch.id}`} 
                  alt="QR Code" 
                  className="qr-image"
                />
              </div>

              <div className="qr-actions">
                <a href={`http://localhost:5173/trace/${selectedBatch.id}`} target="_blank" rel="noreferrer" className="btn-secondary">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  Xem Public
                </a>
                <button className="btn-primary">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 6 2 18 2 18 9"></polyline>
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                    <rect x="6" y="14" width="12" height="8"></rect>
                  </svg>
                  In Tem
                </button>
              </div>
            </div>
          ) : (
            <div className="qr-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              Hãy chọn một lô hàng bên trái để xem chi tiết
            </div>
          )}
        </div>
      )}

      <MetaMaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSignSuccess={handleSignSuccess}
        batchId={signingBatchId}
        onchainHash={hashToSign}
      />
    </div>
  );
}
