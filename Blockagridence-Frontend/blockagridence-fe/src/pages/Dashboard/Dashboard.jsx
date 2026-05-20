import Timeline from '../../components/Timeline/Timeline';
import './Dashboard.css';

export default function Dashboard() {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="page-title">Truy xuất Nguồn gốc Minh bạch</h1>
        <p className="page-subtitle">Quét mã lô hàng <strong>#BATCH-88902</strong> từ Nông trại đến Bàn ăn</p>
      </div>

      <div className="verification-card">
        <div className="verify-header">
          <h3>Đối soát Minh bạch (Verification)</h3>
          <span className="badge success">Khớp dữ liệu</span>
        </div>
        <div className="verify-body">
          <div className="hash-row">
            <span>Off-chain (PostgreSQL):</span>
            <code>e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</code>
          </div>
          <div className="hash-row">
            <span>On-chain (Blockchain):</span>
            <code className="highlight-hash">e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</code>
          </div>
        </div>
        <p className="verify-note">
          ✓ Dữ liệu nguyên bản, không bị can thiệp. Lịch sử được bảo vệ bởi công nghệ chuỗi khối.
        </p>
      </div>

      <div className="content-section">
        <h3 className="section-title">Dòng thời gian (Timeline)</h3>
        <Timeline />
      </div>
    </div>
  );
}
