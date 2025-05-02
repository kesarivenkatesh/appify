import axios from 'axios';

class MoodService {
  constructor() {
    this.axiosInstance = axios.create({
      baseURL: 'http://happify.kentcs.org:8000',
      
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
  
  /**
   * Log a new mood
   * @param {Object} moodData - The mood data to log
   * @returns {Promise} Promise with the logged mood
   */
  async logMood(moodData) {
    try {
      const response = await this.axiosInstance.post('/moods', moodData);
      return response.data;
    } catch (error) {
      console.error('Error logging mood:', error);
      throw error;
    }
  }

  /**
   * Get the user's current mood (last logged mood)
   * @returns {Promise} Promise with the current mood data
   */
  async getCurrentMood() {
    try {
      // Try the new dedicated endpoint first
      try {
        const response = await this.axiosInstance.get('/moods/current');
        return response.data;
      } catch (e) {
        // Fall back to the legacy endpoint if the new one isn't available
        console.log('Current mood endpoint not available, falling back to last mood endpoint');
        const response = await this.axiosInstance.get('/moods/last');
        return response.data;
      }
    } catch (error) {
      console.error('Error getting current mood:', error);
      // Return a default mood if the API fails
      return {
        mood: 'neutral',
        intensity: 3,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get the last logged mood (alias for getCurrentMood for backward compatibility)
   * @returns {Promise} Promise with the last mood data
   */
  async getLastMood() {
    return this.getCurrentMood();
  }

  /**
   * Get mood trend data
   * @returns {Promise} Promise with mood trend data
   */
  async getMoodTrend() {
    try {
      const response = await this.axiosInstance.get('/moods/trend');
      return response.data;
    } catch (error) {
      console.error('Error getting mood trend:', error);
      throw error;
    }
  }

  /**
   * Get all moods with optional time range
   * @param {string} timeRange - The time range to get moods for ('all', 'week', 'month', 'year')
   * @returns {Promise} Promise with mood data
   */
  async getMoods(timeRange = 'all') {
    try {
      const response = await this.axiosInstance.get(`/moods?time_range=${timeRange}`);
      // Check if the response is valid and has data
      if (response && response.data) {
        // Ensure timestamps are properly formatted
        return response.data.map(mood => this.formatMoodData(mood));
      }
      return [];
    } catch (error) {
      console.error('Error getting moods:', error);
      throw error;
    }
  }

  // For backward compatibility - keeping the existing getAllMoods method
  async getAllMoods() {
    return this.getMoods('all');
  }

  // Format mood data for consistency
  formatMoodData(mood) {
    if (!mood) return null;
    
    // Handle MongoDB date formats
    let timestamp = mood.timestamp;
    if (mood.timestamp && mood.timestamp.$date) {
      timestamp = new Date(mood.timestamp.$date).toISOString();
    }
    
    // Ensure date property exists
    let date = mood.date;
    if (!date && timestamp) {
      date = new Date(timestamp).toISOString().split('T')[0];
    }
    
    // Ensure source is specified
    const source = mood.source || 'mood_log';
    
    return {
      ...mood,
      timestamp,
      date,
      source
    };
  }
  
  /**
   * Get comprehensive mood analytics
   * @param {string} timeRange - The time range for analytics ('week', 'month', 'year', 'all')
   * @returns {Promise} Promise with mood analytics data
   */
  async getMoodAnalytics(timeRange = 'month') {
    try {
      const response = await this.axiosInstance.get(`/moods/analytics?time_range=${timeRange}`);
      if (response && response.data) {
        // Format moods data if present
        if (response.data.moods) {
          response.data.moods = response.data.moods.map(mood => this.formatMoodData(mood));
        }
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Error getting mood analytics:', error);
      throw error;
    }
  }

  /**
   * Get mood distribution
   * @param {string} timeRange - The time range for distribution ('week', 'month', 'year', 'all')
   * @returns {Promise} Promise with mood distribution data
   */
  async getMoodDistribution(timeRange = 'month') {
    try {
      const response = await this.axiosInstance.get(`/moods/distribution?time_range=${timeRange}`);
      return response.data;
    } catch (error) {
      console.error('Error getting mood distribution:', error);
      throw error;
    }
  }
}

export default MoodService;