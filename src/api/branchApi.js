import axios from 'axios';

const url = 'https://courtcaller.azurewebsites.net/api';

export const fetchBranches = async (pageNumber = 1, pageSize = 10, searchQuery = '') => {
  try {
    const params = { pageNumber, pageSize, searchQuery };
    const response = await axios.get(`${url}/Branches`, { params });

    if (Array.isArray(response.data)) {
      const items = response.data;
      const totalCount = parseInt(response.headers['x-total-count'], 10) || 100;
      return { items, totalCount };
    } else {
      throw new Error('Invalid API response structure');
    }
  } catch (error) {
    console.error('Error fetching branches data:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const fetchBranchById = async (branchId) => {
  try {
    const response = await axios.get(`${url}/Branches/${branchId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching branch data:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const createBranch = async (branchData) => {
  try {
    const response = await axios.post(`${url}/Branches`, branchData);
    return response.data;
  } catch (error) {
    console.error('Error creating branch:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const updateBranch = async (branchId, branchData) => {
  try {
    const response = await axios.put(`${url}/Branches/${branchId}`, branchData);
    return response.data;
  } catch (error) {
    console.error('Error updating branch:', error.response ? error.response.data : error.message);
    throw error;
  }
};
