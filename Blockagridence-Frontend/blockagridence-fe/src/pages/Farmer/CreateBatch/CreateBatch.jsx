import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import masterDataService from '../../../services/api/masterDataService';
import productService from '../../../services/api/productService';
import batchService from '../../../services/api/batchService';
import ipfsService from '../../../services/api/ipfsService';
import { QRCodeSVG } from 'qrcode.react';
import './CreateBatch.css';

export default function CreateBatch() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [status, setStatus] = useState('idle'); // idle, uploading, signing, success
  const [errorMsg, setErrorMsg] = useState('');
  const [createdBatchId, setCreatedBatchId] = useState('');

  // Form State
  const [batchCode, setBatchCode] = useState(`BATCH-${new Date().getTime()}`);
  const [productId, setProductId] = useState('');
  const [productType, setProductType] = useState('RAW_MATERIAL');
  const [initialQuantity, setInitialQuantity] = useState('');
  const [unitId, setUnitId] = useState('');
  
  // Metadata State for the first EVENT
  const [plantingDate, setPlantingDate] = useState('');
  const [fertilizer, setFertilizer] = useState('');
  const [gps, setGps] = useState('11.9404° N, 108.4583° E');
  const [selectedFile, setSelectedFile] = useState(null);

  // Fetch Master Data
  const { data: units = [] } = useQuery({
    queryKey: ['masterUnits'],
    queryFn: masterDataService.getUnits
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: productService.getProducts
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productId || !unitId || !initialQuantity || !plantingDate) {
      setErrorMsg('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }
    setErrorMsg('');

    try {
      setStatus('uploading');
      
      let imageCid = null;
      if (selectedFile) {
        const ipfsRes = await ipfsService.uploadFile(selectedFile);
        imageCid = ipfsRes.ipfsHash;
      }

      setStatus('signing'); // Đổi state để báo đang gọi API

      // 1. Tạo Lô hàng
      const batchRequest = {
        batchCode,
        productId,
        productType,
        initialQuantity: parseFloat(initialQuantity),
        unitId
      };
      const createdBatch = await batchService.createBatch(batchRequest);
      setCreatedBatchId(createdBatch.id);

      // 2. Bắn sự kiện (Event) khởi tạo đầu tiên kèm metadata
      const eventRequest = {
        eventType: 'FARMING_ACTIVITY',
        metadata: {
          planting_date: plantingDate,
          fertilizer: fertilizer
        },
        imageCids: imageCid ? [imageCid] : []
      };
      
      // Parse GPS string to numbers if possible (đơn giản hóa)
      if (gps) {
        eventRequest.gpsLatitude = 11.9404;
        eventRequest.gpsLongitude = 108.4583;
      }

      await batchService.appendEvent(createdBatch.id, eventRequest);

      setStatus('success');
      queryClient.invalidateQueries({ queryKey: ['batches'] });

    } catch (error) {
      console.error(error);
      setErrorMsg(
        error?.response?.data?.message
        || error?.response?.data?.error
        || error.message
        || 'Có lỗi xảy ra khi tạo lô hàng.'
      );
      setStatus('idle');
    }
  };

  const resetForm = () => {
    setBatchCode(`BATCH-${new Date().getTime()}`);
    setProductId('');
    setInitialQuantity('');
    setUnitId('');
    setPlantingDate('');
    setFertilizer('');
    setSelectedFile(null);
    setStatus('idle');
    setCreatedBatchId('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const downloadQRCode = () => {
    const svg = document.getElementById("batch-qrcode");
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
      downloadLink.download = `QR_${batchCode}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  if (status === 'success') {
    const traceUrl = `${window.location.origin}/trace/${createdBatchId}`;
    return (
      <div className="page-container success-container">
        <div className="success-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <h2>Khởi tạo Lô hàng Thành công!</h2>
        <p>Mã lô hàng: <strong>{batchCode}</strong></p>
        <p>Thông tin và hình ảnh hiện trường đã được ghi nhận an toàn.</p>
        
        <div className="qr-code-section" style={{ margin: '20px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <p style={{ marginBottom: '10px', color: '#7f8c8d' }}>Mã QR truy xuất nguồn gốc:</p>
          <div style={{ background: 'white', padding: '16px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <QRCodeSVG 
              id="batch-qrcode" 
              value={traceUrl} 
              size={200} 
              level={"H"}
              includeMargin={true}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button className="btn-secondary" onClick={downloadQRCode} style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid #ccc', background: 'white', cursor: 'pointer' }}>
              Tải mã QR
            </button>
            <button className="btn-primary" onClick={resetForm} style={{ padding: '10px 20px', borderRadius: '6px', background: '#27ae60', color: 'white', border: 'none', cursor: 'pointer' }}>
              Tạo lô hàng mới
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Khởi tạo Lô hàng</h1>
        <p className="page-subtitle">Chọn sản phẩm từ danh mục, nhập số lượng, tọa độ GPS và hình ảnh thực tế</p>
      </div>

      <form className="batch-form" onSubmit={handleSubmit}>
        {errorMsg && <div className="error-banner mb-3">{errorMsg}</div>}
        
        <div className="form-grid">
          <div className="form-group">
            <label>Mã Lô hàng *</label>
            <input 
              type="text" 
              value={batchCode} 
              onChange={(e) => setBatchCode(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Sản Phẩm / Giống *</label>
            <select value={productId} onChange={(e) => setProductId(e.target.value)} required>
              <option value="">-- Chọn sản phẩm --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.skuCode})</option>
              ))}
            </select>
            {products.length === 0 && (
               <small className="text-muted mt-1">Chưa có sản phẩm. Hãy qua tab Quản lý Sản phẩm để tạo trước.</small>
            )}
          </div>

          <div className="form-group">
            <label>Loại Lô hàng *</label>
            <select value={productType} onChange={(e) => setProductType(e.target.value)} required>
              <option value="RAW_MATERIAL">Nguyên vật liệu (RAW_MATERIAL)</option>
              <option value="PROCESSED_FOOD">Thực phẩm chế biến (PROCESSED_FOOD)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Số lượng ban đầu *</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="number" 
                min="0.1" 
                step="any"
                placeholder="VD: 500" 
                value={initialQuantity} 
                onChange={(e) => setInitialQuantity(e.target.value)} 
                required 
                style={{ flex: 2 }}
              />
              <select 
                value={unitId} 
                onChange={(e) => setUnitId(e.target.value)} 
                required
                style={{ flex: 1 }}
              >
                <option value="">Đơn vị</option>
                {units.map(u => (
                  <option key={u.id} value={u.id}>{u.code}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Ngày Xuống Giống *</label>
            <input 
              type="date" 
              value={plantingDate}
              onChange={(e) => setPlantingDate(e.target.value)}
              required 
            />
          </div>

          <div className="form-group">
            <label>Phân Bón Sử Dụng</label>
            <input 
              type="text" 
              placeholder="Vd: Hữu cơ sinh học" 
              value={fertilizer}
              onChange={(e) => setFertilizer(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Tọa Độ GPS (Tự động lấy)</label>
            <div className="gps-input">
              <input type="text" value={gps} readOnly />
              <button type="button" className="btn-gps">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="form-group mt-4">
          <label>Hình Ảnh Hiện Trường (IPFS)</label>
          <div className="image-upload-area" onClick={() => fileInputRef.current?.click()} style={{ cursor: 'pointer' }}>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }}
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files[0])}
            />
            {selectedFile ? (
              <div>
                <p className="font-semibold text-primary">{selectedFile.name}</p>
                <p className="text-muted text-sm mt-1">Nhấp để chọn ảnh khác</p>
              </div>
            ) : (
              <>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <p>Nhấp để tải lên ảnh chụp thực tế tại vườn</p>
              </>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary btn-large" disabled={status !== 'idle'}>
            {status === 'uploading' ? 'Đang tải ảnh...' : status === 'signing' ? 'Đang lưu Dữ liệu...' : 'Khởi tạo Lô hàng'}
          </button>
        </div>
      </form>
    </div>
  );
}
