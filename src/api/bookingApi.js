import axios from 'axios';

const url = 'https://courtcaller.azurewebsites.net/api';

export const fetchBookings = async (pageNumber = 1, pageSize = 10) => {
  try {
    const response = await axios.get(`${url}/Bookings`, {
      params: {
        pageNumber,
        pageSize
      }
    });

    console.log('API response full data:', response.data);

    if (Array.isArray(response.data)) {
      const items = response.data;
      const totalCount = parseInt(response.headers['x-total-count'], 10) || 100;

      return {
        items,
        totalCount
      };
    } else {
      throw new Error('Invalid API response structure');
    }
  } catch (error) {
    console.error('Error fetching bookings data:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const updateBookingStatus = async (bookingId, active) => {
  try {
    const response = await axios.put(`${url}/Bookings/${bookingId}/check`, { check: active });
    return response.data;
  } catch (error) {
    console.error('Error updating booking status:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const deleteBooking = async (id) => {
  try {
    const response = await axios.delete(`${url}/Bookings/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to delete booking with id ${id}:`, error.response ? error.response.data : error.message);
    throw error;
  }
};
