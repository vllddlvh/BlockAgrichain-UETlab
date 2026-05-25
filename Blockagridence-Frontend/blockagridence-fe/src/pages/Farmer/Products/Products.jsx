import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message, Table, Tag, Button, Space } from 'antd';
import { UploadOutlined, PlusOutlined, EditOutlined, RetweetOutlined, SafetyCertificateOutlined, ClockCircleOutlined } from '@ant-design/icons';
import masterDataService from '../../../services/api/masterDataService';
import productService from '../../../services/api/productService';
import ipfsService from '../../../services/api/ipfsService';
import './Products.css';

export default function Products() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [skuCode, setSkuCode] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  
  // New States
  const [files, setFiles] = useState([]);
  const [muaVu, setMuaVu] = useState('');
  const [doAm, setDoAm] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [existingCids, setExistingCids] = useState([]);

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
      message.success('Lưu Sản phẩm thành công!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsFormOpen(false);
      resetForm();
    },
    onError: (err) => {
      message.error(err.message || 'Lỗi khi tạo sản phẩm');
    }
  });

  // 4. Mutation Cập nhật sản phẩm
  const updateMutation = useMutation({
    mutationFn: async (productData) => {
      return await productService.updateProduct(editingId, productData);
    },
    onSuccess: () => {
      message.success('Cập nhật Sản phẩm thành công!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsFormOpen(false);
      resetForm();
    },
    onError: (err) => {
      message.error(err.message || 'Lỗi khi cập nhật sản phẩm');
    }
  });

  // 5. Mutation Đổi trạng thái sản phẩm
  const statusMutation = useMutation({
    mutationFn: async (id) => {
      return await productService.toggleProductStatus(id);
    },
    onSuccess: () => {
      message.success('Thay đổi trạng thái thành công!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err) => {
      message.error(err.message || 'Lỗi khi thay đổi trạng thái');
    }
  });

  const resetForm = () => {
    setName('');
    setSkuCode('');
    setCategoryId('');
    setDescription('');
    setFiles([]);
    setMuaVu('');
    setDoAm('');
    setEditingId(null);
    setExistingCids([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setName(product.name);
    setSkuCode(product.skuCode);
    setCategoryId(product.categoryId);
    setDescription(product.description || '');
    setExistingCids(product.imageCids || []);
    setMuaVu(product.attributes?.mua_vu || '');
    setDoAm(product.attributes?.do_am || '');
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;
    
    // Kiểm tra dung lượng từng file (VD: < 5MB)
    const hasLargeFile = selectedFiles.some(f => f.size > 5 * 1024 * 1024);
    if (hasLargeFile) {
      message.error('Có file vượt quá dung lượng cho phép (5MB).');
      return;
    }

    setFiles(selectedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !skuCode.trim()) {
      message.error('Vui lòng nhập Tên sản phẩm và Mã SKU');
      return;
    }
    
    if (!categoryId) {
      message.error('Vui lòng chọn Loại Danh mục');
      return;
    }

    try {
      let imageCids = [...existingCids]; // Giữ lại ảnh cũ
      
      // Upload IPFS first if there's a file
      if (files.length > 0) {
        message.loading({ content: `Đang tải ${files.length} ảnh lên IPFS...`, key: 'uploading' });
        
        for (const fileItem of files) {
          const ipfsRes = await ipfsService.uploadFile(fileItem);
          const cid = ipfsRes.IpfsHash || ipfsRes.ipfsHash;
          imageCids.push(cid); // Thêm ảnh mới vào mảng
        }
        
        message.success({ content: 'Tải ảnh thành công!', key: 'uploading', duration: 2 });
      }

      // Prepare attributes
      const attributes = {};
      if (muaVu.trim()) attributes.mua_vu = muaVu.trim();
      if (doAm.trim()) attributes.do_am = doAm.trim();

      const payload = {
        name,
        skuCode,
        categoryId,
        description,
        imageCids,
        attributes
      };

      // Submit form
      if (editingId) {
        updateMutation.mutate(payload);
      } else {
        createMutation.mutate(payload);
      }
    } catch (err) {
      message.error({ content: err.message || 'Có lỗi xảy ra khi tải ảnh lên IPFS', key: 'uploading' });
    }
  };

  // Ant Design Table Columns
  const columns = [
    {
      title: 'Hình ảnh',
      dataIndex: 'imageCids',
      key: 'imageCids',
      render: (cids) => {
        if (cids && cids.length > 0) {
          return (
            <img 
              src={`https://ipfs.io/ipfs/${cids[0]}`} 
              alt="thumbnail" 
              style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} 
            />
          );
        }
        return <div style={{ fontSize: '24px' }}>🌱</div>;
      }
    },
    {
      title: 'Tên Sản phẩm',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong>{text}</strong>
    },
    {
      title: 'Mã SKU',
      dataIndex: 'skuCode',
      key: 'skuCode',
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Đặc tính',
      dataIndex: 'attributes',
      key: 'attributes',
      render: (attrs) => {
        if (!attrs || Object.keys(attrs).length === 0) return <span>-</span>;
        
        return (
          <Space wrap>
            {Object.entries(attrs).map(([key, value]) => {
              let label = key === 'mua_vu' ? 'Mùa vụ' : key === 'do_am' ? 'Độ ẩm/Tiêu chuẩn' : key;
              return <Tag color="green" key={key}>{`${label}: ${value}`}</Tag>;
            })}
          </Space>
        );
      }
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      render: (text) => text || <span style={{ color: '#aaa' }}>Chưa có mô tả</span>
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => {
        // By default, if isActive is undefined, treat it as true
        const isActive = record.isActive !== false;
        return (
          <Space direction="vertical" size="small">
            {isActive ? (
              <Tag color="green">ĐANG SẢN XUẤT</Tag>
            ) : (
              <Tag color="red">NGỪNG SẢN XUẤT</Tag>
            )}
            {record.isApproved ? (
              <Tag color="blue" icon={<SafetyCertificateOutlined />}>ĐÃ ĐƯỢC DUYỆT</Tag>
            ) : (
              <Tag color="gold" icon={<ClockCircleOutlined />}>CHỜ ADMIN DUYỆT</Tag>
            )}
          </Space>
        );
      }
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => {
        const isActive = record.isActive !== false;
        return (
          <Space>
            <Button size="small" type="primary" ghost onClick={() => handleEdit(record)}>Sửa</Button>
            <Button 
              size="small" 
              danger={isActive} 
              type={isActive ? "default" : "primary"}
              onClick={() => statusMutation.mutate(record.id)}
              loading={statusMutation.isPending && statusMutation.variables === record.id}
            >
              {isActive ? 'Ngừng SX' : 'Phục hồi'}
            </Button>
          </Space>
        );
      }
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Quản lý Sản phẩm / Giống</h1>
          <p className="page-subtitle">Khai báo danh mục nông sản, giống cây trồng, vật nuôi trước khi khởi tạo lô hàng.</p>
        </div>
        <button className="btn-primary" onClick={() => {
          if (isFormOpen && editingId) {
            resetForm();
          } else {
            setIsFormOpen(!isFormOpen);
            if (!isFormOpen) resetForm();
          }
        }}>
          {isFormOpen ? 'Hủy' : '+ Thêm Sản phẩm'}
        </button>
      </div>

      {isFormOpen && (
        <div className="upload-card mb-4">
          <h3>{editingId ? 'Cập nhật Sản phẩm / Giống' : 'Thêm Sản phẩm / Giống mới'}</h3>
          
          <form className="product-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Tên Sản phẩm / Giống <span style={{color: 'red'}}>*</span></label>
              <input 
                type="text" 
                placeholder="VD: Dâu tây New Zealand" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Mã SKU <span style={{color: 'red'}}>*</span></label>
              <input 
                type="text" 
                placeholder="VD: DAU-NZ-001" 
                value={skuCode}
                onChange={(e) => setSkuCode(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Loại Danh mục <span style={{color: 'red'}}>*</span></label>
              <select 
                value={categoryId} 
                onChange={(e) => setCategoryId(e.target.value)}
                required
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Ảnh đại diện sản phẩm (Có thể chọn nhiều ảnh thêm)</label>
              <input 
                type="file" 
                accept=".jpg,.png,.jpeg"
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple
                style={{
                  padding: '8px',
                  border: '1px dashed #ccc',
                  borderRadius: '6px',
                  width: '100%',
                  backgroundColor: '#f9f9f9',
                  marginBottom: '10px'
                }}
              />
              {existingCids.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  {existingCids.map((cid, idx) => (
                    <div key={idx} style={{ position: 'relative' }}>
                      <img src={`https://ipfs.io/ipfs/${cid}`} alt="existing" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }} />
                      <button 
                        type="button"
                        onClick={() => setExistingCids(prev => prev.filter(c => c !== cid))}
                        style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {files.length > 0 && (
                <div style={{ fontSize: '13px', color: '#16a34a' }}>
                  Đã chọn thêm {files.length} file ảnh mới chờ upload.
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Mùa vụ / Vùng trồng</label>
              <input 
                type="text" 
                placeholder="VD: Vụ Đông Xuân" 
                value={muaVu}
                onChange={(e) => setMuaVu(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Độ ẩm / Tiêu chuẩn</label>
              <input 
                type="text" 
                placeholder="VD: VietGAP, 12.5%" 
                value={doAm}
                onChange={(e) => setDoAm(e.target.value)}
              />
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
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Lưu Sản phẩm'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="certs-list-container" style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Danh sách Sản phẩm đã khai báo ({products.length})</h3>
        
        <Table 
          dataSource={products} 
          columns={columns} 
          rowKey="id"
          loading={isLoadingProducts}
          pagination={{ pageSize: 10 }}
          bordered
        />
      </div>
    </div>
  );
}
