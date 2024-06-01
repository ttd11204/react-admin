import axios from 'axios';

const url = 'https://courtcaller.azurewebsites.net/api';

export const fetchReviews = async () => {
  try {
    const response = await axios.get(`${url}/Reviews`);
    return response.data;
  } catch (error) {
    console.error('Error fetching reviews data:', error);
    throw error;
  }
};
