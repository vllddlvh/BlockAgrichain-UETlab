import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import batchService from '../../services/api/batchService';
import Timeline from '../../components/Timeline/Timeline';
import './Dashboard.css';

export default function Dashboard() {
  const { batchId } = useParams();
  const [activeTab, setActiveTab] = useState('info');

  const { data: batch, isLoading: isBatchLoading } = useQuery({
    queryKey: ['batch', batchId],
    queryFn: () => batchService.getBatchDetail(batchId),
    enabled: !!batchId, // chỉ gọi api khi có batchId
  });

  const { data: events = [], isLoading: isEventsLoading } = useQuery({
    queryKey: ['batchEvents', batchId],
    queryFn: () => batchService.getBatchEvents(batchId),
    enabled: !!batchId,
  });

  useEffect(() => {
    if (!batch?.riskStatus) return;
    window.blockAgrichainRiskContext = {
      batchCode: batch.batchCode,
      status: batch.status,
      expiryDate: batch.expiryDate,
      riskStatus: batch.riskStatus,
      riskReasons: batch.riskReasons || [],
      riskRecommendation: batch.riskRecommendation,
    };
    return () => {
      delete window.blockAgrichainRiskContext;
    };
  }, [batch]);

  if (!batchId) {
    return (
      <div className="dashboard-container" style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Vui lòng quét mã QR hoặc nhập mã lô hàng để truy xuất</h2>
      </div>
    );
  }

  if (isBatchLoading || isEventsLoading) {
    return (
      <div className="dashboard-container" style={{ textAlign: 'center', padding: '50px' }}>
        <span className="spinner" style={{ display: 'inline-block', width: '24px', height: '24px', border: '3px solid #ccc', borderTopColor: '#27ae60', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
        <p style={{ marginTop: '10px' }}>Đang tải dữ liệu truy xuất...</p>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="dashboard-container" style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Không tìm thấy lô hàng</h2>
        <p>Mã lô hàng này không tồn tại hoặc dữ liệu chưa được công khai.</p>
      </div>
    );
  }

  const showRiskWarning = batch.riskStatus === 'AT_RISK' || batch.riskStatus === 'EXPIRED';

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="page-title">Truy xuất Nguồn gốc Minh bạch</h1>
        <p className="page-subtitle">Thông tin lô hàng <strong>#{batch.batchCode}</strong> từ Nông trại đến Bàn ăn</p>
      </div>

      {showRiskWarning && (
        <div className={`risk-warning risk-warning--${batch.riskStatus === 'EXPIRED' ? 'expired' : 'warning'}`}>
          <div className="risk-warning__header">
            <strong>{batch.riskStatus === 'EXPIRED' ? 'Lô hàng đã hết hạn' : 'Lô hàng có rủi ro cần kiểm tra'}</strong>
            <span>{batch.riskStatus}</span>
          </div>
          <ul>
            {(batch.riskReasons || []).map((reason, index) => (
              <li key={index}>{reason}</li>
            ))}
          </ul>
          {batch.riskRecommendation && <p>{batch.riskRecommendation}</p>}
        </div>
      )}

      <div className="product-portal-card">
        <div className="product-image-section">
          {batch.productImageCids && batch.productImageCids.length > 0 ? (
            <img src={`https://ipfs.io/ipfs/${batch.productImageCids[0]}`} alt={batch.productName} />
          ) : (
            <div className="no-image-placeholder">Chưa có hình ảnh</div>
          )}
        </div>
        <div className="product-info-section">
          <h2 className="product-name">{batch.productName}</h2>
          <p className="company-name">{batch.creatorOrgName}</p>
          <div className="badge-row">
            <span className="badge success">SẢN PHẨM CHÍNH HÃNG</span>
          </div>
          <div className="sku-info">
            <span className="label">Mã sản phẩm</span>
            <span className="value">{batch.skuCode}</span>
          </div>
        </div>
      </div>

      <div className="tabs-container">
        <div className="tabs-header">
          <div className={`tab-item ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>Thông Tin Sản Phẩm</div>
          <div className={`tab-item ${activeTab === 'trace' ? 'active' : ''}`} onClick={() => setActiveTab('trace')}>Truy Xuất Nguồn Gốc</div>
        </div>
        <div className="tab-content">
          {activeTab === 'info' && (
            <div className="product-details-content">
              <h3>Mô tả sản phẩm</h3>
              <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{batch.productDescription || 'Chưa có thông tin mô tả chi tiết.'}</p>
              
              {batch.productAttributes && Object.keys(batch.productAttributes).length > 0 && (
                <div className="attributes-grid" style={{ marginTop: '20px' }}>
                  <h3>Đặc tính kỹ thuật</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                    {Object.entries(batch.productAttributes).map(([key, val]) => (
                      <div className="attr-row" key={key} style={{ background: '#f8f9fa', padding: '10px', borderRadius: '8px' }}>
                        <strong style={{ color: '#555' }}>{key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}:</strong> <span style={{ marginLeft: '5px', fontWeight: '600' }}>{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'trace' && (
             <div className="content-section" style={{ marginTop: '10px' }}>
               <Timeline events={events} batch={batch} />
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
