import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import masterDataService from '../../../services/api/masterDataService';
import productService from '../../../services/api/productService';
import './Products.css';

export default function Products() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [skuCode, setSkuCode] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

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
      return await productService.createProduct(productData);
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
      description
    });
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
        <div className="upload-card mb-4">
          <h3>Thêm Sản phẩm / Giống mới</h3>
          {errorMsg && <div className="error-banner mb-3">{errorMsg}</div>}
          
          <form className="product-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Tên Sản phẩm / Giống *</label>
              <input 
                type="text" 
                placeholder="VD: Dâu tây New Zealand" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
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
              />
            </div>
            
            <div className="form-group">
              <label>Loại Danh mục</label>
              <select 
                value={categoryId} 
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">-- Chọn danh mục (Không bắt buộc) --</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Mô tả chi tiết</label>
              <textarea 
                rows="3" 
                placeholder="VD: Giống dâu tây nhập khẩu từ New Zealand, trồng thủy canh..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>
            
            <div className="form-actions" style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
              <button 
                type="submit" 
                className="btn-primary" 
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Đang lưu...' : 'Lưu Sản phẩm'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="certs-list-container">
        <h3>Danh sách Sản phẩm đã khai báo ({products.length})</h3>
        
        {isLoadingProducts ? (
          <div className="loading-state"><span className="spinner"></span> Đang tải dữ liệu...</div>
        ) : products.length === 0 ? (
          <div className="empty-state">Chưa có sản phẩm nào. Vui lòng thêm sản phẩm mới.</div>
        ) : (
          <div className="products-grid">
            {products.map(product => (
              <div key={product.id} className="product-card">
                <div className="product-icon">🌱</div>
                <div className="product-info">
                  <h4>{product.name}</h4>
                  <p className="sku">SKU: {product.skuCode}</p>
                  <p className="desc">{product.description || 'Chưa có mô tả'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
