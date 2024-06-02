import axios from 'axios';

const url = 'https://courtcaller.azurewebsites.net/api';

export const fetchReviews = async (pageNumber = 1, pageSize = 10) => {
  try {
    const response = await axios.get(`${url}/Reviews`, {
      params: {
        pageNumber,
        pageSize
      }
    });

    console.log('API response full data:', response.data); // In ra toàn bộ dữ liệu phản hồi từ API

    // Giả sử API trả về một mảng
    if (Array.isArray(response.data)) {
      const items = response.data;
      const totalCount = parseInt(response.headers['x-total-count'], 10) || 100; // Giả định tổng số bản ghi là 100 nếu không có header

      return {
        items,
        totalCount
      };
    } else {
      throw new Error('Invalid API response structure');
    }
  } catch (error) {
    console.error('Error fetching reviews data:', error.response ? error.response.data : error.message);
    throw error;
  }
};
