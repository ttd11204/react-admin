import axios from 'axios';

const url = 'https://courtcaller.azurewebsites.net/api';


//fetch bookings
export const fetchBookings = async (pageNumber = 1, pageSize = 10) => {
  try {
    const response = await axios.get(`${url}/Bookings`, {
      params: {
        pageNumber,
        pageSize
      }
    });

    if (Array.isArray(response.data)) {
      const items = response.data;
      const totalCount = parseInt(response.headers['x-total-count'], 10) || 100;

      const users = await fetchUsers();
      const courts = await fetchCourts();

      const itemsWithDetails = items.map(item => {
        const user = users.find(u => u.id === item.id);
        const court = courts.find(c => c.courtId === item.courtId);
        return {
          ...item,
          email: user ? user.email : 'N/A',
          courtName: court ? court.courtName : 'N/A'
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

//fetch users
export const fetchUsers = async () => {
  try {
    const response = await axios.get(`${url}/Users`);
    return response.data;
  } catch (error) {
    console.error('Error fetching users data:', error.response ? error.response.data : error.message);
    throw error;
  }
};

//fetch courts
export const fetchCourts = async () => {
  try {
    const response = await axios.get(`${url}/Courts`);
    return response.data;
  } catch (error) {
    console.error('Error fetching courts data:', error.response ? error.response.data : error.message);
    throw error;
  }
};

//delete (set false)
export const deleteBooking = async (id) => {
  try {
    const response = await axios.delete(`${url}/Bookings/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting booking:', error.response ? error.response.data : error.message);
    throw error;
  }
};

//booking by day
export const reserveSlots = async (userId, bookings) => {
  try {
    const response = await axios.post(`https://courtcaller.azurewebsites.net/api/Bookings/reserve-slot?userId=${userId}`, bookings);
    return response.data;
  } catch (error) {
    console.error('Error reserving slots', error);
    throw error;
  }
};

//search
export const fetchBookingById = async (bookingId) => {
  try {
    const response = await axios.get(`${url}/Bookings/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching booking by ID:', error.response ? error.response.data : error.message);
    throw error;
  }
};

