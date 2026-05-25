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
   * Lấy danh sách lịch sử lô hàng đã từng tham gia
   * GET /api/v1/batches/history
   */
  getBatchHistory: async () => {
    const response = await axiosInstance.get('/api/v1/batches/history');
    return response.data.body;
  },

  /**
   * Xác nhận nhập kho lô hàng
   * POST /api/v1/batches/{batchId}/receive
   */
  receiveBatch: async (batchId) => {
    const response = await axiosInstance.post(`/api/v1/batches/${batchId}/receive`);
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
   * Lấy danh sách sự kiện truy xuất
   * GET /api/v1/batches/{batchId}/events
   */
  getBatchEvents: async (batchId) => {
    const response = await axiosInstance.get(`/api/v1/batches/${batchId}/events`);
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
  },

  /**
   * Chuyển giao lô hàng cho đối tác khác
   * POST /api/v1/batches/{batchId}/transfer
   */
  transferBatch: async (batchId, targetOrgId) => {
    const response = await axiosInstance.post(`/api/v1/batches/${batchId}/transfer`, { targetOrgId });
    return response.data.body;
  },

  /**
   * Tách lô
   * POST /api/v1/batches/split
   */
  splitBatch: async (request) => {
    const response = await axiosInstance.post('/api/v1/batches/split', request);
    return response.data.body;
  },

  /**
   * Gộp lô
   * POST /api/v1/batches/merge
   */
  mergeBatches: async (request) => {
    const response = await axiosInstance.post('/api/v1/batches/merge', request);
    return response.data.body;
  }
};

export default batchService;
