import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import MetaMaskModal from '../../../components/MetaMaskModal/MetaMaskModal';
import organizationService from '../../../services/api/organizationService';
import './RiskManagement.css';

export default function RiskManagement() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null); // { org, action: 'ban' | 'verify' }
  const [status, setStatus] = useState('idle');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: orgs = [], isLoading } = useQuery({
    queryKey: ['adminOrgs'],
    queryFn: organizationService.getAllOrganizations
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, newStatus }) => {
      return await organizationService.updateOrgStatus(id, newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrgs'] });
      setIsModalOpen(false);
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    },
    onError: (err) => {
      console.error(err);
      alert('Có lỗi xảy ra: ' + err.message);
      setIsModalOpen(false);
      setStatus('idle');
    }
  });

  const handleActionClick = (org, action) => {
    setModalAction({ org, action });
    setIsModalOpen(true);
  };

  const handleSign = () => {
    setStatus('signing');
    const newStatus = modalAction.action === 'ban' ? 'BANNED' : 'VERIFIED';
    updateMutation.mutate({ id: modalAction.org.id, newStatus });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'VERIFIED': return <span className="badge success">Đang hoạt động</span>;
      case 'PENDING': return <span className="badge warning">Chờ duyệt</span>;
      case 'BANNED': return <span className="badge error">Đã khóa</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  const filteredOrgs = orgs.filter(o => 
    o.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.orgWalletAddress?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: orgs.length,
    pending: orgs.filter(o => o.status === 'PENDING').length,
    banned: orgs.filter(o => o.status === 'BANNED').length
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
        <h2>Thao tác Thành công!</h2>
        <p>Trạng thái của Tổ chức đã được cập nhật an toàn trên Blockchain.</p>
        <button className="btn-primary mt-3" onClick={() => setStatus('idle')}>Quay lại danh sách</button>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Quản trị Rủi ro & Tổ chức</h1>
        <p className="page-subtitle">Hệ thống giám sát và phê duyệt các tổ chức tham gia mạng lưới</p>
      </div>

      <div className="risk-dashboard">
        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-label">Tổng số Tổ chức</span>
            <span className="stat-value text-primary">{stats.total}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Chờ duyệt</span>
            <span className="stat-value" style={{color: '#eab308'}}>{stats.pending}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Tài khoản bị Khóa</span>
            <span className="stat-value" style={{color: '#ef4444'}}>{stats.banned}</span>
          </div>
        </div>

        <div className="table-card mt-4">
          <div className="card-header">
            <h3>Danh sách Tổ chức trên Mạng lưới</h3>
            <div className="search-box">
              <input 
                type="text" 
                placeholder="Tìm kiếm mã ví, tên tổ chức..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="table-responsive">
            {isLoading ? (
               <div style={{ padding: '2rem', textAlign: 'center' }}><span className="spinner"></span> Đang tải dữ liệu...</div>
            ) : filteredOrgs.length === 0 ? (
               <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Không tìm thấy tổ chức nào.</div>
            ) : (
              <table className="risk-table">
                <thead>
                  <tr>
                    <th>Tên Tổ chức</th>
                    <th>Vai trò</th>
                    <th>Điểm uy tín (Trust)</th>
                    <th>Trạng thái</th>
                    <th>Địa chỉ Ví (Wallet)</th>
                    <th>Thao tác On-chain</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrgs.map(org => (
                    <tr key={org.id} className={org.status === 'BANNED' ? 'row-banned' : ''}>
                      <td>
                        <div className="user-info">
                          <strong>{org.name}</strong>
                          <span className="text-muted text-sm">{org.taxCode ? `MST: ${org.taxCode}` : 'Chưa có MST'}</span>
                        </div>
                      </td>
                      <td>{org.orgType === 'FARM' ? 'Nông trại' : org.orgType === 'TRANSPORTER' ? 'Vận chuyển' : org.orgType === 'RETAILER' ? 'Bán lẻ' : org.orgType}</td>
                      <td>
                        <div className="score-bar-container">
                          <div 
                            className={`score-bar ${org.reputationScore > 80 ? 'good' : org.reputationScore > 50 ? 'avg' : 'bad'}`}
                            style={{ width: `${org.reputationScore || 0}%` }}
                          ></div>
                          <span className="score-text">{org.reputationScore || 0}/100</span>
                        </div>
                      </td>
                      <td>{getStatusBadge(org.status)}</td>
                      <td className="issue-cell">
                        <code style={{ fontSize: '0.8rem', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                          {org.orgWalletAddress ? `${org.orgWalletAddress.substring(0,6)}...${org.orgWalletAddress.substring(38)}` : 'N/A'}
                        </code>
                      </td>
                      <td>
                        <div className="action-buttons">
                          {org.status === 'PENDING' && (
                            <button 
                              className="btn-sm btn-outline-success"
                              onClick={() => handleActionClick(org, 'verify')}
                              style={{ border: '1px solid #10b981', color: '#10b981', background: 'transparent' }}
                            >
                              Duyệt (Verify)
                            </button>
                          )}
                          {org.status === 'VERIFIED' && (
                            <button 
                              className="btn-sm btn-outline-danger"
                              onClick={() => handleActionClick(org, 'ban')}
                              style={{ border: '1px solid #ef4444', color: '#ef4444', background: 'transparent' }}
                            >
                              Khóa (Ban)
                            </button>
                          )}
                          {org.status === 'BANNED' && (
                            <button 
                              className="btn-sm btn-outline-primary"
                              onClick={() => handleActionClick(org, 'verify')}
                              style={{ border: '1px solid #3b82f6', color: '#3b82f6', background: 'transparent' }}
                            >
                              Mở khóa (Unban)
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <MetaMaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSignSuccess={handleSign}
        // Truyền dummy hash để simulate on-chain identity updates (nếu contract có hàm tương ứng)
        batchId={`ORG-${modalAction?.org?.taxCode || 'XXXX'}`}
        onchainHash="0x0000000000000000000000000000000000000000000000000000000000000000"
      />
    </div>
  );
}
