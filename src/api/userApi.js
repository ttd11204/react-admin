import axios from 'axios';

const url = 'https://courtcaller.azurewebsites.net/api';

export const fetchTeamData = async (pageNumber = 1, pageSize = 10) => {
  try {
    const response = await axios.get(`${url}/Users`, {
      params: {
        pageNumber,
        pageSize
      }
    });
    console.log('API response full data:', response.data); // Log toàn bộ dữ liệu phản hồi từ API

    if (Array.isArray(response.data)) {
      const items = response.data;
      const totalCount = parseInt(response.headers['x-total-count'], 10) || 100;

      // Log dữ liệu từng người dùng để kiểm tra
      items.forEach((item, index) => {
        console.log(`User ${index + 1}:`, item);
      });

      return {
        items,
        totalCount
      };
    } else {
      throw new Error('Invalid API response structure');
    }
  } catch (error) {
    console.error('Error fetching team data:', error.response ? error.response.data : error.message);
    throw error;
  }
};



export const updateUserBanStatus = async (userId, banned) => {
  try {
    const response = await axios.put(`${url}/Users/${userId}/${banned ? 'ban' : 'unban'}`);
    return response.data;
  } catch (error) {
    console.error('Error updating user ban status:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const updateUserDetail = async (userDetailId, userDetails) => {
  try {
    console.log('Sending update request:', { userDetailId, userDetails });  // Log dữ liệu gửi đi
    const response = await axios.put(`${url}/UserDetails/${userDetailId}`, userDetails);
    console.log('API response status:', response.status);  // Log status code của phản hồi
    console.log('API response data:', response.data);  // Log dữ liệu phản hồi từ API
    return response.data;
  } catch (error) {
    if (error.response && error.response.data && error.response.data.errors) {
      console.error('Validation errors:', error.response.data.errors);  // Log lỗi xác thực
    } else {
      console.error('Error updating user detail:', error.response ? error.response.data : error.message);
    }
    throw error;
  }
};











