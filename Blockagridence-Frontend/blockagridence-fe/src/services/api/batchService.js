import axiosInstance from '../../configs/axios';

const batchService = {
  /**
   * Khởi tạo lô hàng mới
   * POST /api/v1/batches
   * @param {{
   *   batchCode: string,
   *   productId: string,
   *   productType: 'RAW_MATERIAL' | 'PROCESSED_FOOD',
   *   initialQuantity: number,
   *   unitId: string
   * }} request 
   */
  createBatch: async (request) => {
    const response = await axiosInstance.post('/api/v1/batches', request);
    return response.data.body;
  },

  /**
   * Ghi nhận sự kiện (Nhật ký đồng ruộng, chế biến...)
   * POST /api/v1/batches/{batchId}/events
   * @param {string} batchId 
   * @param {{
   *   eventType: string,
   *   gpsLatitude?: number,
   *   gpsLongitude?: number,
   *   deviceInfo?: string,
   *   imageCids?: string[],
   *   metadata?: Record<string, any>
   * }} request 
   */
  appendEvent: async (batchId, request) => {
    const response = await axiosInstance.post(`/api/v1/batches/${batchId}/events`, request);
    return response.data.body;
  },

  /**
   * Lấy danh sách lô hàng đang sở hữu bởi tổ chức
   * GET /api/v1/batches
   */
  getBatches: async () => {
    const response = await axiosInstance.get('/api/v1/batches');
    return response.data.body;
  },

  /**
   * Lấy chi tiết lô hàng
   * GET /api/v1/batches/{batchId}
   */
  getBatchDetail: async (batchId) => {
    const response = await axiosInstance.get(`/api/v1/batches/${batchId}`);
    return response.data.body;
  },

  /**
   * Cập nhật trạng thái lô hàng
   * PATCH /api/v1/batches/{batchId}/status?status=...
   */
  updateBatchStatus: async (batchId, status) => {
    const response = await axiosInstance.patch(`/api/v1/batches/${batchId}/status`, null, {
      params: { status }
    });
    return response.data.body;
  },

  confirmBlockchainAnchor: async (batchId, request) => {
    const response = await axiosInstance.post(`/api/v1/batches/${batchId}/blockchain-anchor`, request);
    return response.data.body;
  }
};

export default batchService;
