import axiosInstance from '../../configs/axios';

const organizationService = {
  /**
   * Đăng ký tổ chức mới (kèm tạo tài khoản Admin) — Public, không cần token
   * POST /api/v1/organizations/register
   * @param {{
   *   orgWalletAddress: string,  // Địa chỉ ví MetaMask (0x...)
   *   name: string,
   *   taxCode?: string,
   *   representativeName?: string,
   *   addressDetail?: string,
   *   orgType: 'FARM' | 'TRANSPORTER' | 'RETAILER',
   *   adminEmail: string,
   *   adminPassword: string,
   *   adminFullName: string
   * }} data
   * @returns {OrgResponse}
   */
  register: async (data) => {
    const response = await axiosInstance.post('/api/v1/organizations/register', data);
    return response.data.body;
  },

  /**
   * Lấy danh sách tất cả tổ chức — Dành cho SYSTEM_ADMIN
   * GET /api/v1/organizations
   * @returns {OrgResponse[]}
   */
  getAllOrganizations: async () => {
    const response = await axiosInstance.get('/api/v1/organizations');
    return response.data.body;
  },

  /**
   * Lấy chi tiết một tổ chức
   * GET /api/v1/organizations/{id}
   * @param {string} id - UUID
   * @returns {OrgResponse}
   */
  getOrganizationById: async (id) => {
    const response = await axiosInstance.get(`/api/v1/organizations/${id}`);
    return response.data.body;
  },

  /**
   * Cập nhật trạng thái tổ chức (Duyệt / Khóa) — Dành cho SYSTEM_ADMIN
   * PATCH /api/v1/organizations/{id}/status?status=VERIFIED
   * @param {string} id - UUID
   * @param {'PENDING' | 'VERIFIED' | 'REJECTED' | 'LOCKED'} status
   * @returns {OrgResponse}
   */
  updateOrgStatus: async (id, status) => {
    const response = await axiosInstance.patch(`/api/v1/organizations/${id}/status`, null, {
      params: { status },
    });
    return response.data.body;
  },

  /**
   * Thêm chứng chỉ / tài liệu mới cho tổ chức
   * POST /api/v1/organizations/{id}/documents
   * @param {string} id - UUID
   * @param {{
   *   documentType: string,
   *   documentName: string,
   *   cid: string,
   *   expirationDate?: string
   * }} documentData
   * @returns {OrgDocumentResponse}
   */
  addDocument: async (id, documentData) => {
    const response = await axiosInstance.post(`/api/v1/organizations/${id}/documents`, documentData);
    return response.data.body;
  },
};

export default organizationService;
