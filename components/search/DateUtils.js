// Date utility functions for the SearchBox component

/**
 * Format date from YYYY-MM-DD to DD/MM/YYYY
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {string} Date in DD/MM/YYYY format
 */
export const formatDateForDisplay = (dateString) => {
  try {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  } catch (e) {
    return dateString;
  }
};

/**
 * Format date from DD/MM/YYYY to YYYY-MM-DD
 * @param {string} dateString - Date in DD/MM/YYYY format
 * @returns {string} Date in YYYY-MM-DD format
 */
export const formatDateForInput = (dateString) => {
  try {
    const [day, month, year] = dateString.split('/');
    return `${year}-${month}-${day}`;
  } catch (e) {
    return dateString;
  }
};

/**
 * Calculate number of nights between two dates
 * @param {string} checkIn - Check-in date in DD/MM/YYYY format
 * @param {string} checkOut - Check-out date in DD/MM/YYYY format
 * @returns {number} Number of nights
 */
export const calculateNights = (checkIn, checkOut) => {
  try {
    const dateIn = new Date(formatDateForInput(checkIn).replace(/-/g, '/'));
    const dateOut = new Date(formatDateForInput(checkOut).replace(/-/g, '/'));
    const diffTime = Math.abs(dateOut - dateIn);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 0;
  } catch (e) {
    return 0;
  }
};
