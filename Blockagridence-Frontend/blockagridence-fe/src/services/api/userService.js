import axiosInstance from '../../configs/axios';

const userService = {
  /**
   * Lấy thông tin profile của người đang đăng nhập
   * GET /api/v1/users/me
   * @returns {UserResponse} { id, orgId, email, fullName, roles[], isDeleted, createdAt }
   */
  getMyProfile: async () => {
    const response = await axiosInstance.get('/api/v1/users/me');
    return response.data.body;
  },

  /**
   * Lấy danh sách nhân viên trong cùng tổ chức
   * GET /api/v1/users
   * Yêu cầu quyền: USER_VIEW
   * @returns {UserResponse[]}
   */
  getMyOrgUsers: async () => {
    const response = await axiosInstance.get('/api/v1/users');
    return response.data.body;
  },

  /**
   * Gán / Cập nhật vai trò cho nhân viên
   * PUT /api/v1/users/{id}/roles
   * Yêu cầu quyền: USER_ASSIGN_ROLE
   * @param {string} userId - UUID
   * @param {string[]} roles - Danh sách mã role (e.g. ["FARM_STAFF"])
   * @returns {UserResponse}
   */
  assignRoles: async (userId, roles) => {
    const response = await axiosInstance.put(`/api/v1/users/${userId}/roles`, { roles });
    return response.data.body;
  },

  /**
   * Vô hiệu hóa tài khoản nhân viên (Soft Delete)
   * DELETE /api/v1/users/{id}
   * Yêu cầu quyền: USER_DELETE
   * @param {string} userId - UUID
   */
  deleteUser: async (userId) => {
    await axiosInstance.delete(`/api/v1/users/${userId}`);
  },

  /**
   * Tạo nhân viên mới trong tổ chức
   * POST /api/v1/users
   * Yêu cầu quyền: USER_CREATE
   * @param {{ email, password, fullName, roles[] }} data
   * @returns {UserResponse}
   */
  createUser: async (data) => {
    const response = await axiosInstance.post('/api/v1/users', data);
    return response.data.body;
  },
};

export default userService;
