// userApi.js
import axios from 'axios';

const url = 'https://courtcaller.azurewebsites.net/api';

export const fetchTeamData = async () => {
  try {
    const response = await axios.get(`${url}/Users`);
    return response.data;
  } catch (error) {
    console.error('Error fetching team data:', error);
    throw error;
  }
};

export const updateUserBanStatus = async (userId, banned) => {
  try {
    const response = await axios.put(`${url}/Users/${userId}/${banned ? 'ban' : 'unban'}`);
    return response.data;
  } catch (error) {
    console.error('Error updating user ban status:', error);
    throw error;
  }
};
