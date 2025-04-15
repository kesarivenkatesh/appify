// services/MoodService.js
import axios from 'axios';

// MoodService.js - Service for managing mood data
class MoodService {
   
  
    /**
     * Log a new mood entry
     * @param {Object} moodData - The mood data to log
     * @param {string} moodData.mood - The mood value (happy, sad, etc.)
     * @param {number} moodData.intensity - The mood intensity value
     * @param {string} moodData.note - Optional note about the mood
     * @param {string} moodData.timestamp - ISO timestamp of when the mood was logged
     * @returns {Promise<Object>} - Response with the logged mood data
     */
    async logMood(moodData) {
      try {
        const response = await axios.post("/moods", moodData, {
            withCredentials: true
           }); 
        }catch (error) {
        console.error('Error in logMood:', error);
        throw error;
      }
    }
  
    /**
     * Get the user's mood history
     * @param {number} days - Number of days to retrieve history for
     * @returns {Promise<Array>} - Array of mood entries
     */
    async getMoodHistory(days = 7) {
      try {
        const response = await axios.get("/moods/history?days=${days}`", {
          withCredentials: true
        });

        return response.data;
      } catch (error) {
        console.error('Error in getMoodHistory:', error);
        throw error;
      }
    }
  
    /**
     * Get the user's latest mood
     * @returns {Promise<Object>} - The latest mood entry or null
     */
    async getLatestMood() {
      try {
        const response = await axios.get("/moods/latest`", {
          withCredentials:true
        });
  
        return response.data;
      } catch (error) {
        console.error('Error in getLatestMood:', error);
        return null;
      }
    }
  
    /**
     * Get the user's mood trend
     * @returns {Promise<Object>} - The mood trend data
     */
    async getMoodTrend() {
      try {
        const response = await axios.get(`/moods/trend`, {
            withCredentials: true
          });
          return response.data;
      } catch (error) {
        console.error('Error in getMoodTrend:', error);
        return { trend: 'neutral', description: 'Steady' };
      }
    }
  }
  
  export default MoodService;