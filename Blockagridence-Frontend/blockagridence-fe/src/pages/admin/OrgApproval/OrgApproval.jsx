import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Tag, Button, Modal, message, Space, Tabs } from 'antd';
import axiosInstance from '../../../configs/axios';
import './OrgApproval.css';

export default function OrgApproval() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [activeTab, setActiveTab] = useState('PENDING_APPROVAL');

  // Lấy danh sách tổ chức
  const { data: organizations, isLoading } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const res = await axiosInstance.get('/api/v1/organizations');
      return res.data.body || [];
    },
  });

  // Lọc theo trạng thái
  const filteredOrgs = (organizations || []).filter(org => org.status === activeTab);

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const res = await axiosInstance.patch(`/api/v1/organizations/${id}/status?status=${status}`);
      return res.data;
    },
    onSuccess: (data, variables) => {
      message.success(variables.status === 'VERIFIED' ? 'Đã duyệt tổ chức thành công!' : 'Đã từ chối tổ chức!');
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
    onError: (error) => {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra!');
    }
  });

  const handleViewDetails = (org) => {
    setSelectedOrg(org);
    setIsModalOpen(true);
  };

  const handleApprove = () => {
    if (selectedOrg) {
      updateStatusMutation.mutate({ id: selectedOrg.id, status: 'VERIFIED' });
    }
  };

  const handleReject = () => {
    if (selectedOrg) {
      updateStatusMutation.mutate({ id: selectedOrg.id, status: 'REJECTED' });
    }
  };

  const getTypeTag = (type) => {
    switch (type) {
      case 'FARM': return <Tag color="green">Nông trại</Tag>;
      case 'FACTORY': return <Tag color="blue">Nhà máy</Tag>;
      case 'TRANSPORTER': return <Tag color="orange">Vận chuyển</Tag>;
      case 'RETAILER': return <Tag color="purple">Bán lẻ</Tag>;
      default: return <Tag>{type}</Tag>;
    }
  };

  const columns = [
    {
      title: 'Tên tổ chức',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Loại',
      dataIndex: 'orgType',
      key: 'orgType',
      render: getTypeTag,
    },
    {
      title: 'Mã số thuế',
      dataIndex: 'taxCode',
      key: 'taxCode',
    },
    {
      title: 'Người đại diện',
      dataIndex: 'representativeName',
      key: 'representativeName',
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: () => (
        <Tag color={activeTab === 'PENDING_APPROVAL' ? 'gold' : activeTab === 'VERIFIED' ? 'green' : 'red'}>
          {activeTab === 'PENDING_APPROVAL' ? 'Chờ duyệt' : activeTab}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Button type="primary" onClick={() => handleViewDetails(record)}>
          Xem chi tiết
        </Button>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'PENDING_APPROVAL',
      label: 'Chờ phê duyệt',
      children: <Table dataSource={filteredOrgs} columns={columns} rowKey="id" loading={isLoading} pagination={{ pageSize: 10 }} />
    },
    {
      key: 'VERIFIED',
      label: 'Đã phê duyệt',
      children: <Table dataSource={filteredOrgs} columns={columns} rowKey="id" loading={isLoading} pagination={{ pageSize: 10 }} />
    },
    {
      key: 'REGISTERED',
      label: 'Mới đăng ký (Chưa nộp hồ sơ)',
      children: <Table dataSource={filteredOrgs} columns={columns} rowKey="id" loading={isLoading} pagination={{ pageSize: 10 }} />
    }
  ];

  return (
    <div className="org-approval-container">
      <div className="org-approval-header">
        <h1 className="org-approval-title">Phê duyệt Tổ chức</h1>
        <p className="org-approval-subtitle">Quản lý hồ sơ và cấp quyền truy cập hệ thống cho các tổ chức mới</p>
      </div>

      <Tabs 
        defaultActiveKey="PENDING_APPROVAL" 
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
      />

      <Modal
        title={<span style={{ fontSize: '1.2rem', fontWeight: 600 }}>Chi tiết hồ sơ Tổ chức</span>}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        width={700}
        footer={
          selectedOrg?.status === 'PENDING_APPROVAL' ? (
            <Space>
              <Button danger onClick={handleReject} loading={updateStatusMutation.isPending && updateStatusMutation.variables?.status === 'REJECTED'}>
                Từ chối
              </Button>
              <Button type="primary" style={{ backgroundColor: '#10b981' }} onClick={handleApprove} loading={updateStatusMutation.isPending && updateStatusMutation.variables?.status === 'VERIFIED'}>
                Phê duyệt
              </Button>
            </Space>
          ) : (
            <Button onClick={() => setIsModalOpen(false)}>Đóng</Button>
          )
        }
      >
        {selectedOrg && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <div className="detail-row">
                <div className="detail-label">Tên tổ chức:</div>
                <div className="detail-value"><strong>{selectedOrg.name}</strong></div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Loại tổ chức:</div>
                <div className="detail-value">{getTypeTag(selectedOrg.orgType)}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Mã số thuế:</div>
                <div className="detail-value">{selectedOrg.taxCode || 'N/A'}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Người đại diện:</div>
                <div className="detail-value">{selectedOrg.representativeName || 'N/A'}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Ví Web3:</div>
                <div className="detail-value" style={{ wordBreak: 'break-all', fontFamily: 'monospace' }}>
                  {selectedOrg.orgWalletAddress}
                </div>
              </div>
            </div>

            <h4>Tài liệu chứng nhận đã nộp ({selectedOrg.documents?.length || 0})</h4>
            {(!selectedOrg.documents || selectedOrg.documents.length === 0) ? (
              <p style={{ color: '#6b7280', fontStyle: 'italic' }}>Tổ chức chưa tải lên tài liệu nào.</p>
            ) : (
              <div className="cert-list">
                {selectedOrg.documents.map((doc, idx) => (
                  <div key={idx} className="cert-item">
                    <h5>{doc.documentName}</h5>
                    <a href={`https://ipfs.io/ipfs/${doc.cid}`} target="_blank" rel="noreferrer">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '4px' }}>
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                      </svg>
                      Xem file gốc trên IPFS
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
