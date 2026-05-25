import { useEffect, useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import MetaMaskModal from '../../../components/MetaMaskModal/MetaMaskModal';
import { Html5QrcodeScanner } from 'html5-qrcode';
import batchService from '../../../services/api/batchService';
import { Table, Input, Button, message, Space, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import './TransferOwnership.css';

export default function TransferOwnership() {
  const queryClient = useQueryClient();
  const [scannedBatch, setScannedBatch] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [status, setStatus] = useState('idle');
  const [isLoading, setIsLoading] = useState(false);
  const [manualBatchId, setManualBatchId] = useState('');
  
  // MetaMask signing states
  const [signingBatchId, setSigningBatchId] = useState(null);
  const [signingBatchDbId, setSigningBatchDbId] = useState(null);
  const [hashToSign, setHashToSign] = useState(null);

  // Lấy danh sách lô hàng chờ nhận
  const { data: myBatches = [], isLoading: isLoadingBatches } = useQuery({
    queryKey: ['batches'],
    queryFn: batchService.getBatches
  });

  const batchesInTransit = useMemo(() => {
    return (Array.isArray(myBatches) ? myBatches : []).filter(b => b?.status === 'IN_TRANSIT');
  }, [myBatches]);

  const receiveMutation = useMutation({
    mutationFn: async (id) => {
      return await batchService.receiveBatch(id);
    },
    onSuccess: (updatedBatch) => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      
      // Mở Modal Ký MetaMask với hash thực từ Backend
      setSigningBatchId(updatedBatch.batchCode);
      setSigningBatchDbId(updatedBatch.id);
      setHashToSign(updatedBatch.onchainHash);
      setIsModalOpen(true);
    },
    onError: (err) => {
      message.error(err.response?.data?.message || err.message || 'Lỗi xác nhận nhập kho');
    }
  });

  const confirmAnchorMutation = useMutation({
    mutationFn: async ({ txHash }) => {
      return await batchService.confirmBlockchainAnchor(signingBatchDbId, { txHash, dataHash: hashToSign });
    },
    onSuccess: () => {
      message.success('Đã xác nhận chuyển giao Sở hữu và Neo Blockchain thành công!');
      setIsModalOpen(false);
      setStatus('success');
      setHashToSign(null);
      setSigningBatchId(null);
      setSigningBatchDbId(null);
    },
    onError: (err) => {
      const errorCode = err.response?.data?.code;
      const errorMsg = err.response?.data?.message || err.message || 'Lỗi xác nhận neo Blockchain';
      
      if (errorCode === 2105) {
        // BLOCKCHAIN_NOT_CONFIGURED - skip verification, still save
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
            message.error('Không tìm thấy dữ liệu lô hàng từ mã QR này!');
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

  const handleManualSearch = async () => {
    if (!manualBatchId.trim()) return;
    setIsLoading(true);
    try {
      // Find by code from batchesInTransit
      const match = batchesInTransit.find(b => b.batchCode === manualBatchId.trim() || b.id === manualBatchId.trim());
      if (match) {
        setScannedBatch(match);
      } else {
        const batch = await batchService.getBatchDetail(manualBatchId.trim());
        setScannedBatch(batch);
      }
    } catch (error) {
      console.error(error);
      message.error('Không tìm thấy dữ liệu lô hàng!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = () => {
    receiveMutation.mutate(scannedBatch.id);
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
        <h2>Chuyển giao Sở hữu Thành công!</h2>
        <p>Quyền sở hữu lô hàng <strong>#{scannedBatch?.batchCode}</strong> đã được chuyển giao an toàn trên Blockchain.</p>
        <button className="btn-primary mt-3" onClick={() => { setStatus('idle'); setScannedBatch(null); }}>Tiếp tục Quét QR</button>
      </div>
    );
  }

  const columns = [
    {
      title: 'Mã Lô',
      dataIndex: 'batchCode',
      key: 'batchCode',
      render: text => <strong>{text}</strong>,
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'Khối lượng',
      key: 'quantity',
      render: (_, record) => `${record.currentQuantity} ${record.unitCode}`
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: () => <Tag color="warning">Đang chờ nhận</Tag>
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Button type="primary" onClick={() => setScannedBatch(record)}>
          Chọn lô này
        </Button>
      ),
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Chuyển giao Sở hữu (Nhà Vận Chuyển)</h1>
        <p className="page-subtitle">Quét QR hoặc chọn lô hàng từ danh sách để nhận bàn giao</p>
      </div>

      <div className="transfer-grid">
        <div className="scanner-card">
          <h3>Công cụ Tìm kiếm Lô hàng</h3>
          
          <Space.Compact style={{ width: '100%', marginBottom: '16px' }}>
            <Input 
              placeholder="Nhập mã lô hàng thủ công (VD: BATCH-123)" 
              value={manualBatchId}
              onChange={(e) => setManualBatchId(e.target.value)}
              onPressEnter={handleManualSearch}
            />
            <Button type="primary" onClick={handleManualSearch} loading={isLoading} icon={<SearchOutlined />}>
              Tìm
            </Button>
          </Space.Compact>

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
              <p><strong>Đã lấy dữ liệu thành công!</strong></p>
              <button className="btn-secondary mt-2" onClick={() => setScannedBatch(null)}>Chọn lô khác</button>
            </div>
          )}
        </div>

        <div className="result-card" style={{ flex: 1, minWidth: '0' }}>
          {scannedBatch ? (
            <>
              <h3>Thông tin Lô hàng</h3>
              <div className="batch-info-result">
                <div className="info-row">
                  <span className="info-label">Mã Lô Hàng:</span>
                  <span className="info-value font-semibold text-primary">{scannedBatch.batchCode}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Sản phẩm:</span>
                  <span className="info-value">{scannedBatch.productName}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Người bàn giao:</span>
                  <span className="info-value">{scannedBatch.currentOwnerOrgName}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Khối lượng:</span>
                  <span className="info-value">{scannedBatch.currentQuantity} {scannedBatch.unitCode}</span>
                </div>

                <div className="action-area mt-4">
                  <p className="warning-note">
                    Bằng việc xác nhận, bạn sẽ chính thức nhận quyền sở hữu lô hàng này trên Blockchain.
                  </p>
                  <button className="btn-primary w-100" onClick={handleAccept} disabled={receiveMutation.isPending}>
                    {receiveMutation.isPending ? 'Đang xử lý...' : 'Xác nhận Nhận hàng (Ký Ví)'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <h3>Danh sách Lô hàng Chờ nhận</h3>
              <Table 
                dataSource={batchesInTransit} 
                columns={columns} 
                rowKey="id"
                loading={isLoadingBatches}
                pagination={{ pageSize: 5 }}
                style={{ marginTop: '16px' }}
              />
            </>
          )}
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
