import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import batchService from '../../services/api/batchService';
import Timeline from '../../components/Timeline/Timeline';
import './Dashboard.css';

export default function Dashboard() {
  const { batchId } = useParams();

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

      <div className="verification-card">
        <div className="verify-header">
          <h3>Đối soát Minh bạch (Verification)</h3>
          <span className="badge success">Khớp dữ liệu</span>
        </div>
        <div className="verify-body">
          <div className="hash-row">
            <span>Sản phẩm:</span>
            <code>{batch.product?.name} ({batch.product?.skuCode})</code>
          </div>
          <div className="hash-row">
            <span>Blockchain Hash:</span>
            <code className="highlight-hash" style={{ wordBreak: 'break-all' }}>
              {batch.onchainHash ? batch.onchainHash : 'Đang chờ xác nhận trên chuỗi khối'}
            </code>
          </div>
        </div>
        <p className="verify-note">
          ✓ Dữ liệu nguyên bản, không bị can thiệp. Lịch sử được bảo vệ bởi công nghệ chuỗi khối.
        </p>
      </div>

      <div className="content-section">
        <h3 className="section-title">Dòng thời gian (Timeline)</h3>
        <Timeline events={events} batch={batch} />
      </div>
    </div>
  );
}
