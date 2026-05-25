import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import batchService from '../../../services/api/batchService';
import masterDataService from '../../../services/api/masterDataService';
import ipfsService from '../../../services/api/ipfsService';
import MetaMaskModal from '../../../components/MetaMaskModal/MetaMaskModal';
import { QRCodeSVG } from 'qrcode.react';
import { Modal, Form, Input, Select, Button, Upload, message, Timeline, Tabs, Card, Statistic, Row, Col, Badge, Tag, InputNumber, Checkbox } from 'antd';
import { UploadOutlined, InfoCircleOutlined, ShopOutlined, CodeSandboxOutlined, UnorderedListOutlined, ScissorOutlined, LinkOutlined } from '@ant-design/icons';
import './BatchDetail.css';

const EVENT_TYPES = {
  CREATED: 'Khởi tạo',
  FARMING_ACTIVITY: 'Hoạt động Canh tác',
  HARVESTED: 'Thu hoạch',
  PROCESSING: 'Chế biến / Đóng gói',
  TRANSPORTING: 'Vận chuyển',
  STORED_AND_VERIFIED: 'Nhập kho & Kiểm định'
};

const parseMetadata = (metadata) => {
  if (!metadata) return null;
  const keyMap = {
    fertilizer: '💊 Phân bón/Thuốc BVTV',
    action: '🛠️ Hành động',
    temperature: '🌡️ Nhiệt độ (°C)',
    humidity: '💧 Độ ẩm (%)',
    note: '📝 Ghi chú',
    old_owner_org_name: '📤 Đơn vị giao',
    new_owner_org_name: '📥 Đơn vị nhận',
    transfer_type: 'Loại chuyển giao'
  };

  return (
    <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '8px', marginTop: '8px', fontSize: '0.9rem' }}>
      {Object.entries(metadata).map(([k, v]) => {
        // Skip some internal IDs
        if (k.endsWith('_id')) return null;
        return (
          <div key={k} style={{ marginBottom: '4px' }}>
            <strong>{keyMap[k] || k}:</strong> {v}
          </div>
        );
      })}
    </div>
  );
};

export default function Batches() {
  const queryClient = useQueryClient();
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [activeTab, setActiveTab] = useState('stock'); // stock, transit, history
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hashToSign, setHashToSign] = useState(null);
  const [signingBatchId, setSigningBatchId] = useState(null);
  const [signingBatchDbId, setSigningBatchDbId] = useState(null);

  // Modals state
  const [isEventModalVisible, setIsEventModalVisible] = useState(false);
  const [isTransferModalVisible, setIsTransferModalVisible] = useState(false);
  
  const [eventForm] = Form.useForm();
  const [transferForm] = Form.useForm();
  const [eventFileList, setEventFileList] = useState([]);
  const [uploadingEvent, setUploadingEvent] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState(null);
  
  const [orgSearchKeyword, setOrgSearchKeyword] = useState('');

  // Split and Merge states
  const [isSplitModalVisible, setIsSplitModalVisible] = useState(false);
  const [splitForm] = Form.useForm();
  const [autoSplitCode, setAutoSplitCode] = useState('');

  const [isMergeModalVisible, setIsMergeModalVisible] = useState(false);
  const [mergeForm] = Form.useForm();
  const [autoMergeCode, setAutoMergeCode] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);

  // Fetch danh sách lô hàng đang sở hữu
  const { data: myBatches = [], isLoading: isLoadingBatches } = useQuery({
    queryKey: ['batches'],
    queryFn: batchService.getBatches
  });

  // Fetch danh sách lịch sử
  const { data: historyBatchesData = [], isLoading: isLoadingHistory } = useQuery({
    queryKey: ['batchesHistory'],
    queryFn: batchService.getBatchHistory
  });

  // Derive categories
  const safeMyBatches = Array.isArray(myBatches) ? myBatches : [];
  const safeHistoryBatches = Array.isArray(historyBatchesData) ? historyBatchesData : [];

  const batchesInStock = useMemo(() => safeMyBatches.filter(b => b?.status !== 'IN_TRANSIT'), [safeMyBatches]);
  const batchesInTransit = useMemo(() => safeMyBatches.filter(b => b?.status === 'IN_TRANSIT'), [safeMyBatches]);
  // History = All history batches excluding those I currently own
  const historyBatches = useMemo(() => {
    const myBatchIds = new Set(safeMyBatches.map(b => b?.id));
    return safeHistoryBatches.filter(b => !myBatchIds.has(b?.id));
  }, [safeHistoryBatches, safeMyBatches]);

  // Danh sách hiển thị dựa vào Tab
  const displayBatches = useMemo(() => {
    if (activeTab === 'stock') return batchesInStock;
    if (activeTab === 'transit') return batchesInTransit;
    if (activeTab === 'history') return historyBatches;
    return [];
  }, [activeTab, batchesInStock, batchesInTransit, historyBatches]);

  // Fetch danh sách sự kiện của lô hàng đang chọn
  const { data: batchEvents = [] } = useQuery({
    queryKey: ['batchEvents', selectedBatch?.id],
    queryFn: () => batchService.getBatchEvents(selectedBatch.id),
    enabled: !!selectedBatch?.id
  });

  // Fetch danh sách tổ chức (để transfer)
  const { data: organizations = [], isFetching: isFetchingOrgs } = useQuery({
    queryKey: ['organizations', orgSearchKeyword],
    queryFn: () => masterDataService.getOrganizations(orgSearchKeyword),
    keepPreviousData: true
  });

  // Đổi trạng thái (chỉ dùng cho Đóng gói, READY_FOR_SALE)
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      return await batchService.updateBatchStatus(id, status);
    },
    onSuccess: (updatedBatch) => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      setSelectedBatch(updatedBatch);
      
      if ((updatedBatch.status === 'READY_FOR_SALE' || updatedBatch.status === 'DEPLETED') && updatedBatch.onchainHash) {
        setSigningBatchId(updatedBatch.batchCode);
        setSigningBatchDbId(updatedBatch.id);
        setHashToSign(updatedBatch.onchainHash);
        setIsModalOpen(true);
      }
    }
  });

  // Nhận hàng (Receive)
  const receiveMutation = useMutation({
    mutationFn: async (id) => {
      return await batchService.receiveBatch(id);
    },
    onSuccess: (updatedBatch) => {
      message.success('Đã xác nhận nhập kho thành công!');
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['batchEvents', updatedBatch.id] });
      setSelectedBatch(updatedBatch);
    },
    onError: (err) => {
      message.error(err.response?.data?.message || err.message || 'Lỗi xác nhận nhập kho');
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

  // Ghi nhật ký
  const eventMutation = useMutation({
    mutationFn: async (payload) => {
      return await batchService.appendEvent(selectedBatch.id, payload);
    },
    onSuccess: () => {
      message.success('Ghi nhận nhật ký thành công!');
      setIsEventModalVisible(false);
      eventForm.resetFields();
      setEventFileList([]);
      setSelectedEventType(null);
      queryClient.invalidateQueries({ queryKey: ['batchEvents', selectedBatch.id] });
    },
    onError: (err) => {
      message.error(err.message || 'Lỗi khi ghi sự kiện');
    }
  });

  // Chuyển giao
  const transferMutation = useMutation({
    mutationFn: async ({ targetOrgId }) => {
      return await batchService.transferBatch(selectedBatch.id, targetOrgId);
    },
    onSuccess: () => {
      message.success('Chuyển giao thành công! Lô hàng đang được vận chuyển (IN_TRANSIT).');
      setIsTransferModalVisible(false);
      transferForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['batchesHistory'] });
      setSelectedBatch(null);
    },
    onError: (err) => {
      message.error(err.response?.data?.message || err.message || 'Lỗi khi chuyển giao lô hàng');
    }
  });

  const handleTransferSubmit = (values) => {
    transferMutation.mutate(values);
  };

  // Tách lô
  const splitMutation = useMutation({
    mutationFn: async (values) => {
      const payload = {
        parentBatchId: selectedBatch.id,
        children: [
          {
            newBatchCode: autoSplitCode,
            targetOrgId: selectedBatch.currentOwnerOrgId,
            quantity: values.quantityToSplit
          }
        ]
      };
      return await batchService.splitBatch(payload);
    },
    onSuccess: () => {
      message.success('Tách lô thành công!');
      setIsSplitModalVisible(false);
      splitForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['batchEvents', selectedBatch.id] });
    },
    onError: (err) => {
      message.error(err.response?.data?.message || err.message || 'Lỗi khi tách lô');
    }
  });

  const handleSplitSubmit = (values) => {
    splitMutation.mutate(values);
  };

  const handleOpenSplitModal = () => {
    const code = `${selectedBatch.batchCode}-S-${Date.now().toString().slice(-4)}`;
    setAutoSplitCode(code);
    setIsSplitModalVisible(true);
    splitForm.setFieldsValue({
      newBatchCode: code,
      quantityToSplit: null
    });
  };

  // Gộp lô
  const mergeMutation = useMutation({
    mutationFn: async (values) => {
      const parentList = selectedRows.map(row => ({
        batchId: row.id,
        quantityUsed: row.currentQuantity
      }));
      const payload = {
        newBatchCode: autoMergeCode,
        newProductId: selectedRows[0].productId,
        productType: selectedRows[0].productType || 'RAW_MATERIAL',
        producedQuantity: values.producedQuantity,
        unitId: selectedRows[0].unitId,
        parents: parentList
      };
      return await batchService.mergeBatches(payload);
    },
    onSuccess: () => {
      message.success('Gộp lô thành công!');
      setIsMergeModalVisible(false);
      mergeForm.resetFields();
      setSelectedRowKeys([]);
      setSelectedRows([]);
      queryClient.invalidateQueries({ queryKey: ['batches'] });
    },
    onError: (err) => {
      message.error(err.response?.data?.message || err.message || 'Lỗi khi gộp lô');
    }
  });

  const handleMergeSubmit = (values) => {
    mergeMutation.mutate(values);
  };

  const handleOpenMergeModal = () => {
    const firstProductId = selectedRows[0].productId;
    const isSameProduct = selectedRows.every(row => row.productId === firstProductId);
    
    if (!isSameProduct) {
      message.error('Chỉ có thể gộp các lô của cùng một sản phẩm!');
      return;
    }

    const code = `MB-${Date.now()}`;
    setAutoMergeCode(code);
    
    const totalQty = selectedRows.reduce((sum, row) => sum + Number(row.currentQuantity), 0);

    setIsMergeModalVisible(true);
    mergeForm.setFieldsValue({
      newBatchCode: code,
      producedQuantity: totalQty
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CREATED': return <Tag color="blue">Mới tạo</Tag>;
      case 'GROWING': return <Tag color="cyan">Đang canh tác</Tag>;
      case 'READY_FOR_SALE': return <Tag color="success">TRONG KHO (SẴN SÀNG)</Tag>;
      case 'IN_TRANSIT': return <Tag color="warning">Đang vận chuyển</Tag>;
      case 'DELIVERED': return <Tag color="processing">Đã giao hàng</Tag>;
      case 'DISTRIBUTED': return <Tag color="purple">Đã phân phối</Tag>;
      case 'DEPLETED': return <Tag color="default">Đã xuất hết / Tiêu hao</Tag>;
      default: return <Tag color="default">{status}</Tag>;
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
      message.success(`Đã lưu lên blockchain và xác nhận thành công!`);
    } catch (error) {
      alert(`Blockchain transaction đã mined nhưng backend chưa xác nhận được proof.\nTx Hash: ${txHash}\nLỗi: ${error?.response?.data?.message || error.message}`);
    }
  };

  const downloadQRCode = () => {
    if (!selectedBatch) return;
    const svg = document.getElementById("batch-qrcode-" + selectedBatch.id);
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `QR_${selectedBatch.batchCode}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleEventSubmit = async (values) => {
    try {
      setUploadingEvent(true);
      const cids = [];
      for (const file of eventFileList) {
        if (file.originFileObj) {
          const res = await ipfsService.uploadFile(file.originFileObj);
          cids.push(res.ipfsHash);
        }
      }
      
      const payload = {
        eventType: values.eventType,
        metadata: {
          note: values.note,
          ...(values.action && { action: values.action }),
          ...(values.fertilizer && { fertilizer: values.fertilizer }),
          ...(values.temperature && { temperature: values.temperature }),
          ...(values.humidity && { humidity: values.humidity })
        },
        imageCids: cids
      };
      eventMutation.mutate(payload);
    } catch (err) {
      message.error('Lỗi khi tải ảnh lên IPFS');
    } finally {
      setUploadingEvent(false);
    }
  };

  return (
    <div className="page-container" style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#1f2937', marginBottom: '8px' }}>📦 Quản lý Xuất xưởng</h1>
        <p style={{ color: '#6b7280', margin: 0 }}>Quản lý lô hàng trong kho, tiếp nhận từ đối tác và truy xuất nhật ký.</p>
      </div>

      <Row gutter={24}>
        {/* CỘT TRÁI: Danh sách Lô hàng chia Tabs */}
        <Col span={8}>
          <Card bordered={false} bodyStyle={{ padding: 0 }} style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <Tabs 
              activeKey={activeTab} 
              onChange={setActiveTab} 
              centered
              style={{ background: 'white' }}
              tabBarStyle={{ margin: 0, borderBottom: '1px solid #f0f0f0' }}
            >
              <Tabs.TabPane tab={<span><ShopOutlined /> Trong Kho ({batchesInStock.length})</span>} key="stock" />
              <Tabs.TabPane tab={<span><Badge count={batchesInTransit.length} offset={[10, 0]}><CodeSandboxOutlined /> Chờ nhận</Badge></span>} key="transit" />
              <Tabs.TabPane tab={<span><UnorderedListOutlined /> Lịch sử xuất ({historyBatches.length})</span>} key="history" />
            </Tabs>

            <div style={{ padding: '16px', background: '#fafafa', height: 'calc(100vh - 220px)', overflowY: 'auto' }}>
              {(isLoadingBatches || isLoadingHistory) ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Đang tải dữ liệu...</div>
              ) : displayBatches.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Không có lô hàng nào.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {activeTab === 'stock' && selectedRowKeys.length >= 2 && (
                    <Button type="primary" block icon={<LinkOutlined />} onClick={handleOpenMergeModal}>
                      🔗 Gộp Lô Hàng ({selectedRowKeys.length} lô đã chọn)
                    </Button>
                  )}
                  {displayBatches.map(batch => (
                    <div 
                      key={batch.id} 
                      onClick={() => setSelectedBatch(batch)}
                      style={{
                        padding: '16px',
                        background: 'white',
                        border: `1px solid ${selectedBatch?.id === batch.id ? '#1890ff' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        boxShadow: selectedBatch?.id === batch.id ? '0 0 0 2px rgba(24,144,255,0.2)' : '0 1px 2px rgba(0,0,0,0.05)',
                        transition: 'all 0.2s',
                        position: 'relative'
                      }}
                    >
                      {activeTab === 'stock' && batch.status === 'READY_FOR_SALE' && (
                        <div style={{ position: 'absolute', top: '16px', right: '16px' }} onClick={e => e.stopPropagation()}>
                          <Checkbox 
                            checked={selectedRowKeys.includes(batch.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedRowKeys(prev => [...prev, batch.id]);
                                setSelectedRows(prev => [...prev, batch]);
                              } else {
                                setSelectedRowKeys(prev => prev.filter(id => id !== batch.id));
                                setSelectedRows(prev => prev.filter(row => row.id !== batch.id));
                              }
                            }}
                          />
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', paddingRight: activeTab === 'stock' ? '24px' : '0' }}>
                        <strong style={{ fontSize: '15px', color: '#111827' }}>{batch.batchCode}</strong>
                        {activeTab !== 'stock' && getStatusBadge(batch.status)}
                      </div>
                      <div style={{ fontSize: '13px', color: '#6b7280', display: 'flex', justifyContent: 'space-between' }}>
                        <span>🛒 {batch.productName}</span>
                        <span style={{ fontWeight: 500, color: '#374151' }}>{batch.currentQuantity} {batch.unitCode}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </Col>

        {/* CỘT PHẢI: Chi tiết Lô hàng */}
        <Col span={16}>
          {selectedBatch ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Card 1: Product Info & Metrics */}
              <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                <Row gutter={24} align="middle">
                  <Col span={16}>
                    <h2 style={{ margin: '0 0 8px 0', fontSize: '20px' }}>{selectedBatch.batchCode}</h2>
                    <p style={{ margin: 0, color: '#6b7280' }}>Sản phẩm: <strong>{selectedBatch.productName}</strong></p>
                    <p style={{ margin: '4px 0 0 0', color: '#6b7280' }}>
                      Sở hữu hiện tại: <strong>{selectedBatch.currentOwnerOrgName}</strong> 
                      {activeTab === 'history' && <span style={{ color: '#ef4444', marginLeft: '8px' }}>(Đã chuyển giao)</span>}
                    </p>
                  </Col>
                  <Col span={8}>
                    <div style={{ background: '#f3f4f6', padding: '12px 16px', borderRadius: '8px', textAlign: 'right' }}>
                      <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Trạng thái</div>
                      <div style={{ marginTop: '4px' }}>{getStatusBadge(selectedBatch.status)}</div>
                      <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e5e7eb', paddingTop: '8px' }}>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>Khối lượng:</span>
                        <strong style={{ fontSize: '16px' }}>{selectedBatch.currentQuantity} / {selectedBatch.initialQuantity} {selectedBatch.unitCode}</strong>
                      </div>
                    </div>
                  </Col>
                </Row>
                
                {/* Action Buttons */}
                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #f0f0f0', display: 'flex', gap: '12px' }}>
                  {activeTab === 'transit' ? (
                    <Button type="primary" size="large" onClick={() => receiveMutation.mutate(selectedBatch.id)} loading={receiveMutation.isPending}>
                      📦 Xác nhận Nhập kho
                    </Button>
                  ) : activeTab === 'stock' ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      <Button type="primary" onClick={() => setIsEventModalVisible(true)}>
                        📝 Ghi Nhật ký
                      </Button>
                      <Button danger onClick={() => setIsTransferModalVisible(true)}>
                        🤝 Chuyển giao
                      </Button>
                      {selectedBatch.status !== 'DEPLETED' && selectedBatch.status !== 'IN_TRANSIT' && (
                        <Button icon={<ScissorOutlined />} onClick={handleOpenSplitModal}>
                          ✂️ Tách Lô
                        </Button>
                      )}
                      <Button 
                        onClick={() => handleUpdateStatus(selectedBatch, 'READY_FOR_SALE')}
                        disabled={updateStatusMutation.isPending || selectedBatch.status === 'READY_FOR_SALE'}
                      >
                        ✅ Xuất bán
                      </Button>
                    </div>
                  ) : null}
                </div>
              </Card>

              {/* Card 2: Tabs Info */}
              <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', flex: 1 }}>
                <Tabs defaultActiveKey="timeline">
                  <Tabs.TabPane tab="Nhật ký Sự kiện (Timeline)" key="timeline">
                    <div style={{ padding: '16px 24px', maxHeight: '500px', overflowY: 'auto' }}>
                      {Array.isArray(batchEvents) && batchEvents.length > 0 ? (
                        <Timeline mode="left">
                          {batchEvents.map(event => (
                            <Timeline.Item key={event.id} color={event.eventType === 'CREATED' ? 'green' : 'blue'}>
                              <div style={{ marginBottom: '4px' }}>
                                <strong style={{ fontSize: '16px' }}>{EVENT_TYPES[event.eventType] || event.eventType}</strong>
                                <span style={{ marginLeft: '12px', color: '#888', fontSize: '13px' }}>{new Date(event.createdAt).toLocaleString('vi-VN')}</span>
                              </div>
                              <div style={{ color: '#666', fontSize: '13px', marginBottom: '8px' }}>Bởi: {event.createdBy}</div>
                              
                              {parseMetadata(event.metadata)}

                              {event.imageCids && event.imageCids.length > 0 && (
                                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                  {event.imageCids.map(cid => (
                                    <img key={cid} src={`https://gateway.pinata.cloud/ipfs/${cid}`} alt="Event" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #eee' }} />
                                  ))}
                                </div>
                              )}
                            </Timeline.Item>
                          ))}
                        </Timeline>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                          <InfoCircleOutlined style={{ fontSize: '24px', marginBottom: '8px' }} />
                          <p>Chưa có sự kiện nào được ghi nhận.</p>
                        </div>
                      )}
                    </div>
                  </Tabs.TabPane>
                  <Tabs.TabPane tab="Mã QR Truy xuất" key="qr">
                    <div style={{ textAlign: 'center', padding: '24px' }}>
                      <h3>Mã QR Tem Nhãn Sản Phẩm</h3>
                      <p style={{ color: '#666', marginBottom: '24px' }}>In và dán mã QR này lên bao bì sản phẩm để người dùng quét.</p>
                      
                      <div style={{ background: 'white', padding: '20px', display: 'inline-block', borderRadius: '12px', border: '2px dashed #d9d9d9', marginBottom: '24px' }}>
                        <QRCodeSVG 
                          id={`batch-qrcode-${selectedBatch.id}`}
                          value={`${window.location.origin}/trace/${selectedBatch.id}`} 
                          size={220} 
                          level={"H"}
                          includeMargin={true}
                        />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                        <Button href={`${window.location.origin}/trace/${selectedBatch.id}`} target="_blank">
                          🌐 Xem Trang Truy Xuất
                        </Button>
                        <Button type="primary" onClick={downloadQRCode}>
                          ⬇️ Tải ảnh QR (.png)
                        </Button>
                      </div>
                    </div>
                  </Tabs.TabPane>
                </Tabs>
              </Card>

            </div>
          ) : (
            <Card bordered={false} style={{ height: '100%', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
              <div style={{ textAlign: 'center', color: '#9ca3af' }}>
                <ShopOutlined style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }} />
                <h3 style={{ margin: 0, fontWeight: 500 }}>Chưa chọn Lô hàng</h3>
                <p style={{ marginTop: '8px' }}>Hãy chọn một lô hàng bên trái để xem chi tiết</p>
              </div>
            </Card>
          )}
        </Col>
      </Row>

      <MetaMaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSignSuccess={handleSignSuccess}
        batchId={signingBatchId}
        onchainHash={hashToSign}
      />

      {/* DYNAMIC FORM: Ghi Sự Kiện */}
      <Modal
        title="📝 Ghi nhật ký sự kiện"
        open={isEventModalVisible}
        onCancel={() => { setIsEventModalVisible(false); eventForm.resetFields(); setEventFileList([]); setSelectedEventType(null); }}
        onOk={() => eventForm.submit()}
        confirmLoading={uploadingEvent || eventMutation.isPending}
        width={600}
      >
        <Form form={eventForm} layout="vertical" onFinish={handleEventSubmit} onValuesChange={(changedValues) => {
          if (changedValues.eventType) {
            setSelectedEventType(changedValues.eventType);
          }
        }}>
          <Form.Item name="eventType" label="Loại sự kiện" rules={[{ required: true, message: 'Vui lòng chọn loại sự kiện' }]}>
            <Select placeholder="-- Chọn sự kiện --">
              <Select.Option value="FARMING_ACTIVITY">🌱 Hoạt động Đồng ruộng (Bón phân, Phun thuốc...)</Select.Option>
              <Select.Option value="HARVESTED">🌾 Thu hoạch</Select.Option>
              <Select.Option value="PROCESSING">🏭 Chế biến / Đóng gói</Select.Option>
              <Select.Option value="STORED_AND_VERIFIED">✅ Kiểm định Kho</Select.Option>
            </Select>
          </Form.Item>

          {/* DYNAMIC FIELDS based on eventType */}
          {selectedEventType === 'FARMING_ACTIVITY' && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="action" label="Hành động" rules={[{ required: true }]}>
                  <Select placeholder="Chọn hành động">
                    <Select.Option value="Phun thuốc">Phun thuốc</Select.Option>
                    <Select.Option value="Bón phân">Bón phân</Select.Option>
                    <Select.Option value="Tưới nước">Tưới nước</Select.Option>
                    <Select.Option value="Làm cỏ">Làm cỏ</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="fertilizer" label="Tên thuốc/phân bón">
                  <Input placeholder="VD: NPK Đầu Trâu..." />
                </Form.Item>
              </Col>
            </Row>
          )}

          {(selectedEventType === 'PROCESSING' || selectedEventType === 'STORED_AND_VERIFIED') && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="temperature" label="Nhiệt độ bảo quản (°C)">
                  <Input type="number" placeholder="VD: 25" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="humidity" label="Độ ẩm (%)">
                  <Input type="number" placeholder="VD: 60" />
                </Form.Item>
              </Col>
            </Row>
          )}

          <Form.Item name="note" label="Ghi chú chi tiết" rules={[{ required: true, message: 'Vui lòng nhập ghi chú' }]}>
            <Input.TextArea rows={3} placeholder="Mô tả chi tiết công việc hoặc tình trạng..." />
          </Form.Item>

          <Form.Item label="Hình ảnh hiện trường (Tùy chọn)">
            <Upload
              listType="picture-card"
              fileList={eventFileList}
              onChange={({ fileList: newFileList }) => setEventFileList(newFileList)}
              beforeUpload={() => false}
              multiple
            >
              <div><UploadOutlined /><div style={{ marginTop: 8 }}>Chọn ảnh</div></div>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Chuyển Giao */}
      <Modal
        title="🤝 Chuyển giao quyền sở hữu Lô hàng"
        open={isTransferModalVisible}
        onCancel={() => { setIsTransferModalVisible(false); transferForm.resetFields(); }}
        onOk={() => transferForm.submit()}
        confirmLoading={transferMutation.isPending}
      >
        <div style={{ marginBottom: '16px', padding: '12px', background: '#fff2f0', border: '1px solid #ffccc7', borderRadius: '8px', color: '#cf1322' }}>
          <strong>Lưu ý quan trọng:</strong> Khi chuyển giao, lô hàng sẽ chuyển sang trạng thái <strong>Đang vận chuyển</strong>. Đối tác cần "Xác nhận Nhập kho" để hoàn tất giao dịch.
        </div>
        <Form form={transferForm} layout="vertical" onFinish={handleTransferSubmit}>
          <Form.Item name="targetOrgId" label="Chọn Tổ chức Đối tác nhận Lô hàng" rules={[{ required: true, message: 'Vui lòng chọn đối tác' }]}>
            <Select 
              showSearch
              placeholder="-- Gõ tên đối tác để tìm kiếm --"
              filterOption={false}
              onSearch={(val) => {
                clearTimeout(window.searchOrgTimeout);
                window.searchOrgTimeout = setTimeout(() => {
                  setOrgSearchKeyword(val);
                }, 500);
              }}
              notFoundContent={isFetchingOrgs ? "Đang tìm..." : "Không tìm thấy đối tác nào"}
            >
              {Array.isArray(organizations) && organizations.map(org => (
                <Select.Option key={org.id} value={org.id}>
                  {org.name} <span style={{color: '#999', fontSize: '0.8em'}}>({org.orgType})</span>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Tách Lô */}
      <Modal
        title="✂️ Tách Lô Hàng"
        open={isSplitModalVisible}
        onCancel={() => { setIsSplitModalVisible(false); splitForm.resetFields(); }}
        onOk={() => splitForm.submit()}
        confirmLoading={splitMutation.isPending}
      >
        {selectedBatch && (
          <div style={{ marginBottom: '16px', padding: '12px', background: '#f0f5ff', border: '1px solid #adc6ff', borderRadius: '8px' }}>
            Lô gốc: <strong>{selectedBatch.batchCode}</strong><br/>
            Khối lượng khả dụng: <strong>{selectedBatch.currentQuantity} {selectedBatch.unitCode}</strong>
          </div>
        )}
        <Form form={splitForm} layout="vertical" onFinish={handleSplitSubmit}>
          <Form.Item name="newBatchCode" label="Mã lô con mới (Hệ thống tự động sinh)">
            <Input disabled />
          </Form.Item>
          <Form.Item 
            name="quantityToSplit" 
            label="Khối lượng cần tách" 
            rules={[
              { required: true, message: 'Vui lòng nhập khối lượng' },
              { 
                validator: (_, value) => {
                  if (value <= 0) return Promise.reject(new Error('Khối lượng phải lớn hơn 0'));
                  if (value > selectedBatch?.currentQuantity) return Promise.reject(new Error('Vượt quá khối lượng khả dụng'));
                  return Promise.resolve();
                }
              }
            ]}
          >
            <InputNumber style={{ width: '100%' }} min={0.1} max={selectedBatch?.currentQuantity} addonAfter={selectedBatch?.unitCode} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Gộp Lô */}
      <Modal
        title="🔗 Gộp Lô Hàng"
        open={isMergeModalVisible}
        onCancel={() => { setIsMergeModalVisible(false); mergeForm.resetFields(); }}
        onOk={() => mergeForm.submit()}
        confirmLoading={mergeMutation.isPending}
        width={600}
      >
        <div style={{ marginBottom: '16px' }}>
          <h4>Các lô tham gia gộp ({selectedRows.length} lô):</h4>
          <ul style={{ paddingLeft: '20px', color: '#666' }}>
            {selectedRows.map(row => (
              <li key={row.id}><strong>{row.batchCode}</strong>: {row.currentQuantity} {row.unitCode}</li>
            ))}
          </ul>
        </div>
        <Form form={mergeForm} layout="vertical" onFinish={handleMergeSubmit}>
          <Form.Item name="newBatchCode" label="Mã lô tổng mới (Hệ thống tự động sinh)">
            <Input disabled />
          </Form.Item>
          <Form.Item 
            name="producedQuantity" 
            label="Khối lượng sau khi gộp" 
            rules={[
              { required: true, message: 'Vui lòng nhập khối lượng' },
              { type: 'number', min: 0.1, message: 'Khối lượng phải lớn hơn 0' }
            ]}
            tooltip="Khối lượng mặc định bằng tổng các lô gốc, có thể sửa đổi nếu thực tế có hao hụt"
          >
            <InputNumber style={{ width: '100%' }} addonAfter={selectedRows[0]?.unitCode} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
