import axios from 'axios';

const url = 'https://courtcaller.azurewebsites.net/api';

export const fetchPayments = async () => {
  try {
    const response = await axios.get(`${url}/Payments`);
    return response.data;
  } catch (error) {
    console.error('Error fetching payment data:', error);
    throw error;
  }
};
