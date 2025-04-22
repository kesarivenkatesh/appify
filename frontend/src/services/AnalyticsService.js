import axios from 'axios';

class AnalyticsService {
  constructor() {
    this.axiosInstance = axios.create({
      baseURL: 'http://localhost:8000',
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Get mood history based on time range
   * @param {string} timeRange - 'week', 'month', 'year', or 'all'
   * @returns {Promise<Object>} - Mood history data
   */
  async getMoodHistory(timeRange = 'week') {
    try {
      // Map timeRange to appropriate days value
      let days;
      switch (timeRange) {
        case 'week':
          days = 7;
          break;
        case 'month':
          days = 30;
          break;
        case 'year':
          days = 365;
          break;
        default:
          days = 7; // Default to week
      }

      const response = await axios.get('/moods', {
        params: { days },
        withCredentials: true
      });
      
      // Format the data for our component
      const formattedData = response.data.moods.map(entry => ({
        date: new Date(entry.timestamp.$date),
        mood: entry.mood,
        intensity: entry.intensity || this.getMoodIntensity(entry.mood)
      }));
      
      return { data: formattedData };
    } catch (error) {
      console.error('Error fetching mood history:', error);
      throw error;
    }
  }

  /**
   * Get mood distribution (count of each mood type)
   * @param {string} timeRange - 'week', 'month', 'year', or 'all'
   * @returns {Promise<Object>} - Mood distribution data
   */
  async getMoodDistribution(timeRange = 'week') {
    try {
      // First get mood history
      const moodHistory = await this.getMoodHistory(timeRange);
      
      // Calculate distribution
      const distribution = {};
      moodHistory.data.forEach(entry => {
        if (!distribution[entry.mood]) {
          distribution[entry.mood] = 0;
        }
        distribution[entry.mood]++;
      });
      
      // Convert to array format
      const formattedData = Object.keys(distribution).map(mood => ({
        mood,
        count: distribution[mood]
      }));
      
      return { data: formattedData };
    } catch (error) {
      console.error('Error calculating mood distribution:', error);
      throw error;
    }
  }

  /**
   * Get user's mood trend
   * @returns {Promise<Object>} - Mood trend data
   */
  async getMoodTrend() {
    try {
      const response = await axios.get('/moods/trend', { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error('Error fetching mood trend:', error);
      throw error;
    }
  }

  /**
   * Get user's last logged mood
   * @returns {Promise<Object>} - Last mood data
   */
  async getLastMood() {
    try {
      const response = await axios.get('/moods/last', { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error('Error fetching last mood:', error);
      throw error;
    }
  }

  /**
   * Get user's dashboard stats (combines multiple endpoints)
   * @returns {Promise<Object>} - Dashboard stats
   */
  async getDashboardStats() {
    try {
      const response = await axios.get('/user/dashboard-stats', { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  /**
   * Helper function to map mood to intensity if not provided
   * @param {string} mood - The mood name
   * @returns {number} - The intensity value
   */
  getMoodIntensity(mood) {
    const intensityMap = {
      'excited': 5,
      'happy': 4,
      'content': 3,
      'neutral': 2,
      'anxious': 3,
      'tired': 2,
      'sad': 3,
      'angry': 4
    };
    
    return intensityMap[mood] || 3; // Default to medium intensity
  }
  
  /** 
   * The following methods are part of your original implementation
   */
  
  /**
   * Get mood distribution data for the specified time range
   * @param {string} timeRange - 'week', 'month', 'quarter', or 'year'
   * @returns {Promise<Object>} - Mood distribution data
   */
  async getMoodDistributionOld(timeRange = 'month') {
    try {
      const response = await this.axiosInstance.get(`/analytics/mood-distribution`, {
        params: { timeRange }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching mood distribution:', error);
      throw error;
    }
  }
  
  /**
   * Get mood data grouped by time of day
   * @param {string} timeRange - 'week', 'month', 'quarter', or 'year'
   * @returns {Promise<Object>} - Mood by time of day data
   */
  async getMoodByTimeOfDay(timeRange = 'month') {
    try {
      const response = await this.axiosInstance.get(`/analytics/mood-by-time`, {
        params: { timeRange }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching mood by time of day:', error);
      throw error;
    }
  }
  
  /**
   * Get correlation between activities and mood improvement
   * @param {string} timeRange - 'week', 'month', 'quarter', or 'year'
   * @returns {Promise<Object>} - Activity correlation data
   */
  async getActivityCorrelation(timeRange = 'month') {
    try {
      const response = await this.axiosInstance.get(`/analytics/activity-correlation`, {
        params: { timeRange }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching activity correlation:', error);
      throw error;
    }
  }
  
  /**
   * Get user's streak data
   * @returns {Promise<Object>} - Streak statistics
   */
  async getStreakData() {
    try {
      const response = await this.axiosInstance.get(`/analytics/streak-data`);
      return response.data;
    } catch (error) {
      console.error('Error fetching streak data:', error);
      throw error;
    }
  }
  
  /**
   * Export analytics data as CSV
   * @param {string} timeRange - 'week', 'month', 'quarter', or 'year'
   * @returns {Promise<Blob>} - CSV file as blob
   */
  async exportAnalyticsData(timeRange = 'month') {
    try {
      const response = await this.axiosInstance.get(`/analytics/export`, {
        params: { timeRange },
        responseType: 'blob'
      });
      
      // Create a download link for the CSV file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `happify-analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return response.data;
    } catch (error) {
      console.error('Error exporting analytics data:', error);
      throw error;
    }
  }
  
  /**
   * Get personalized insights based on user's mood data
   * @param {string} timeRange - 'week', 'month', 'quarter', or 'year'
   * @returns {Promise<Object>} - Personalized insights
   */
  async getPersonalizedInsights(timeRange = 'month') {
    try {
      const response = await this.axiosInstance.get(`/analytics/insights`, {
        params: { timeRange }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching personalized insights:', error);
      throw error;
    }
  }
}

export default AnalyticsService;