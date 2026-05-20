import axiosInstance from '../../configs/axios';

const ipfsService = {
  /**
   * Tải file lên IPFS thông qua Backend
   * @param {File} file - File cần tải lên
   * @returns {Promise<Object>} Data trả về gồm ipfsHash, pinSize, timestamp
   */
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.post('/api/v1/ipfs/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.body;
  },
};

export default ipfsService;
