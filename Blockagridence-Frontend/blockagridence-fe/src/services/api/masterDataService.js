import axiosInstance from '../../configs/axios';

const masterDataService = {
  /**
   * Lấy danh sách các danh mục loại sản phẩm
   * GET /api/v1/master/categories
   * @returns {Promise<Array>} Danh sách Categories
   */
  getCategories: async () => {
    const response = await axiosInstance.get('/api/v1/master/categories');
    return response.data.body;
  },

  /**
   * Lấy danh sách các đơn vị tính
   * GET /api/v1/master/units
   * @returns {Promise<Array>} Danh sách Units
   */
  getUnits: async () => {
    const response = await axiosInstance.get('/api/v1/master/units');
    return response.data.body;
  },

  /**
   * Lấy danh sách các tổ chức đã được xác thực (Dùng để chọn đối tác chuyển giao)
   * GET /api/v1/organizations/verified
   */
  getOrganizations: async (keyword = '') => {
    const response = await axiosInstance.get('/api/v1/organizations/verified', {
      params: { keyword: keyword || undefined }
    });
    return response.data.body;
  }
};

export default masterDataService;
