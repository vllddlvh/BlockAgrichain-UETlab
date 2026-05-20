import axiosInstance from '../../configs/axios';

const productService = {
  /**
   * Khởi tạo sản phẩm/giống mới
   * POST /api/v1/products
   * @param {{
   *   categoryId?: string,
   *   name: string,
   *   description?: string,
   *   skuCode: string,
   *   imageCids?: string[],
   *   attributes?: Record<string, any>
   * }} request 
   * @returns {Promise<Object>} ProductResponse
   */
  createProduct: async (request) => {
    const response = await axiosInstance.post('/api/v1/products', request);
    return response.data.body;
  },

  /**
   * Lấy danh sách sản phẩm của tổ chức
   * GET /api/v1/products
   * @returns {Promise<Array>} List of ProductResponse
   */
  getProducts: async () => {
    const response = await axiosInstance.get('/api/v1/products');
    return response.data.body;
  },
};

export default productService;
