import api from './api';
const url = 'https://courtcaller.azurewebsites.net/api';

export const fetchDailyRevenue = async (branchId) => {
    try {
      const response = await api.get(`${url}/Bookings/daily-revenue`, {
        params: { branchId }
      });
      console.log(`Revenue for branch ${branchId}:`, response.data.revenue); // Kiểm tra dữ liệu nhận được
      return response.data;
    } catch (error) {
      console.error("An error occurred while calling the API", error);
      throw error;
    }
  };
  