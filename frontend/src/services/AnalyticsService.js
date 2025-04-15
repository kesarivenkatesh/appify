import axios from 'axios';

class AnalyticsService {
 
  /**
   * Get mood distribution data for the specified time range
   * @param {string} timeRange - 'week', 'month', 'quarter', or 'year'
   * @returns {Promise<Object>} - Mood distribution data
   */
  async getMoodDistribution(timeRange = 'month') {
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