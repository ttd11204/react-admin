import axios from 'axios';

const url = 'https://courtcaller.azurewebsites.net/api';

export const fetchBookings = async (pageNumber = 1, pageSize = 10, searchQuery = '') => {
  try {
    const params = { pageNumber, pageSize, searchQuery };
    const response = await axios.get(`${url}/Bookings`, { params });

    if (Array.isArray(response.data)) {
      const items = response.data;
      const totalCount = parseInt(response.headers['x-total-count'], 10) || 100;
      return { items, totalCount };
    } else {
      throw new Error('Invalid API response structure');
    }
  } catch (error) {
    console.error('Error fetching bookings data:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const deleteBooking = async (id) => {
  try {
    const response = await axios.delete(`${url}/Bookings/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting booking:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const reserveSlots = async (userId, bookings) => {
  try {
    const response = await axios.post(`${url}/Bookings/reserve-slot?userId=${userId}`, bookings);
    return response.data;
  } catch (error) {
    console.error('Error reserving slots', error);
    throw error;
  }
};

export const fetchBookingById = async (bookingId) => {
  try {
    const response = await axios.get(`${url}/Bookings/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching booking by ID:', error.response ? error.response.data : error.message);
    throw error;
  }
};
