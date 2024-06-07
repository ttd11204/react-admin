// src/api/bookingApi.js

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

      const users = await fetchUsers();
      const courts = await fetchCourts();

      const itemsWithDetails = items.map(item => {
        const user = users.find(u => u.id === item.id);
        const court = item.timeSlots && item.timeSlots[0] ? courts.find(c => c.courtId === item.timeSlots[0].courtId) : null;
        return {
          ...item,
          email: user ? user.email : 'N/A',
          courtName: court ? court.courtName : 'N/A',
          totalPrice: item.totalPrice || 'N/A'
        };
      });

      return {
        items: itemsWithDetails,
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

export const fetchUsers = async () => {
  try {
    const response = await axios.get(`${url}/Users`);
    return response.data;
  } catch (error) {
    console.error('Error fetching users data:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const fetchCourts = async () => {
  try {
    const response = await axios.get(`${url}/Courts`);
    return response.data;
  } catch (error) {
    console.error('Error fetching courts data:', error.response ? error.response.data : error.message);
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

export const searchBookingsByUserId = async (userId) => {
  try {
    const response = await axios.get(`${url}/Bookings/search/${userId}`);
    if (Array.isArray(response.data)) {
      const items = response.data;

      const users = await fetchUsers();
      const courts = await fetchCourts();

      const itemsWithDetails = items.map(item => {
        const user = users.find(u => u.id === item.id);
        const court = item.timeSlots && item.timeSlots[0] ? courts.find(c => c.courtId === item.timeSlots[0].courtId) : null;
        return {
          ...item,
          email: user ? user.email : 'N/A',
          courtName: court ? court.courtName : 'N/A',
          totalPrice: item.totalPrice || 'N/A'
        };
      });

      return itemsWithDetails;
    } else {
      throw new Error('Invalid API response structure');
    }
  } catch (error) {
    console.error('Error searching bookings by user ID:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const createBooking = async (bookingData) => {
  try {
    const response = await axios.post(`${url}/Bookings/reserve`, null, {
      params: {
        slotId: bookingData.slotId,
        userId: bookingData.userId,
        paymentAmount: bookingData.paymentAmount
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating booking:', error.response ? error.response.data : error.message);
    throw error;
  }
};
