import axios from 'axios';

const url = 'https://courtcaller.azurewebsites.net/api';

export const fetchBranches = async () => {
  try {
    const response = await axios.get(`${url}/Branches`);
    return response.data;
  } catch (error) {
    console.error('Error fetching branches data:', error);
    throw error;
  }
};
