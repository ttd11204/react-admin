import axios from 'axios';

const url = 'https://courtcaller.azurewebsites.net/api';

export const fetchPayments = async (pageNumber = 1, pageSize = 10) => {
  try {
    const response = await axios.get(`${url}/Payments`, {
      params: {
        pageNumber,
        pageSize
      }
    });
    if (response.data && Array.isArray(response.data)) {
      const items = response.data;
      const totalCount = parseInt(response.headers['x-total-count'], 10) || 100; // Default to 100 if header is missing
      return {
        items,
        totalCount
      };
    } else {
      throw new Error('Invalid API response structure');
    }
  } catch (error) {
    console.error('Error fetching payment data:', error.response ? error.response.data : error.message);
    throw error;
  }
};
