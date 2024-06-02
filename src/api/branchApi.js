import axios from 'axios';

const url = 'https://courtcaller.azurewebsites.net/api';

export const fetchBranches = async (pageNumber = 1, pageSize = 10) => {
  try {
    const response = await axios.get(`${url}/Branches`, {
      params: {
        pageNumber,
        pageSize
      }
    });
    console.log('API response full data:', response.data); // In ra toàn bộ dữ liệu phản hồi từ API

    if (Array.isArray(response.data)) {
      const items = response.data;
      const totalCount = parseInt(response.headers['x-total-count'], 10) || items.length; // Tổng số bản ghi chính xác dựa trên số lượng dữ liệu thực tế hoặc header nếu có

      return {
        items,
        totalCount
      };
    } else {
      throw new Error('Invalid API response structure');
    }
  } catch (error) {
    console.error('Error fetching branches data:', error.response ? error.response.data : error.message);
    throw error;
  }
};
