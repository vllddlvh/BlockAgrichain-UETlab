import { create } from 'zustand';
import authService from '../services/api/authService';
import userService from '../services/api/userService';

// Ánh xạ role từ backend sang route mặc định và display name
const ROLE_CONFIG = {
  FARM_ADMIN:      { defaultPath: '/dashboard',          label: 'Nông dân',               color: '#10b981', init: 'N' },
  FARM_STAFF:      { defaultPath: '/dashboard',          label: 'Nông dân',               color: '#10b981', init: 'N' },
  TRANSPORT_ADMIN: { defaultPath: '/transfer-ownership', label: 'DV Vận chuyển',          color: '#3b82f6', init: 'V' },
  TRANSPORT_STAFF: { defaultPath: '/transfer-ownership', label: 'DV Vận chuyển',          color: '#3b82f6', init: 'V' },
  RETAIL_ADMIN:    { defaultPath: '/receive-goods',      label: 'Siêu thị',               color: '#eab308', init: 'R' },
  RETAIL_STAFF:    { defaultPath: '/receive-goods',      label: 'Siêu thị',               color: '#eab308', init: 'R' },
  SYSTEM_ADMIN:    { defaultPath: '/risk-management',    label: 'Quản trị viên Hệ thống', color: '#1e293b', init: 'AD' },
};

// Lấy config cho role đầu tiên của user (ưu tiên role có quyền cao nhất)
const getProfileFromRoles = (roles = []) => {
  const priority = ['SYSTEM_ADMIN', 'FARM_ADMIN', 'TRANSPORT_ADMIN', 'RETAIL_ADMIN', 'FARM_STAFF', 'TRANSPORT_STAFF', 'RETAIL_STAFF'];
  for (const role of priority) {
    if (roles.includes(role)) {
      return ROLE_CONFIG[role];
    }
  }
  return { defaultPath: '/dashboard', label: 'Người dùng', color: '#94a3b8', init: 'U' };
};

// Khôi phục state từ localStorage khi tải lại trang
const getInitialState = () => {
  const token = localStorage.getItem('access_token');
  const refreshToken = localStorage.getItem('refresh_token');
  const userStr = localStorage.getItem('user');
  
  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      return { token, refreshToken, user, isAuthenticated: true };
    } catch {
      return { token: null, refreshToken: null, user: null, isAuthenticated: false };
    }
  }
  return { token: null, refreshToken: null, user: null, isAuthenticated: false };
};

const useAuthStore = create((set, get) => ({
  ...getInitialState(),
  isLoading: false,
  error: null,

  /**
   * Đăng nhập: gọi API login, lưu token, fetch profile, lưu state
   * @param {string} email
   * @param {string} password
   * @returns {string} defaultPath dựa trên role
   */
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      // 1. Đăng nhập lấy token
      const authData = await authService.login(email, password);
      
      localStorage.setItem('access_token', authData.token);
      if (authData.refreshToken) {
        localStorage.setItem('refresh_token', authData.refreshToken);
      }

      // 2. Lấy profile người dùng
      const user = await userService.getMyProfile();
      localStorage.setItem('user', JSON.stringify(user));

      set({
        token: authData.token,
        refreshToken: authData.refreshToken,
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      // 3. Trả về default path dựa trên role
      const profile = getProfileFromRoles(user.roles);
      return profile.defaultPath;
    } catch (error) {
      const message = error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
      set({ isLoading: false, error: message, isAuthenticated: false });
      throw error;
    }
  },

  /**
   * Đăng xuất: gọi API logout, xóa localStorage, reset state
   */
  logout: async () => {
    const token = get().token;
    set({ isLoading: true });
    try {
      if (token) {
        await authService.logout(token);
      }
    } catch {
      // Vẫn tiếp tục logout dù API lỗi
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      set({
        token: null,
        refreshToken: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  /**
   * Lấy profile config (name, color, init) dựa trên roles của user hiện tại
   */
  getProfileConfig: () => {
    const { user } = get();
    return getProfileFromRoles(user?.roles || []);
  },

  clearError: () => set({ error: null }),
}));

export { getProfileFromRoles, ROLE_CONFIG };
export default useAuthStore;
