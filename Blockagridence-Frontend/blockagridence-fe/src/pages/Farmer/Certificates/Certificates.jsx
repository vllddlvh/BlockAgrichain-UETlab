import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAuthStore from '../../../store/authStore';
import ipfsService from '../../../services/api/ipfsService';
import organizationService from '../../../services/api/organizationService';
import './Certificates.css';

export default function Certificates() {
  const { user } = useAuthStore();
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
        cid: ipfsRes.ipfsHash,
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
        <p className="page-subtitle">Tải lên giấy tờ chứng nhận ATVSTP, VietGAP (Đầu vào tin cậy)</p>
      </div>

      <div className="upload-card">
        {uploadError && <div className="error-banner mb-3">{uploadError}</div>}
        {uploadSuccess && <div className="success-banner mb-3">{uploadSuccess}</div>}
        
        <div className="upload-form-group">
          <label>Tên chứng nhận / tài liệu *</label>
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

      <div className="certs-list-container">
        <h3>Chứng nhận đã tải lên ({certificates.length})</h3>
        
        {isLoadingOrg ? (
          <div className="loading-state"><span className="spinner"></span> Đang tải dữ liệu...</div>
        ) : certificates.length === 0 ? (
          <div className="empty-state">Chưa có chứng nhận nào được tải lên.</div>
        ) : (
          <div className="certs-grid">
            {certificates.map((cert) => (
              <div key={cert.id} className="cert-card verified">
                <div className="cert-status">
                  <span className="badge success">Đã lưu trữ</span>
                </div>
                <div className="cert-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                </div>
                <h4 title={cert.documentName}>{cert.documentName}</h4>
                <p className="cid" title={cert.cid}>CID: {cert.cid.substring(0, 15)}...</p>
                <p className="date">Tải lên: {cert.expirationDate ? cert.expirationDate : 'Gần đây'}</p>
                
                <a 
                  href={`https://gateway.pinata.cloud/ipfs/${cert.cid}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="btn-link mt-2"
                  style={{ display: 'inline-block', fontSize: '0.8rem' }}
                >
                  Xem File Gốc
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
