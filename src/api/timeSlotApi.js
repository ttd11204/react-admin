import axios from 'axios';

const url = 'https://courtcaller.azurewebsites.net/api';

export const fetchTimeSlots = async () => {
  try {
    const response = await axios.get(`${url}/TimeSlots`);
    return response.data;
  } catch (error) {
    console.error('Error fetching time slots data:', error);
    throw error;
  }
};
