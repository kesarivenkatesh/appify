

import axios from 'axios';

class DashboardService {
  

  /**
   * Get dashboard statistics for the current user
   * @returns {Promise} Promise with dashboard stats data
   */
  async getDashboardStats() {
    try {
      const response = await axios.get('/user/dashboard-stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      
      // Return default data if API call fails
      return {
        journalCount: 0,
        streak: 0,
        lastActivity: 'No activity yet',
        moodTrend: {
          trend: 'neutral',
          description: 'No recent mood data'
        }
      };
    }
  }

  /**
   * Get user streak information
   * @returns {Promise} Promise with user streak data
   */
  async getUserStreak() {
    try {
      const response = await axios.get('/user/streak');
      return response.data;
    } catch (error) {
      console.error('Error fetching user streak:', error);
      return { streak: 0, unit: 'days' };
    }
  }

  /**
   * Get last activity information
   * @returns {Promise} Promise with last activity data
   */
  async getLastActivity() {
    try {
      const response = await axios.get('/user/last-activity');
      return response.data;
    } catch (error) {
      console.error('Error fetching last activity:', error);
      return { 
        lastActivity: null,
        relativeTime: 'No activity yet',
        activityType: null
      };
    }
  }

  /**
   * Get user video analytics
   * @returns {Promise} Promise with video analytics data
   */
  async getVideoAnalytics() {
    try {
      const response = await axios.get('/user/video-analytics');
      return response.data;
    } catch (error) {
      console.error('Error fetching video analytics:', error);
      return {
        totalWatched: 0,
        completionRate: 0,
        watchTimeByDay: [],
        mostWatchedCategories: []
      };
    }
  }

  /**
   * Get user activity history
   * @param {number} limit - Maximum number of activities to return
   * @returns {Promise} Promise with activity history data
   */
  async getActivityHistory(limit = 20) {
    try {
      const response = await axios.get('/user/activity-history', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching activity history:', error);
      return [];
    }
  }
}

export default DashboardService;