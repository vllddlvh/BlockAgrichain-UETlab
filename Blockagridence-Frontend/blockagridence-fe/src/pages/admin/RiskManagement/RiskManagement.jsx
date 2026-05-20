import { useState } from 'react';
import MetaMaskModal from '../../../components/MetaMaskModal/MetaMaskModal';
import './RiskManagement.css';

export default function RiskManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  
  const [users, setUsers] = useState([
    { id: 'USR-102', name: 'HTX Nông nghiệp Đà Lạt', role: 'Nông dân', score: 98, status: 'active', flags: 0 },
    { id: 'USR-305', name: 'DV Vận chuyển ABC', role: 'Vận chuyển', score: 95, status: 'active', flags: 0 },
    { id: 'USR-401', name: 'Kho bãi Miền Nam', role: 'Vận chuyển', score: 65, status: 'warning', flags: 2, issue: 'Sai lệch nhiệt độ quá 3 lần' },
    { id: 'USR-502', name: 'Đại lý Nông sản X', role: 'Bán lẻ', score: 30, status: 'flagged', flags: 5, issue: 'Nghi ngờ làm giả mã QR' }
  ]);

  const handleActionClick = (user, action) => {
    setModalAction({ user, action });
    setIsModalOpen(true);
  };

  const handleSign = () => {
    setTimeout(() => {
      setIsModalOpen(false);
      
      // Update state locally to simulate effect
      setUsers(users.map(u => {
        if (u.id === modalAction.user.id) {
          if (modalAction.action === 'flag') return { ...u, flags: u.flags + 1, status: 'warning' };
          if (modalAction.action === 'ban') return { ...u, status: 'banned' };
        }
        return u;
      }));
      setModalAction(null);
    }, 2000);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active': return <span className="badge success">Đang hoạt động</span>;
      case 'warning': return <span className="badge warning">Cảnh báo</span>;
      case 'flagged': return <span className="badge pending">Nghi vấn cao</span>;
      case 'banned': return <span className="badge error">Đã khóa</span>;
      default: return null;
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Quản trị Rủi ro & Điểm Uy tín</h1>
        <p className="page-subtitle">Hệ thống giám sát và đào thải tự động các tài khoản gian lận dữ liệu</p>
      </div>

      <div className="risk-dashboard">
        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-label">Tổng số Tài khoản</span>
            <span className="stat-value text-primary">1,245</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Cảnh báo (Tháng này)</span>
            <span className="stat-value" style={{color: '#eab308'}}>12</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Tài khoản bị Khóa</span>
            <span className="stat-value" style={{color: '#ef4444'}}>3</span>
          </div>
        </div>

        <div className="table-card mt-4">
          <div className="card-header">
            <h3>Danh sách Giám sát Đặc biệt</h3>
            <div className="search-box">
              <input type="text" placeholder="Tìm kiếm mã ví, tên tài khoản..." />
            </div>
          </div>
          
          <div className="table-responsive">
            <table className="risk-table">
              <thead>
                <tr>
                  <th>Tài khoản</th>
                  <th>Vai trò</th>
                  <th>Điểm uy tín (Trust Score)</th>
                  <th>Trạng thái</th>
                  <th>Ghi chú vi phạm</th>
                  <th>Thao tác On-chain</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className={user.status === 'banned' ? 'row-banned' : ''}>
                    <td>
                      <div className="user-info">
                        <strong>{user.name}</strong>
                        <span className="text-muted text-sm">{user.id}</span>
                      </div>
                    </td>
                    <td>{user.role}</td>
                    <td>
                      <div className="score-bar-container">
                        <div 
                          className={`score-bar ${user.score > 80 ? 'good' : user.score > 50 ? 'avg' : 'bad'}`}
                          style={{ width: `${user.score}%` }}
                        ></div>
                        <span className="score-text">{user.score}/100</span>
                      </div>
                    </td>
                    <td>{getStatusBadge(user.status)}</td>
                    <td className="issue-cell">{user.issue || '-'}</td>
                    <td>
                      {user.status !== 'banned' && (
                        <div className="action-buttons">
                          <button 
                            className="btn-sm btn-outline-warning"
                            onClick={() => handleActionClick(user, 'flag')}
                          >
                            Cắm cờ (Flag)
                          </button>
                          <button 
                            className="btn-sm btn-outline-danger"
                            onClick={() => handleActionClick(user, 'ban')}
                          >
                            Khóa tài khoản
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <MetaMaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSign={handleSign}
      />
    </div>
  );
}
