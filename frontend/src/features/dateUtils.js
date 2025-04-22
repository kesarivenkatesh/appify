// dateUtils.js - Utility functions for date handling

/**
 * Checks if a date object is valid
 * @param {Date} date - The date object to validate
 * @returns {boolean} - True if the date is valid, false otherwise
 */
export const isValidDate = (date) => {
    return date instanceof Date && !isNaN(date.getTime());
  };
  
  /**
   * Formats a date as a string
   * @param {Date} date - The date to format
   * @param {boolean} includeTime - Whether to include time in the output (default: false)
   * @returns {string} - The formatted date string
   */
  export const formatDate = (date, includeTime = false) => {
    if (!isValidDate(date)) {
      return "Invalid date";
    }
    
    try {
      const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      };
      
      if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
      }
      
      return date.toLocaleDateString('en-US', options);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Date formatting error";
    }
  };
  
  /**
   * Tries to parse a date string safely
   * @param {string} dateStr - The date string to parse
   * @returns {Date|null} - The parsed Date object or null if invalid
   */
  export const parseDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return isValidDate(date) ? date : null;
    } catch (error) {
      console.error("Error parsing date:", error);
      return null;
    }
  };
  
  /**
   * Gets a relative date description (today, yesterday, etc.)
   * @param {Date} date - The date to describe
   * @returns {string} - A string describing the date relative to now
   */
  export const getRelativeDate = (date) => {
    if (!isValidDate(date)) {
      return "Invalid date";
    }
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDays = Math.floor((dateOnly - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === -1) {
      return "Yesterday";
    } else if (diffDays === 1) {
      return "Tomorrow";
    } else if (diffDays > 1 && diffDays < 7) {
      return `In ${diffDays} days`;
    } else if (diffDays < 0 && diffDays > -7) {
      return `${Math.abs(diffDays)} days ago`;
    }
    
    return formatDate(date);
  };
  
  export default {
    isValidDate,
    formatDate,
    parseDate,
    getRelativeDate
  };