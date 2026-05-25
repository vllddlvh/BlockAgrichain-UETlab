import React, { useState } from 'react';
import { Table, Tag, Button, message, Space, Card, Input } from 'antd';
import { CheckCircleOutlined, SearchOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import productService from '../../../services/api/productService';

export default function ProductApproval() {
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState('');

  // 1. Fetch all products (Admin)
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['adminProducts'],
    queryFn: productService.getAllProductsAdmin
  });

  // 2. Approve Mutation
  const approveMutation = useMutation({
    mutationFn: (id) => productService.approveProduct(id),
    onSuccess: () => {
      message.success('Đã duyệt sản phẩm thành công!');
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
    },
    onError: (error) => {
      message.error(error?.response?.data?.message || 'Có lỗi xảy ra khi duyệt sản phẩm');
    }
  });

  // Lọc theo tìm kiếm
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchText.toLowerCase()) || 
    p.skuCode.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'Mã SKU',
      dataIndex: 'skuCode',
      key: 'skuCode',
      render: (text) => <strong>{text}</strong>
    },
    {
      title: 'Tên Sản Phẩm',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Phân loại',
      dataIndex: 'categoryName',
      key: 'categoryName',
      render: (text) => <Tag>{text || 'Chưa phân loại'}</Tag>
    },
    {
      title: 'Người tạo',
      dataIndex: 'createdBy',
      key: 'createdBy',
      render: (text) => <span style={{ color: '#888' }}>{text || 'N/A'}</span>
    },
    {
      title: 'Trạng thái Duyệt',
      key: 'isApproved',
      render: (_, record) => {
        if (record.isApproved) {
          return <Tag color="success" icon={<SafetyCertificateOutlined />}>Đã duyệt</Tag>;
        }
        return <Tag color="warning">Chờ duyệt</Tag>;
      }
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<CheckCircleOutlined />} 
            onClick={() => approveMutation.mutate(record.id)}
            disabled={record.isApproved}
            loading={approveMutation.isPending && approveMutation.variables === record.id}
          >
            {record.isApproved ? 'Đã duyệt' : 'Phê duyệt'}
          </Button>
        </Space>
      )
    },
  ];

  return (
    <div className="page-container" style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#1f2937', marginBottom: '8px' }}>
          🛡️ Phê duyệt Sản phẩm
        </h1>
        <p style={{ color: '#6b7280', margin: 0 }}>
          Quản lý và phê duyệt danh mục sản phẩm do các Nông trại / Cơ sở đăng ký trước khi đưa vào sản xuất kinh doanh.
        </p>
      </div>

      <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
          <Input 
            placeholder="Tìm theo tên hoặc mã SKU..." 
            prefix={<SearchOutlined />} 
            style={{ width: 300 }}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
        </div>

        <Table 
          columns={columns} 
          dataSource={filteredProducts} 
          rowKey="id" 
          loading={isLoading}
          pagination={{ defaultPageSize: 10, showSizeChanger: true }}
        />
      </Card>
    </div>
  );
}
