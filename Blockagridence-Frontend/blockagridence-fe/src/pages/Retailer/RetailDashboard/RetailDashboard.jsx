import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import MetaMaskModal from '../../../components/MetaMaskModal/MetaMaskModal';
import batchService from '../../../services/api/batchService';
import { Form, Select, Input, Button, message, Radio } from 'antd';
import './RetailDashboard.css';

export default function RetailDashboard() {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [status, setStatus] = useState('idle');
  const [selectedBatchId, setSelectedBatchId] = useState(null);

  // MetaMask signing states
  const [signingBatchId, setSigningBatchId] = useState(null);
  const [signingBatchDbId, setSigningBatchDbId] = useState(null);
  const [hashToSign, setHashToSign] = useState(null);

  // Lấy danh sách lô hàng TRONG KHO (READY_FOR_SALE)
  const { data: myBatches = [], isLoading: isLoadingBatches } = useQuery({
    queryKey: ['batches'],
    queryFn: batchService.getBatches
  });

  const shelfBatches = useMemo(() => {
    return (Array.isArray(myBatches) ? myBatches : []).filter(
      b => b.status === 'READY_FOR_SALE'
    );
  }, [myBatches]);

  const selectedBatch = useMemo(() => {
    return shelfBatches.find(b => b.id === selectedBatchId);
  }, [shelfBatches, selectedBatchId]);

  const updateMutation = useMutation({
    mutationFn: async (payload) => {
      // 1. Ghi sự kiện
      const eventResponse = await batchService.appendEvent(selectedBatchId, {
        eventType: 'STORED_AND_VERIFIED',
        metadata: {
          action: 'Cập nhật phân phối',
          packaging: payload.packaging,
          location: payload.location,
          distStatus: payload.status
        }
      });
      // 2. Đổi trạng thái lô
      if (payload.status === 'shelf') {
        return await batchService.updateBatchStatus(selectedBatchId, 'DISTRIBUTED');
      }
      // Trả về batch/event có hash mới nhất
      return { ...selectedBatch, onchainHash: eventResponse.onchainHash };
    },
    onSuccess: (updatedBatch) => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      
      // Mở Modal Ký MetaMask với hash thực từ Backend
      setSigningBatchId(updatedBatch.batchCode);
      setSigningBatchDbId(selectedBatchId);
      setHashToSign(updatedBatch.onchainHash);
      setIsModalOpen(true);
    },
    onError: (err) => {
      message.error(err.response?.data?.message || err.message || 'Lỗi cập nhật');
    }
  });

  const confirmAnchorMutation = useMutation({
    mutationFn: async ({ txHash }) => {
      return await batchService.confirmBlockchainAnchor(signingBatchDbId, { txHash, dataHash: hashToSign });
    },
    onSuccess: () => {
      message.success('Cập nhật phân phối và Neo Blockchain thành công!');
      setIsModalOpen(false);
      setStatus('success');
      form.resetFields();
      setSelectedBatchId(null);
      setHashToSign(null);
      setSigningBatchId(null);
      setSigningBatchDbId(null);
    },
    onError: (err) => {
      const errorCode = err.response?.data?.code;
      const errorMsg = err.response?.data?.message || err.message || 'Lỗi xác nhận neo Blockchain';
      
      if (errorCode === 2105) {
        message.warning('Blockchain chưa cấu hình. Giao dịch đã được lưu ở chế độ Demo.');
        setIsModalOpen(false);
        setStatus('success');
      } else if (errorCode === 2106) {
        message.error('Hash dữ liệu không khớp giữa FE và BE. Vui lòng thử lại.');
      } else if (errorCode === 2107) {
        message.error('Không xác minh được hash trên smart contract. Kiểm tra Hardhat node.');
      } else {
        message.error(errorMsg);
      }
    }
  });

  const handleSubmit = (values) => {
    if (!selectedBatchId) {
      message.error('Vui lòng chọn một lô hàng!');
      return;
    }
    updateMutation.mutate(values);
  };

  const handleSignSuccess = (txHash) => {
    confirmAnchorMutation.mutate({ txHash });
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
        <p>Lô hàng đã sẵn sàng phục vụ người tiêu dùng. Trạng thái đã được xác thực trên chuỗi khối.</p>
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
          <h3>Hàng Trong Kho ({shelfBatches.length})</h3>
          {isLoadingBatches ? (
             <p>Đang tải dữ liệu...</p>
          ) : shelfBatches.length > 0 ? (
            shelfBatches.map(b => (
              <div 
                key={b.id} 
                className={`inventory-card ${selectedBatchId === b.id ? 'active' : ''}`}
                onClick={() => setSelectedBatchId(b.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="card-top">
                  <span className="batch-id">{b.batchCode}</span>
                  <span className="badge pending">Sẵn sàng</span>
                </div>
                <h4>{b.productName}</h4>
                <p className="text-muted text-sm">Khối lượng: {b.currentQuantity} {b.unitCode}</p>
              </div>
            ))
          ) : (
             <p className="text-muted">Không có hàng nào trong kho.</p>
          )}
        </div>

        <Form 
          form={form} 
          layout="vertical" 
          className="retail-form" 
          onFinish={handleSubmit}
          initialValues={{ status: 'shelf', packaging: 'Giữ nguyên bao bì gốc' }}
        >
          <h3>Cập nhật Trạng thái Lô hàng</h3>
          {selectedBatch ? (
            <div style={{ marginBottom: '24px', padding: '12px', background: '#f5f5f5', borderRadius: '8px' }}>
              <strong>Đang chọn: </strong> {selectedBatch.batchCode} ({selectedBatch.productName})
            </div>
          ) : (
            <div style={{ marginBottom: '24px', padding: '12px', background: '#fffbe6', borderRadius: '8px', color: '#faad14' }}>
              Vui lòng chọn một lô hàng bên cột trái.
            </div>
          )}
          
          <Form.Item name="packaging" label="Tình trạng đóng gói">
            <Select>
              <Select.Option value="Giữ nguyên bao bì gốc">Giữ nguyên bao bì gốc</Select.Option>
              <Select.Option value="Đóng gói lại (Hộp nhỏ)">Đóng gói lại (Hộp nhỏ)</Select.Option>
              <Select.Option value="Cắt lát / Sơ chế">Cắt lát / Sơ chế</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="status" label="Trạng thái phân phối" rules={[{ required: true }]}>
            <Radio.Group style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Radio.Button value="storage" style={{ textAlign: 'center' }}>Lưu kho lạnh</Radio.Button>
              <Radio.Button value="shelf" style={{ textAlign: 'center' }}>Lên kệ (On-shelf) & Xuất kho</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item name="location" label="Vị trí trưng bày (Tùy chọn)">
            <Input placeholder="Vd: Quầy trái cây tươi, Tầng 1" />
          </Form.Item>

          <div className="form-actions">
            <Button 
              type="primary" 
              htmlType="submit" 
              style={{ width: '100%', height: '48px', fontSize: '16px' }} 
              disabled={!selectedBatchId || updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Đang xử lý...' : 'Cập nhật & Ký xác thực'}
            </Button>
          </div>
        </Form>
      </div>

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
