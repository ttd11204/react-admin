import axios from 'axios';

const url = 'https://courtcaller.azurewebsites.net/api';

export const fetchReviews = async (pageNumber = 1, pageSize = 10) => {
  try {
    const response = await axios.get(`${url}/Reviews`, {
      params: { pageNumber, pageSize }
    });

    const items = response.data;
    const totalCount = parseInt(response.headers['x-total-count'], 10) || 100;
    const users = await fetchUsers();
    const branches = await fetchBranches();

    const itemsWithDetails = items.map(item => {
      const user = users.find(u => u.id === item.id);
      const branch = branches.find(b => b.branchId === item.branchId);
      return {
        ...item,
        email: user ? user.email : 'N/A',
        branchName: branch ? branch.branchName : 'N/A'
      };
    });

    return { items: itemsWithDetails, totalCount };
  } catch (error) {
    console.error('Error fetching reviews data:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const createReview = async (reviewData) => {
  try {
    const response = await axios.post(`${url}/Reviews`, reviewData);
    return response.data;
  } catch (error) {
    console.error('Error creating review:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const fetchUsers = async () => {
  try {
    const response = await axios.get(`${url}/Users`);
    return response.data;
  } catch (error) {
    console.error('Error fetching users data:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const fetchBranches = async () => {
  try {
    const response = await axios.get(`${url}/Branches`);
    return response.data;
  } catch (error) {
    console.error('Error fetching branches data:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const updateReview = async (id, reviewData) => {
  try {
    const response = await axios.put(`${url}/Reviews/${id}`, reviewData);
    return response.data;
  } catch (error) {
    console.error('Error updating review:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const deleteReview = async (id) => {
  try {
    const response = await axios.delete(`${url}/Reviews/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting review:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const searchReviewsByRating = async (rating) => {
  try {
    const response = await axios.get(`${url}/Reviews/SearchByRating/${rating}`);
    const items = response.data;
    const users = await fetchUsers();
    const branches = await fetchBranches();

    const itemsWithDetails = items.map(item => {
      const user = users.find(u => u.id === item.id);
      const branch = branches.find(b => b.branchId === item.branchId);
      return {
        ...item,
        email: user ? user.email : 'N/A',
        branchName: branch ? branch.branchName : 'N/A'
      };
    });

    return itemsWithDetails;
  } catch (error) {
    console.error('Error searching reviews by rating:', error.response ? error.response.data : error.message);
    throw error;
  }
};
