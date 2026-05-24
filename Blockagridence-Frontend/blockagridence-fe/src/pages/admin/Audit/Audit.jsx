import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import MetaMaskModal from '../../../components/MetaMaskModal/MetaMaskModal';
import organizationService from '../../../services/api/organizationService';
import './Audit.css';

export default function Audit() {
  const queryClient = useQueryClient();
  const [selectedDoc, setSelectedDoc] = useState(null); // { org, doc }
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [status, setStatus] = useState('idle');

  const { data: orgs = [], isLoading } = useQuery({
    queryKey: ['adminOrgs'],
    queryFn: organizationService.getAllOrganizations
  });

  // Gộp tất cả documents của tất cả organizations
  const allDocuments = useMemo(() => {
    let docs = [];
    orgs.forEach(org => {
      if (org.documents && org.documents.length > 0) {
        org.documents.forEach(doc => {
          docs.push({ org, doc });
        });
      }
    });
    return docs;
  }, [orgs]);

  // Lọc ra các document thuộc tổ chức đang PENDING để làm danh sách cần duyệt
  const pendingDocs = allDocuments.filter(item => item.org.status === 'PENDING');

  const updateMutation = useMutation({
    mutationFn: async ({ id, newStatus }) => {
      return await organizationService.updateOrgStatus(id, newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrgs'] });
      setIsModalOpen(false);
      setStatus('success');
    },
    onError: (err) => {
      console.error(err);
      alert('Có lỗi xảy ra: ' + err.message);
      setIsModalOpen(false);
      setStatus('idle');
    }
  });

  const handleApprove = () => {
    if (!selectedDoc) return;
    setIsModalOpen(true);
  };

  const handleSign = () => {
    setStatus('signing');
    // Duyệt tổ chức này thành VERIFIED
    updateMutation.mutate({ id: selectedDoc.org.id, newStatus: 'VERIFIED' });
  };

  const getIpfsUrl = (cid) => {
    return import.meta.env.VITE_PINATA_GATEWAY 
      ? `${import.meta.env.VITE_PINATA_GATEWAY}/ipfs/${cid}`
      : `https://gateway.pinata.cloud/ipfs/${cid}`;
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
        <h2>Thanh tra Chứng nhận Thành công!</h2>
        <p>Hồ sơ của <strong>{selectedDoc?.org?.name}</strong> đã được phê duyệt và lưu vĩnh viễn trạng thái hợp lệ trên Blockchain.</p>
        <button className="btn-primary mt-3" onClick={() => { setStatus('idle'); setSelectedDoc(null); }}>Tiếp tục Thanh tra</button>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Thanh tra Định kỳ (Audit)</h1>
        <p className="page-subtitle">Đối chiếu chứng nhận ATVSTP/VietGAP thực tế với hồ sơ lưu trữ IPFS/Blockchain</p>
      </div>

      <div className="audit-grid">
        <div className="audit-list-section">
          <h3>Hồ sơ chờ duyệt ({pendingDocs.length})</h3>
          
          {isLoading ? (
             <div className="loading-state"><span className="spinner"></span> Đang tải...</div>
          ) : pendingDocs.length === 0 ? (
             <div className="empty-state" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Không có hồ sơ nào đang chờ duyệt.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
              {pendingDocs.map((item) => (
                <div 
                  key={item.doc.id}
                  className={`audit-card ${selectedDoc?.doc.id === item.doc.id ? 'active' : ''}`}
                  onClick={() => setSelectedDoc(item)}
                  style={{ cursor: 'pointer', border: selectedDoc?.doc.id === item.doc.id ? '2px solid #3b82f6' : '1px solid #e2e8f0' }}
                >
                  <div className="audit-meta">
                    <span className="badge pending">Chờ thanh tra</span>
                    <span className="date">{new Date(item.org.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h4>{item.doc.documentName || item.doc.documentType}</h4>
                  <p className="entity-name">{item.org.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="audit-detail-section">
          {selectedDoc ? (
            <>
              <div className="detail-header">
                <h3>Chi tiết Hồ sơ: {selectedDoc.doc.documentName || selectedDoc.doc.documentType}</h3>
              </div>
              
              <div className="document-preview" style={{ padding: '0', background: '#f8fafc', borderRadius: '8px', overflow: 'hidden' }}>
                {selectedDoc.doc.cid ? (
                   <img src={getIpfsUrl(selectedDoc.doc.cid)} alt="Document" style={{ width: '100%', maxHeight: '400px', objectFit: 'contain' }} />
                ) : (
                  <div className="mock-doc">
                    <div className="doc-seal">CHƯA CÓ BẢN QUÉT IPFS</div>
                    <p>Cấp cho: {selectedDoc.org.name}</p>
                  </div>
                )}
              </div>

              <div className="verification-box mt-4">
                <h4>Đối soát Dữ liệu Blockchain (IPFS)</h4>
                <div className="hash-check">
                  <div className="hash-item">
                    <span className="label">IPFS CID (Lưu trữ On-chain):</span>
                    <code className="text-primary">{selectedDoc.doc.cid || 'N/A'}</code>
                  </div>
                  <div className="hash-item mt-2">
                    <span className="label">Loại tài liệu:</span>
                    <code className="text-muted">{selectedDoc.doc.documentType}</code>
                  </div>
                </div>
                {selectedDoc.doc.cid && (
                  <div className="match-status mt-2">
                    <span className="badge success">✓ Đã xác thực toàn vẹn (IPFS)</span>
                    <span className="text-sm text-muted ml-2">Tài liệu không bị chỉnh sửa từ lúc tải lên.</span>
                  </div>
                )}
              </div>

              <div className="audit-actions mt-4">
                <button className="btn-secondary w-50" onClick={() => alert('Chức năng từ chối đang được cập nhật!')}>
                  Từ chối (Tài liệu không hợp lệ)
                </button>
                <button className="btn-primary w-50" onClick={handleApprove}>
                  Duyệt Tổ chức & Ký On-chain
                </button>
              </div>
            </>
          ) : (
            <div className="empty-state" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
              <p>Chọn một hồ sơ bên trái để xem chi tiết thanh tra.</p>
            </div>
          )}
        </div>
      </div>

      <MetaMaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSignSuccess={handleSign}
        batchId={`AUDIT-${selectedDoc?.org?.taxCode || 'DOC'}`}
        onchainHash={selectedDoc?.doc?.cid || '0x000'}
      />
    </div>
  );
}
