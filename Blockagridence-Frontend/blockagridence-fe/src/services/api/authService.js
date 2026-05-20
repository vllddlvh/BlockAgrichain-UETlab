import axiosInstance from '../../configs/axios';

const authService = {
  /**
   * Đăng nhập
   * POST /api/v1/auth/login
   * @param {string} email
   * @param {string} password
   * @returns {{ token, refreshToken, authenticated }}
   */
  login: async (email, password) => {
    const response = await axiosInstance.post('/api/v1/auth/login', { email, password });
    return response.data.body; // { token, refreshToken, authenticated }
  },

  /**
   * Đăng xuất
   * POST /api/v1/auth/logout
   * @param {string} token - JWT token hiện tại
   */
  logout: async (token) => {
    await axiosInstance.post('/api/v1/auth/logout', { token });
  },

  /**
   * Làm mới Access Token
   * POST /api/v1/auth/refresh
   * @param {string} refreshToken
   * @returns {{ token, refreshToken, authenticated }}
   */
  refresh: async (refreshToken) => {
    const response = await axiosInstance.post('/api/v1/auth/refresh', { token: refreshToken });
    return response.data.body;
  },

  /**
   * Kiểm tra tính hợp lệ của token
   * POST /api/v1/auth/introspect
   * @param {string} token
   * @returns {{ valid: boolean }}
   */
  introspect: async (token) => {
    const response = await axiosInstance.post('/api/v1/auth/introspect', { token });
    return response.data.body;
  },
};

export default authService;
