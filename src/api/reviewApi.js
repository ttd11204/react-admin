import axios from 'axios';

const url = 'https://courtcaller.azurewebsites.net/api';

export const fetchReviews = async (pageNumber = 1, pageSize = 10, searchQuery = '') => {
  try {
    const params = { pageNumber, pageSize, searchQuery };
    const response = await axios.get(`${url}/Reviews`, { params });

    if (response.data && Array.isArray(response.data.data)) {
      const items = response.data.data;
      const totalCount = response.data.total || 0;
      return {
        items,
        totalCount
      };
    } else {
      throw new Error('Invalid API response structure');
    }
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
    if (Array.isArray(response.data)) {
      return response.data;
    } else {
      throw new Error('Invalid API response structure');
    }
  } catch (error) {
    console.error('Error searching reviews by rating:', error.response ? error.response.data : error.message);
    throw error;
  }
};
