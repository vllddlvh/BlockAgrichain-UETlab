import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAuthStore from '../../../store/authStore';
import ipfsService from '../../../services/api/ipfsService';
import organizationService from '../../../services/api/organizationService';
import axiosInstance from '../../../configs/axios';
import { message } from 'antd';
import './Certificates.css';

export default function Certificates() {
  const { user, updateUser } = useAuthStore();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [docName, setDocName] = useState('');

  // 1. Fetch danh sách chứng nhận của tổ chức
  const { data: orgData, isLoading: isLoadingOrg } = useQuery({
    queryKey: ['organization', user?.orgId],
    queryFn: () => organizationService.getOrganizationById(user.orgId),
    enabled: !!user?.orgId,
  });

  const certificates = orgData?.documents || [];
  
  const isRegistered = user?.orgStatus === 'REGISTERED';
  const isPendingApproval = user?.orgStatus === 'PENDING_APPROVAL';
  const isRejected = user?.orgStatus === 'REJECTED';
  const isLocked = isRegistered || isPendingApproval || isRejected;
  const isAdminUser = user?.roles?.some(r => r.endsWith('_ADMIN'));

  const submitReviewMutation = useMutation({
    mutationFn: () => axiosInstance.post(`/api/v1/organizations/${user.orgId}/submit-for-review`),
    onSuccess: () => {
      message.success({ content: 'Đã gửi yêu cầu xét duyệt thành công!', duration: 3 });
      queryClient.invalidateQueries({ queryKey: ['organization', user?.orgId] });
      updateUser({ ...user, orgStatus: 'PENDING_APPROVAL' });
    },
    onError: (error) => {
      setUploadError(error.message || 'Lỗi khi gửi yêu cầu phê duyệt');
    }
  });

  // 2. Mutation để upload file lên IPFS và lưu vào DB
  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      if (!docName.trim()) {
        throw new Error('Vui lòng nhập tên chứng nhận trước khi tải lên.');
      }
      
      // B1: Upload lên IPFS
      const ipfsRes = await ipfsService.uploadFile(file);
      
      // B2: Gọi API lưu vào DB
      const documentData = {
        documentType: 'CERTIFICATE',
        documentName: docName.trim(),
        cid: ipfsRes.IpfsHash || ipfsRes.ipfsHash,
        // expirationDate có thể thêm vào form sau nếu cần
      };
      
      await organizationService.addDocument(user.orgId, documentData);
      return ipfsRes;
    },
    onSuccess: () => {
      setUploadSuccess('Tải chứng nhận lên hệ thống thành công!');
      setUploadError('');
      setDocName('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      // Refresh danh sách chứng nhận
      queryClient.invalidateQueries({ queryKey: ['organization', user?.orgId] });
      
      // Clear success message after 3 seconds
      setTimeout(() => setUploadSuccess(''), 3000);
    },
    onError: (error) => {
      setUploadError(error.message || 'Có lỗi xảy ra khi tải file lên IPFS.');
      setUploadSuccess('');
    },
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Kiểm tra dung lượng (VD: < 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File vượt quá dung lượng cho phép (5MB).');
      return;
    }

    setUploadError('');
    uploadMutation.mutate(file);
  };

  const handleUploadClick = () => {
    if (!docName.trim()) {
      setUploadError('Vui lòng nhập Tên chứng nhận (VD: Giấy phép VietGAP) trước khi chọn file.');
      return;
    }
    fileInputRef.current?.click();
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Quản lý Chứng nhận</h1>
        <p className="page-subtitle">Tải lên giấy tờ chứng nhận pháp lý của Tổ chức (Đầu vào tin cậy)</p>
      </div>
      
      {isPendingApproval && (
        <div style={{ backgroundColor: '#eff6ff', color: '#1e40af', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid #bfdbfe' }}>
          <strong>ℹ️ Hồ sơ của bạn đang được xét duyệt.</strong>
          <p style={{ margin: '0.5rem 0 0 0' }}>Thời gian dự kiến: 1-2 ngày làm việc. Hệ thống sẽ mở khóa sau khi Ban Quản trị phê duyệt.</p>
        </div>
      )}

      {isRejected && (
        <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid #f87171' }}>
          <strong>❌ Hồ sơ của bạn đã bị từ chối.</strong>
          <p style={{ margin: '0.5rem 0 0 0' }}>Vui lòng kiểm tra lại giấy tờ và tải lên bản mới nhất.</p>
        </div>
      )}

      {isRegistered && (
        <div style={{ backgroundColor: '#fef08a', color: '#854d0e', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid #facc15' }}>
          <strong>⚠️ Tổ chức cần hoàn tất hồ sơ.</strong>
          <p style={{ margin: '0.5rem 0 0 0' }}>
            Vui lòng tải lên các giấy tờ pháp lý cần thiết, sau đó bấm <b>Hoàn tất & Gửi phê duyệt</b> ở bên dưới.
          </p>
        </div>
      )}

      {(!isAdminUser) ? (
        <div className="upload-card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '8px', border: '1px solid #f87171', display: 'inline-block' }}>
            <strong>⚠️ Không có quyền tải lên.</strong>
            <p style={{ margin: '0.5rem 0 0 0' }}>
              Chỉ Giám đốc / Quản lý (ORG_ADMIN) mới có quyền tải lên các giấy tờ chứng nhận pháp lý. Vui lòng liên hệ quản lý của bạn.
            </p>
          </div>
        </div>
      ) : isPendingApproval ? (
         <div className="upload-card" style={{ textAlign: 'center', padding: '3rem 1rem', opacity: 0.7 }}>
           <h3>Hồ sơ đã được gửi. Tính năng tải lên tạm khóa.</h3>
         </div>
      ) : (
        <div className="upload-card">
          {uploadError && <div className="error-banner mb-3">{uploadError}</div>}
          {uploadSuccess && <div className="success-banner mb-3">{uploadSuccess}</div>}
          
          <div className="upload-form-group">
            <label>Tên chứng nhận / tài liệu *</label>
            <div className="checklist-hints" style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.5rem' }}>
              {orgData?.orgType === 'FARM' && "Gợi ý: Giấy chứng nhận VietGAP / GlobalGAP"}
              {orgData?.orgType === 'FACTORY' && "Gợi ý: Chứng nhận ISO 22000 / HACCP"}
              {orgData?.orgType === 'TRANSPORTER' && "Gợi ý: Giấy phép kinh doanh vận tải / Kiểm định chất lượng"}
              {orgData?.orgType === 'RETAILER' && "Gợi ý: Giấy chứng nhận ATVSTP / Đăng ký kinh doanh"}
            </div>
            <input 
              type="text" 
              placeholder="VD: Chứng nhận VietGAP 2026, Giấy chứng nhận ATVSTP..." 
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              disabled={uploadMutation.isPending}
              className="doc-name-input"
            />
          </div>

          <div className="upload-area mt-3">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              style={{ display: 'none' }} 
              accept=".pdf,.jpg,.jpeg,.png"
            />
            
            {uploadMutation.isPending ? (
               <div className="loading-state">
                 <span className="spinner"></span>
                 <p>Đang tải file lên IPFS và đồng bộ dữ liệu...</p>
               </div>
            ) : (
              <>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="upload-icon">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <h3>Nhấn nút để chọn file</h3>
                <p>Hỗ trợ định dạng: PDF, JPG, PNG (Max 5MB)</p>
                <button 
                  className="btn-primary mt-3" 
                  onClick={handleUploadClick}
                  type="button"
                >
                  Chọn File Tải Lên
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <div className="certs-list-container">
        <h3>Chứng nhận đã tải lên ({certificates.length})</h3>
        
        {isLoadingOrg ? (
          <div className="loading-state"><span className="spinner"></span> Đang tải dữ liệu...</div>
        ) : certificates.length === 0 ? (
          <div className="empty-state">
            <p>Chưa có tài liệu nào được tải lên.</p>
          </div>
        ) : (
          <div className="certs-grid">
            {certificates.map((cert) => (
              <div className="cert-card" key={cert.id}>
                <div className="cert-card-header">
                  <div className="cert-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                  </div>
                  <span className="cert-status-badge">ĐÃ LƯU TRỮ</span>
                </div>
                <div className="cert-card-body">
                  <h4 className="cert-name">{cert.documentName}</h4>
                  <div className="cert-info">
                    <span className="info-label">CID:</span>
                    <span className="info-value cid-text" title={cert.cid}>
                      {cert.cid.substring(0, 10)}...{cert.cid.substring(cert.cid.length - 8)}
                    </span>
                  </div>
                  <div className="cert-info">
                    <span className="info-label">Tải lên:</span>
                    <span className="info-value">{cert.createdAt ? new Date(cert.createdAt).toLocaleDateString('vi-VN') : 'Gần đây'}</span>
                  </div>
                  <a href={`https://ipfs.io/ipfs/${cert.cid}`} target="_blank" rel="noreferrer" className="cert-view-link">
                    Xem File Gốc
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isAdminUser && (isRegistered || isRejected) && (
        <div style={{ textAlign: 'center', marginTop: '2rem', marginBottom: '2rem' }}>
          <button 
            className="btn-primary" 
            style={{ padding: '1rem 3rem', fontSize: '1.1rem', backgroundColor: certificates.length > 0 ? '#10b981' : '#9ca3af', border: 'none' }}
            disabled={certificates.length === 0 || submitReviewMutation.isPending}
            onClick={() => submitReviewMutation.mutate()}
          >
            {submitReviewMutation.isPending ? 'Đang gửi...' : 'Hoàn tất & Gửi phê duyệt'}
          </button>
          {certificates.length === 0 && (
            <p style={{ color: '#6b7280', marginTop: '0.5rem', fontSize: '0.9rem' }}>
              Vui lòng tải lên ít nhất 1 tài liệu trước khi gửi phê duyệt.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
