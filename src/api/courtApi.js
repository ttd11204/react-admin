// courtApi.js
import axios from 'axios';

const url = 'https://courtcaller.azurewebsites.net/api';

export const fetchCourts = async () => {
  try {
    const response = await axios.get(`${url}/Courts`);
    return response.data;
  } catch (error) {
    console.error('Error fetching court data:', error);
    throw error;
  }
};
