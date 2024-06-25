import axios from 'axios';

const url = 'https://courtcaller.azurewebsites.net/api';

// Fetch bookings with pagination and optional search query
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

// Delete a booking by ID
export const deleteBooking = async (id) => {
  try {
    const response = await axios.delete(`${url}/Bookings/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting booking:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Reserve slots for a user
export const reserveSlots = async (userId, bookings) => {
  try {
    const response = await axios.post(`${url}/Bookings/reserve-slot?userId=${userId}`, bookings);
    return response.data;
  } catch (error) {
    console.error('Error reserving slots', error);
    throw error;
  }
};

// Fetch booking by ID
export const fetchBookingById = async (bookingId) => {
  try {
    const response = await axios.get(`${url}/Bookings/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching booking by ID:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Create a flexible booking
export const createBookingFlex = async (userId, numberOfSlot, branchId) => {
  try {
    const data = { userId, numberOfSlot, branchId };
    const response = await axios.post(`${url}/Bookings/flex`, data);
    return response.data;
  } catch (error) {
    console.error('Error creating flexible booking:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const checkavailableSlotByTypeFlex = async (userId, branchId) => {
  try {
    const response = await axios.get(`${url}/Bookings/CheckAvailableSlotsFromBookingTypeFlex/`, { params: { userId, branchId } });
    return response.data;
  } catch (error) {
    console.error('Error checking available slot:', error.response ? error.response.data : error.message);
    throw error;
  }
}

const isValidTime = (time) => {
  const timePattern = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
  return timePattern.test(time);
};

// Create a fixed booking
export const createFixedBooking = async (numberOfMonths, daysOfWeek, formattedStartDate, userId, branchId, slotStartTime, slotEndTime) => {
  try {
    // Check if slotStartTime and slotEndTime are valid
    if (!isValidTime(slotStartTime) || !isValidTime(slotEndTime)) {
      throw new Error('Invalid time format. Time should be in HH:MM:SS format.');
    }

    const params = new URLSearchParams();
    params.append('numberOfMonths', numberOfMonths);
    daysOfWeek.forEach(day => {
      params.append('dayOfWeek', day);
    });
    params.append('startDate', formattedStartDate);
    params.append('userId', userId);
    params.append('branchId', branchId);

    const urlWithParams = `${url}/Bookings/fix-slot?${params.toString()}`;

    console.log('URL with params:', urlWithParams);
    console.log('Request body:', {
      slotStartTime,
      slotEndTime,
    });

    const response = await axios.post(
      urlWithParams,
      {
        slotStartTime,
        slotEndTime,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
    } else if (error.request) {
      console.error('Error request:', error.request);
    } else {
      console.error('General Error:', error.message);
    }
    throw new Error('Error creating fixed booking. Please check the logs for more details.');
  }
};