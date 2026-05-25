import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import MetaMaskModal from '../../../components/MetaMaskModal/MetaMaskModal';
import batchService from '../../../services/api/batchService';
import masterDataService from '../../../services/api/masterDataService';
import { Select, Input, Button, message, Form, Tabs } from 'antd';
import { EnvironmentOutlined, SwapOutlined, EditOutlined } from '@ant-design/icons';
import './UpdateTransit.css';

export default function UpdateTransit() {
  const queryClient = useQueryClient();
  const [formTransit] = Form.useForm();
  const [formTransfer] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [status, setStatus] = useState('idle');
  const [gpsLocation, setGpsLocation] = useState('');
  const [gettingGps, setGettingGps] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState(null);
  const [actionType, setActionType] = useState(null); // 'TRANSIT' or 'TRANSFER'

  // MetaMask signing states
  const [signingBatchId, setSigningBatchId] = useState(null);
  const [signingBatchDbId, setSigningBatchDbId] = useState(null);
  const [hashToSign, setHashToSign] = useState(null);

  // Lấy danh sách lô hàng ĐÃ NHẬN (READY_FOR_SALE) của Vận chuyển
  const { data: myBatches = [], isLoading: isLoadingBatches } = useQuery({
    queryKey: ['batches'],
    queryFn: batchService.getBatches
  });

  const { data: orgs = [] } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => masterDataService.getOrganizations()
  });

  // Chỉ lấy lô hàng mà Vận chuyển đang sở hữu và có thể cập nhật/chuyển giao
  const ownedBatches = useMemo(() => {
    return (Array.isArray(myBatches) ? myBatches : []).filter(
      b => b.status === 'READY_FOR_SALE'
    );
  }, [myBatches]);

  const selectedBatch = useMemo(() => {
    return ownedBatches.find(b => b.id === selectedBatchId);
  }, [ownedBatches, selectedBatchId]);

  const transitMutation = useMutation({
    mutationFn: async (payload) => {
      const eventResponse = await batchService.appendEvent(selectedBatchId, payload);
      return { ...selectedBatch, onchainHash: eventResponse.onchainHash };
    },
    onSuccess: (updatedBatch) => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      
      // Mở Modal Ký MetaMask
      setSigningBatchId(updatedBatch.batchCode);
      setSigningBatchDbId(selectedBatchId);
      setHashToSign(updatedBatch.onchainHash);
      setIsModalOpen(true);
    },
    onError: (err) => {
      message.error(err.response?.data?.message || err.message || 'Lỗi cập nhật');
    }
  });

  const transferMutation = useMutation({
    mutationFn: async (targetOrgId) => {
      const response = await batchService.transferBatch(selectedBatchId, targetOrgId);
      return { ...selectedBatch, onchainHash: response.onchainHash };
    },
    onSuccess: (updatedBatch) => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      
      // Mở Modal Ký MetaMask
      setSigningBatchId(updatedBatch.batchCode);
      setSigningBatchDbId(selectedBatchId);
      setHashToSign(updatedBatch.onchainHash);
      setIsModalOpen(true);
    },
    onError: (err) => {
      message.error(err.response?.data?.message || err.message || 'Lỗi chuyển giao');
    }
  });

  const confirmAnchorMutation = useMutation({
    mutationFn: async ({ txHash }) => {
      return await batchService.confirmBlockchainAnchor(signingBatchDbId, { txHash, dataHash: hashToSign });
    },
    onSuccess: () => {
      message.success(`Xác nhận ${actionType === 'TRANSIT' ? 'Hành trình' : 'Bàn giao'} và Neo Blockchain thành công!`);
      setIsModalOpen(false);
      setStatus(actionType === 'TRANSIT' ? 'success_transit' : 'success_transfer');
      
      if (actionType === 'TRANSIT') {
        formTransit.resetFields();
        setGpsLocation('');
      } else {
        formTransfer.resetFields();
        setSelectedBatchId(null);
      }
      
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
        setStatus(actionType === 'TRANSIT' ? 'success_transit' : 'success_transfer');
      } else if (errorCode === 2106) {
        message.error('Hash dữ liệu không khớp giữa FE và BE. Vui lòng thử lại.');
      } else if (errorCode === 2107) {
        message.error('Không xác minh được hash trên smart contract. Kiểm tra Hardhat node.');
      } else {
        message.error(errorMsg);
      }
    }
  });

  const handleGetGps = () => {
    setGettingGps(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude.toFixed(6);
          const lng = position.coords.longitude.toFixed(6);
          setGpsLocation(`${lat}° N, ${lng}° E`);
          setGettingGps(false);
        },
        (error) => {
          console.error("Error getting location: ", error);
          message.error("Không thể lấy tọa độ GPS. Vui lòng cấp quyền vị trí.");
          setGettingGps(false);
        }
      );
    } else {
      message.error("Trình duyệt của bạn không hỗ trợ Geolocation.");
      setGettingGps(false);
    }
  };

  const handleSubmitTransit = () => {
    if (!selectedBatchId) {
      message.error('Vui lòng chọn một lô hàng!');
      return;
    }
    if (!gpsLocation) {
      message.error('Vui lòng lấy tọa độ GPS!');
      return;
    }
    setActionType('TRANSIT');
    
    const values = formTransit.getFieldsValue();
    transitMutation.mutate({
      eventType: 'TRANSPORTING',
      metadata: {
        action: 'Cập nhật trạm kiểm tra',
        temperature: values.temperature,
        humidity: values.humidity,
        gps: gpsLocation,
        note: values.note || ''
      }
    });
  };

  const handleSubmitTransfer = () => {
    if (!selectedBatchId) {
      message.error('Vui lòng chọn một lô hàng để bàn giao!');
      return;
    }
    setActionType('TRANSFER');
    
    const values = formTransfer.getFieldsValue();
    transferMutation.mutate(values.targetOrgId);
  };

  const handleSignSuccess = (txHash) => {
    confirmAnchorMutation.mutate({ txHash });
  };

  if (status.startsWith('success')) {
    return (
      <div className="page-container success-container">
        <div className="success-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <h2>{status === 'success_transit' ? 'Cập nhật Hành trình Thành công!' : 'Bàn giao Thành công!'}</h2>
        <p>{status === 'success_transit' ? 'Bản ghi điều kiện bảo quản và GPS đã được lưu vĩnh viễn trên Blockchain.' : 'Lô hàng đã được đẩy sang trạng thái Đang Vận Chuyển tới Siêu thị!'}</p>
        <button className="btn-primary mt-3" onClick={() => setStatus('idle')}>Tiếp tục làm việc</button>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Quản lý Hành trình & Bàn giao</h1>
        <p className="page-subtitle">Cập nhật GPS/nhiệt độ trên đường đi hoặc Bàn giao hàng cho Siêu thị</p>
      </div>

      <div className="transit-layout">
        <div className="batch-context">
          <div className="context-card">
            <h3>Chọn lô hàng của bạn</h3>
            <Select
              showSearch
              placeholder="Chọn lô hàng..."
              style={{ width: '100%', marginBottom: '16px' }}
              loading={isLoadingBatches}
              value={selectedBatchId}
              onChange={(val) => setSelectedBatchId(val)}
              options={ownedBatches.map(b => ({
                value: b.id,
                label: `${b.batchCode} - ${b.productName} (${b.currentQuantity} ${b.unitCode})`
              }))}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />

            {selectedBatch && (
              <>
                <div className="context-item mt-3">
                  <span className="label">Mã Lô:</span>
                  <span className="value text-primary font-semibold">{selectedBatch.batchCode}</span>
                </div>
                <div className="context-item">
                  <span className="label">Sản phẩm:</span>
                  <span className="value">{selectedBatch.productName}</span>
                </div>
                <div className="context-item">
                  <span className="label">Khối lượng:</span>
                  <span className="value">{selectedBatch.currentQuantity} {selectedBatch.unitCode}</span>
                </div>
                <div className="context-item">
                  <span className="label">Trạng thái:</span>
                  <span className="badge pending">Trong kho Vận chuyển</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="actions-card" style={{ flex: 1, minWidth: '0', background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <Tabs defaultActiveKey="1" items={[
            {
              key: '1',
              label: <span><EditOutlined /> Cập nhật Trạm kiểm tra</span>,
              children: (
                <Form form={formTransit} layout="vertical" className="transit-form" onFinish={handleSubmitTransit} style={{ marginTop: '16px' }}>
                  <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <Form.Item
                      name="temperature"
                      label="Nhiệt độ thùng xe (°C)"
                      rules={[{ required: true, message: 'Vui lòng nhập nhiệt độ' }]}
                    >
                      <Input type="number" suffix="°C" placeholder="Vd: 4" />
                    </Form.Item>

                    <Form.Item
                      name="humidity"
                      label="Độ ẩm (%)"
                      rules={[{ required: true, message: 'Vui lòng nhập độ ẩm' }]}
                    >
                      <Input type="number" suffix="%" placeholder="Vd: 85" />
                    </Form.Item>

                    <Form.Item label="Tọa độ GPS" required style={{ gridColumn: '1 / -1' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Input value={gpsLocation} readOnly placeholder="Nhấn nút để lấy tọa độ" />
                        <Button type="primary" icon={<EnvironmentOutlined />} onClick={handleGetGps} loading={gettingGps}>
                          Lấy GPS
                        </Button>
                      </div>
                    </Form.Item>

                    <Form.Item name="note" label="Ghi chú thêm" style={{ gridColumn: '1 / -1' }}>
                      <Input.TextArea rows={2} placeholder="Vd: Tắc đường tại trạm thu phí..." />
                    </Form.Item>
                  </div>

                  <div className="form-actions" style={{ marginTop: '24px' }}>
                    <Button type="primary" htmlType="submit" style={{ width: '100%', height: '48px', fontSize: '16px' }} disabled={!selectedBatchId || transitMutation.isPending}>
                      {transitMutation.isPending ? 'Đang xử lý...' : 'Ghi nhận Nhật ký (Ký Blockchain)'}
                    </Button>
                  </div>
                </Form>
              )
            },
            {
              key: '2',
              label: <span><SwapOutlined /> Bàn giao cho Siêu thị</span>,
              children: (
                <Form form={formTransfer} layout="vertical" onFinish={handleSubmitTransfer} style={{ marginTop: '16px' }}>
                  <div className="warning-note" style={{ marginBottom: '24px' }}>
                    Chức năng này dùng khi bạn đã chở hàng tới điểm tập kết của Siêu thị/Nhà bán lẻ. Thao tác này sẽ đẩy lô hàng sang trạng thái chờ đối tác xác nhận.
                  </div>
                  
                  <Form.Item 
                    name="targetOrgId" 
                    label="Chọn Đối tác (Nhà Bán Lẻ)" 
                    rules={[{ required: true, message: 'Vui lòng chọn đối tác nhận hàng' }]}
                  >
                    <Select
                      showSearch
                      placeholder="Tìm kiếm đối tác..."
                      options={orgs.map(org => ({ value: org.id, label: org.name }))}
                      filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                      size="large"
                    />
                  </Form.Item>

                  <div className="form-actions" style={{ marginTop: '24px' }}>
                    <Button type="primary" htmlType="submit" style={{ width: '100%', height: '48px', fontSize: '16px', background: '#fa8c16', borderColor: '#fa8c16' }} disabled={!selectedBatchId || transferMutation.isPending}>
                      {transferMutation.isPending ? 'Đang xử lý...' : 'Xác nhận Bàn giao (Ký Ví)'}
                    </Button>
                  </div>
                </Form>
              )
            }
          ]} />
        </div>
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
