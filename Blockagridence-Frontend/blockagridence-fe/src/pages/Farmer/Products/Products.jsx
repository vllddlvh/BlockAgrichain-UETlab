import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import masterDataService from '../../../services/api/masterDataService';
import productService from '../../../services/api/productService';
import ipfsService from '../../../services/api/ipfsService';
import './Products.css';

export default function Products() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Detail Modal State
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Form state
  const [name, setName] = useState('');
  const [skuCode, setSkuCode] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  // 1. Fetch Danh mục loại sản phẩm (MasterData)
  const { data: categories = [] } = useQuery({
    queryKey: ['masterCategories'],
    queryFn: masterDataService.getCategories
  });

  // 2. Fetch Danh sách Sản phẩm của tổ chức
  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: productService.getProducts
  });

  // 3. Mutation Tạo sản phẩm mới
  const createMutation = useMutation({
    mutationFn: async (productData) => {
      // Tải ảnh lên IPFS trước (nếu có)
      let imageCids = [];
      if (productData.imageFile) {
        const ipfsRes = await ipfsService.uploadFile(productData.imageFile);
        if (ipfsRes && ipfsRes.ipfsHash) {
          imageCids.push(ipfsRes.ipfsHash);
        }
      }
      
      const payload = {
        name: productData.name,
        skuCode: productData.skuCode,
        categoryId: productData.categoryId,
        description: productData.description,
        imageCids: imageCids
      };
      
      return await productService.createProduct(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsFormOpen(false);
      resetForm();
    },
    onError: (err) => {
      setErrorMsg(err.message || 'Lỗi khi tạo sản phẩm');
    }
  });

  const resetForm = () => {
    setName('');
    setSkuCode('');
    setCategoryId('');
    setDescription('');
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setErrorMsg('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !skuCode.trim()) {
      setErrorMsg('Vui lòng nhập Tên sản phẩm và Mã SKU');
      return;
    }
    
    createMutation.mutate({
      name,
      skuCode,
      categoryId: categoryId || null,
      description,
      imageFile
    });
  };

  const getIpfsUrl = (cid) => {
    return import.meta.env.VITE_PINATA_GATEWAY 
      ? `${import.meta.env.VITE_PINATA_GATEWAY}/ipfs/${cid}`
      : `https://gateway.pinata.cloud/ipfs/${cid}`;
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Quản lý Sản phẩm / Giống</h1>
          <p className="page-subtitle">Khai báo danh mục nông sản, giống cây trồng, vật nuôi trước khi khởi tạo lô hàng.</p>
        </div>
        <button className="btn-primary" onClick={() => setIsFormOpen(!isFormOpen)}>
          {isFormOpen ? 'Hủy' : '+ Thêm Sản phẩm'}
        </button>
      </div>

      {isFormOpen && (
        <div className="upload-card mb-4" style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Thêm Sản phẩm / Giống mới</h3>
          {errorMsg && <div className="error-banner mb-3" style={{ padding: '10px', background: '#fee2e2', color: '#dc2626', borderRadius: '6px' }}>{errorMsg}</div>}
          
          <form className="product-form" onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label>Tên Sản phẩm / Giống *</label>
              <input 
                type="text" 
                placeholder="VD: Dâu tây New Zealand" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }}
              />
            </div>
            
            <div className="form-group">
              <label>Mã SKU *</label>
              <input 
                type="text" 
                placeholder="VD: DAU-NZ-001" 
                value={skuCode}
                onChange={(e) => setSkuCode(e.target.value)}
                required
                style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }}
              />
            </div>
            
            <div className="form-group">
              <label>Loại Danh mục</label>
              <select 
                value={categoryId} 
                onChange={(e) => setCategoryId(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }}
              >
                <option value="">-- Chọn danh mục (Không bắt buộc) --</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Ảnh đại diện (Sẽ lưu lên IPFS)</label>
              <input 
                type="file" 
                ref={fileInputRef}
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                style={{ width: '100%', padding: '7px', border: '1px solid #ccc', borderRadius: '6px', background: '#f9fafb' }}
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Mô tả chi tiết</label>
              <textarea 
                rows="3" 
                placeholder="VD: Giống dâu tây nhập khẩu từ New Zealand, trồng thủy canh..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px', resize: 'vertical' }}
              ></textarea>
            </div>
            
            <div className="form-actions" style={{ gridColumn: '1 / -1', marginTop: '10px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button 
                type="submit" 
                className="btn-primary" 
                disabled={createMutation.isPending}
                style={{ padding: '10px 24px' }}
              >
                {createMutation.isPending ? 'Đang tải lên IPFS...' : 'Lưu Sản phẩm'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="certs-list-container">
        <h3 style={{ marginBottom: '20px' }}>Danh sách Sản phẩm đã khai báo ({products.length})</h3>
        
        {isLoadingProducts ? (
          <div className="loading-state"><span className="spinner"></span> Đang tải dữ liệu...</div>
        ) : products.length === 0 ? (
          <div className="empty-state">Chưa có sản phẩm nào. Vui lòng thêm sản phẩm mới.</div>
        ) : (
          <div className="products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {products.map(product => {
              const hasImage = product.imageCids && product.imageCids.length > 0;
              const imageUrl = hasImage ? getIpfsUrl(product.imageCids[0]) : null;

              return (
                <div 
                  key={product.id} 
                  className="product-card" 
                  onClick={() => setSelectedProduct(product)}
                  style={{ 
                    cursor: 'pointer', 
                    transition: 'transform 0.2s', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '12px', 
                    overflow: 'hidden',
                    background: 'white'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ height: '160px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {hasImage ? (
                      <img src={imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '48px' }}>🌱</span>
                    )}
                  </div>
                  <div className="product-info" style={{ padding: '16px' }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>{product.name}</h4>
                    <span style={{ display: 'inline-block', padding: '4px 8px', background: '#e2e8f0', borderRadius: '4px', fontSize: '0.8rem', color: '#475569', marginBottom: '8px' }}>
                      SKU: {product.skuCode}
                    </span>
                    <p className="desc" style={{ color: '#64748b', fontSize: '0.9rem', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {product.description || 'Chưa có mô tả'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setSelectedProduct(null)}>
          <div className="modal-content" style={{ background: 'white', width: '90%', maxWidth: '600px', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Chi tiết Sản phẩm</h3>
              <button onClick={() => setSelectedProduct(null)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
            </div>
            
            <div style={{ padding: '24px', overflowY: 'auto', maxHeight: '70vh' }}>
              <div style={{ display: 'flex', gap: '24px', flexDirection: 'column' }}>
                {selectedProduct.imageCids && selectedProduct.imageCids.length > 0 && (
                  <div style={{ width: '100%', height: '250px', borderRadius: '8px', overflow: 'hidden', background: '#f8fafc' }}>
                    <img src={getIpfsUrl(selectedProduct.imageCids[0])} alt="Product" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                )}
                
                <div>
                  <h2 style={{ margin: '0 0 10px 0', color: '#0f172a' }}>{selectedProduct.name}</h2>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <span style={{ padding: '4px 10px', background: '#f1f5f9', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 500 }}>SKU: {selectedProduct.skuCode}</span>
                    {selectedProduct.category?.name && (
                      <span style={{ padding: '4px 10px', background: '#dbeafe', color: '#1e40af', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 500 }}>{selectedProduct.category.name}</span>
                    )}
                  </div>
                  
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#475569' }}>Mô tả</h4>
                    <p style={{ margin: 0, color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{selectedProduct.description || 'Chưa có thông tin mô tả chi tiết cho sản phẩm này.'}</p>
                  </div>

                  {selectedProduct.imageCids && selectedProduct.imageCids.length > 0 && (
                     <div style={{ marginTop: '20px', fontSize: '0.85rem', color: '#94a3b8' }}>
                       IPFS CID: {selectedProduct.imageCids[0]}
                     </div>
                  )}
                </div>
              </div>
            </div>
            
            <div style={{ padding: '16px 24px', borderTop: '1px solid #eee', background: '#f8fafc', textAlign: 'right' }}>
              <button className="btn-secondary" onClick={() => setSelectedProduct(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
