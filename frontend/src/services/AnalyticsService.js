import axios from 'axios';
import MoodService from './MoodService';

class AnalyticsService {
  constructor() {
    this.axiosInstance = axios.create({
      baseURL: 'http://happify.kentcs.org:8000',
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    this.moodService = new MoodService();
  }

  /**
   * Get comprehensive analytics data for the MoodAnalyticsPage
   * @param {string} timeRange - 'week', 'month', 'quarter', or 'year'
   * @returns {Promise<Object>} - Complete analytics data
   */
  async getComprehensiveAnalytics(timeRange = 'month') {
    try {
      // Create a single object with all the necessary data
      const analyticsData = {
        moods: [],
        stats: {
          mostCommonMood: 'neutral',
          averageIntensity: 3,
          variability: 'low',
          trend: 'stable',
          totalEntries: 0
        },
        moodDistribution: [],
        moodByTimeOfDay: [],
        activityCorrelation: [],
        streakData: {
          current: 0,
          longest: 0,
          thisWeek: 0,
          thisMonth: 0
        },
        calendarData: []
      };

      // First, try to use the MoodService's combined analytics
      try {
        const combinedData = await this.moodService.generateCombinedAnalytics(timeRange);
        
        if (combinedData) {
          // Use data from combined analytics if available
          if (combinedData.moods) analyticsData.moods = combinedData.moods;
          if (combinedData.summary) analyticsData.stats = combinedData.summary;
          if (combinedData.distribution) analyticsData.moodDistribution = combinedData.distribution;
          if (combinedData.timeOfDay) analyticsData.moodByTimeOfDay = combinedData.timeOfDay;
          if (combinedData.activityCorrelations) analyticsData.activityCorrelation = combinedData.activityCorrelations;
          if (combinedData.streakData) analyticsData.streakData = combinedData.streakData;
          if (combinedData.calendar) analyticsData.calendarData = combinedData.calendar;
          
          return analyticsData;
        }
      } catch (error) {
        console.warn('Error fetching combined analytics, falling back to individual methods:', error);
      }

      // If combined analytics fails, try individual methods
      
      // Get mood data
      const moodData = await this.moodService.getMoods(timeRange);
      analyticsData.moods = moodData;
      
      // Get mood distribution
      try {
        const distribution = await this.getMoodDistribution(timeRange);
        analyticsData.moodDistribution = distribution.data;
      } catch (error) {
        // Calculate distribution locally if API fails
        analyticsData.moodDistribution = this.calculateMoodDistribution(moodData);
      }
      
      // Get mood by time of day
      try {
        const timeOfDayData = await this.getMoodByTimeOfDay(timeRange);
        analyticsData.moodByTimeOfDay = timeOfDayData.data;
      } catch (error) {
        // Process time of day data locally
        analyticsData.moodByTimeOfDay = this.processMoodByTimeOfDay(moodData);
      }
      
      // Get activity correlation
      try {
        const correlationData = await this.getActivityCorrelation(timeRange);
        analyticsData.activityCorrelation = correlationData.data;
      } catch (error) {
        // Calculate activity correlation locally
        analyticsData.activityCorrelation = this.analyzeActivityCorrelations(moodData);
      }
      
      // Get streak data
      try {
        const streakData = await this.getStreakData();
        analyticsData.streakData = streakData;
      } catch (error) {
        // Try to get streak from MoodService
        try {
          const userStreak = await this.moodService.getUserStreak();
          if (userStreak) {
            analyticsData.streakData = {
              current: userStreak.streak || 0,
              longest: userStreak.longest || 0,
              thisWeek: userStreak.thisWeek || 0,
              thisMonth: userStreak.thisMonth || 0
            };
          }
        } catch (err) {
          console.warn('Could not fetch streak data:', err);
        }
      }
      
      // Calculate mood statistics
      analyticsData.stats = this.calculateMoodStats(moodData);
      
      // Create calendar data
      analyticsData.calendarData = this.generateCalendarData(moodData);
      
      return analyticsData;
    } catch (error) {
      console.error('Error getting comprehensive analytics:', error);
      throw error;
    }
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
        case 'quarter':
          days = 90;
          break;
        case 'year':
          days = 365;
          break;
        default:
          days = 7; // Default to week
      }

      const response = await this.axiosInstance.get('/moods', {
        params: { days }
      });
      
      // Format the data for our component
      const formattedData = response.data.map(entry => ({
        date: new Date(entry.timestamp.$date || entry.timestamp),
        mood: entry.mood,
        intensity: entry.intensity || this.getMoodIntensity(entry.mood)
      }));
      
      return { data: formattedData };
    } catch (error) {
      console.error('Error fetching mood history:', error);
      
      // Try to get moods from MoodService as fallback
      try {
        const moods = await this.moodService.getMoods(timeRange);
        return { data: moods };
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        throw error;
      }
    }
  }

  /**
   * Get mood distribution (count of each mood type)
   * @param {string} timeRange - 'week', 'month', 'quarter', or 'year'
   * @returns {Promise<Object>} - Mood distribution data
   */
  async getMoodDistribution(timeRange = 'month') {
    try {
      // Try endpoint if available
      try {
        const response = await this.axiosInstance.get(`/moods/distribution`, {
          params: { time_range: timeRange }
        });
        return { data: response.data.data || [] };
      } catch (apiError) {
        console.warn('API endpoint not available, calculating locally');
        
        // First get mood history
        const moodHistory = await this.getMoodHistory(timeRange);
        
        // Calculate distribution
        const distribution = {};
        moodHistory.data.forEach(entry => {
          const mood = entry.mood || 'neutral';
          distribution[mood] = (distribution[mood] || 0) + 1;
        });
        
        // Convert to array format
        const formattedData = Object.keys(distribution).map(mood => ({
          mood,
          count: distribution[mood]
        }));
        
        return { data: formattedData };
      }
    } catch (error) {
      console.error('Error calculating mood distribution:', error);
      throw error;
    }
  }

  /**
   * Calculate mood distribution locally
   * @param {Array} moodData - Array of mood entries
   * @returns {Array} - Formatted mood distribution
   */
  calculateMoodDistribution(moodData) {
    if (!moodData || moodData.length === 0) {
      return [];
    }
    
    const distribution = {};
    moodData.forEach(entry => {
      const mood = entry.mood || 'neutral';
      distribution[mood] = (distribution[mood] || 0) + 1;
    });
    
    return Object.keys(distribution).map(mood => ({
      mood,
      count: distribution[mood]
    }));
  }

  /**
   * Get user's mood trend
   * @returns {Promise<Object>} - Mood trend data
   */
  async getMoodTrend() {
    try {
      const response = await this.axiosInstance.get('/moods/trend');
      return response.data;
    } catch (error) {
      console.error('Error fetching mood trend:', error);
      throw error;
    }
  }

  /**
   * Get user's current mood
   * @returns {Promise<Object>} - Current mood data
   */
  async getCurrentMood() {
    try {
      // Try the dedicated endpoint first
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
   * Helper function to map mood to intensity if not provided
   * @param {string} mood - The mood name
   * @returns {number} - The intensity value
   */
  getMoodIntensity(mood) {
    const intensityMap = {
      'excited': 5,
      'happy': 4,
      'content': 3,
      'neutral': 3,
      'anxious': 3,
      'tired': 2,
      'sad': 2,
      'angry': 4
    };
    
    return intensityMap[mood.toLowerCase()] || 3; // Default to medium intensity
  }
  
  /**
   * Process mood data by time of day
   * @param {Array} moodData - Array of mood entries
   * @returns {Array} - Processed time of day data
   */
  processMoodByTimeOfDay(moodData) {
    if (!moodData || moodData.length === 0) {
      return [
        { time: 'Morning', excited: 0, happy: 0, content: 0, neutral: 0, anxious: 0, tired: 0, sad: 0, angry: 0 },
        { time: 'Afternoon', excited: 0, happy: 0, content: 0, neutral: 0, anxious: 0, tired: 0, sad: 0, angry: 0 },
        { time: 'Evening', excited: 0, happy: 0, content: 0, neutral: 0, anxious: 0, tired: 0, sad: 0, angry: 0 },
        { time: 'Night', excited: 0, happy: 0, content: 0, neutral: 0, anxious: 0, tired: 0, sad: 0, angry: 0 }
      ];
    }
    
    // Initialize time periods
    const timeOfDayData = [
      { time: 'Morning', excited: 0, happy: 0, content: 0, neutral: 0, anxious: 0, tired: 0, sad: 0, angry: 0 },
      { time: 'Afternoon', excited: 0, happy: 0, content: 0, neutral: 0, anxious: 0, tired: 0, sad: 0, angry: 0 },
      { time: 'Evening', excited: 0, happy: 0, content: 0, neutral: 0, anxious: 0, tired: 0, sad: 0, angry: 0 },
      { time: 'Night', excited: 0, happy: 0, content: 0, neutral: 0, anxious: 0, tired: 0, sad: 0, angry: 0 }
    ];
    
    // Process each mood entry
    moodData.forEach(entry => {
      let timeOfDay;
      let hour;
      
      // Extract hour from timestamp
      if (entry.timestamp) {
        const date = new Date(entry.timestamp);
        hour = date.getHours();
      } else if (entry.time) {
        const timeParts = entry.time.split(':');
        hour = parseInt(timeParts[0], 10);
      } else {
        // Default to afternoon if no time data
        hour = 14;
      }
      
      // Determine time of day
      if (hour >= 5 && hour < 12) {
        timeOfDay = 'Morning';
      } else if (hour >= 12 && hour < 17) {
        timeOfDay = 'Afternoon';
      } else if (hour >= 17 && hour < 21) {
        timeOfDay = 'Evening';
      } else {
        timeOfDay = 'Night';
      }
      
      // Increment the corresponding mood for this time of day
      const mood = entry.mood || 'neutral';
      const timeIndex = timeOfDayData.findIndex(item => item.time === timeOfDay);
      
      if (timeIndex !== -1 && timeOfDayData[timeIndex][mood] !== undefined) {
        timeOfDayData[timeIndex][mood]++;
      }
    });
    
    return timeOfDayData;
  }
  
  /**
   * Calculate mood summary statistics
   * @param {Array} moodData - Array of mood entries
   * @returns {Object} - Mood statistics
   */
  calculateMoodStats(moodData) {
    if (!moodData || moodData.length === 0) {
      return {
        mostCommonMood: 'neutral',
        averageIntensity: 3,
        variability: 'low',
        trend: 'stable',
        totalEntries: 0
      };
    }
    
    // Count occurrences of each mood
    const moodCounts = {};
    let totalIntensity = 0;
    const intensityValues = [];
    
    moodData.forEach(entry => {
      const mood = entry.mood || 'neutral';
      const intensity = entry.intensity || this.getMoodIntensity(mood);
      
      // Update mood counts
      moodCounts[mood] = (moodCounts[mood] || 0) + 1;
      
      // Update intensity stats
      totalIntensity += intensity;
      intensityValues.push(intensity);
    });
    
    // Find most common mood
    let mostCommonMood = 'neutral';
    let maxCount = 0;
    for (const [mood, count] of Object.entries(moodCounts)) {
      if (count > maxCount) {
        mostCommonMood = mood;
        maxCount = count;
      }
    }
    
    // Calculate average intensity
    const avgIntensity = totalIntensity / moodData.length;
    
    // Calculate variability (standard deviation)
    let stdDev = 0;
    if (intensityValues.length > 1) {
      const mean = totalIntensity / intensityValues.length;
      const variance = intensityValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / intensityValues.length;
      stdDev = Math.sqrt(variance);
    }
    
    // Determine variability level
    let variability = 'low';
    if (stdDev > 1.5) {
      variability = 'high';
    } else if (stdDev > 0.7) {
      variability = 'medium';
    }
    
    // Determine mood trend (improving, worsening, or stable)
    let trend = 'stable';
    if (moodData.length >= 3) {
      // Sort by date to ensure chronological analysis
      const sortedMoods = [...moodData].sort((a, b) => {
        const dateA = new Date(a.date || a.timestamp);
        const dateB = new Date(b.date || b.timestamp);
        return dateA - dateB; // Oldest to newest
      });
      
      // Split moods into first and second half
      const half = Math.floor(sortedMoods.length / 2);
      const firstHalf = sortedMoods.slice(0, half);
      const secondHalf = sortedMoods.slice(half);
      
      // Calculate average intensity for each half
      const firstHalfAvg = firstHalf.reduce((sum, entry) => sum + (entry.intensity || this.getMoodIntensity(entry.mood)), 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((sum, entry) => sum + (entry.intensity || this.getMoodIntensity(entry.mood)), 0) / secondHalf.length;
      
      // Determine trend
      if (secondHalfAvg - firstHalfAvg > 0.5) {
        trend = 'improving';
      } else if (firstHalfAvg - secondHalfAvg > 0.5) {
        trend = 'worsening';
      }
    }
    
    return {
      mostCommonMood,
      averageIntensity: Number(avgIntensity.toFixed(2)),
      variability,
      trend,
      totalEntries: moodData.length
    };
  }
  
  /**
   * Analyze correlations between activities and moods
   * @param {Array} moodData - Array of mood entries
   * @returns {Array} - Activity correlation data
   */
  analyzeActivityCorrelations(moodData) {
    if (!moodData || moodData.length === 0) {
      return [];
    }
    
    // Default activities to track
    const activities = [
      { name: 'Exercise', positiveImpact: 0, count: 0 },
      { name: 'Meditation', positiveImpact: 0, count: 0 },
      { name: 'Journal', positiveImpact: 0, count: 0 },
      { name: 'Social', positiveImpact: 0, count: 0 },
      { name: 'Work', positiveImpact: 0, count: 0 }
    ];
    
    // Define positive moods
    const positiveMoods = ['excited', 'happy', 'content'];
    
    // Process each mood entry
    moodData.forEach(entry => {
      // Skip entries without notes
      if (!entry.notes && !entry.note) {
        return;
      }
      
      const note = (entry.notes || entry.note || '').toLowerCase();
      const mood = entry.mood || 'neutral';
      const isPositive = positiveMoods.includes(mood);
      
      // Check for activity mentions
      activities.forEach(activity => {
        if (note.includes(activity.name.toLowerCase())) {
          activity.count++;
          if (isPositive) {
            activity.positiveImpact++;
          }
        }
      });
    });
    
    // Calculate positive impact percentage
    const result = activities.map(activity => {
      const positivePercentage = activity.count > 0 
        ? Math.round((activity.positiveImpact / activity.count) * 100) 
        : 0;
      
      return {
        name: activity.name,
        positiveImpact: positivePercentage,
        count: activity.count
      };
    });
    
    // Sort by positive impact (descending)
    result.sort((a, b) => b.positiveImpact - a.positiveImpact);
    
    // Filter out activities with no data
    const filtered = result.filter(activity => activity.count > 0);
    
    // Return at least one item for visualization
    return filtered.length > 0 ? filtered : [{ name: 'General Activities', positiveImpact: 50, count: 1 }];
  }
  
  /**
   * Generate calendar data for visualization
   * @param {Array} moodData - Array of mood entries
   * @returns {Array} - Formatted calendar data
   */
  generateCalendarData(moodData) {
    if (!moodData || moodData.length === 0) {
      return [];
    }
    
    // Group moods by date
    const moodsByDate = {};
    
    moodData.forEach(mood => {
      // Ensure date is extracted correctly
      const date = mood.date || (mood.timestamp ? new Date(mood.timestamp).toISOString().split('T')[0] : null);
      if (!date) return;
      
      if (!moodsByDate[date]) {
        moodsByDate[date] = [];
      }
      moodsByDate[date].push(mood);
    });
    
    // Format for calendar
    return Object.entries(moodsByDate).map(([date, entries]) => ({
      date,
      entries
    }));
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
      
      // Get mood data and calculate locally
      try {
        const moodData = await this.moodService.getMoods(timeRange);
        const timeOfDayData = this.processMoodByTimeOfDay(moodData);
        return { data: timeOfDayData };
      } catch (fallbackError) {
        console.error('Fallback calculation failed:', fallbackError);
        throw error;
      }
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
      
      // Calculate locally
      try {
        const moodData = await this.moodService.getMoods(timeRange);
        const correlationData = this.analyzeActivityCorrelations(moodData);
        return { data: correlationData };
      } catch (fallbackError) {
        console.error('Fallback calculation failed:', fallbackError);
        throw error;
      }
    }
  }
  
  /**
   * Get user's streak data
   * @returns {Promise<Object>} - Streak statistics
   */
  async getStreakData() {
    try {
      const response = await this.axiosInstance.get(`/user/streak`);
      return {
        current: response.data.streak || 0,
        longest: response.data.longest || response.data.streak || 0,
        thisWeek: response.data.thisWeek || 0,
        thisMonth: response.data.thisMonth || 0
      };
    } catch (error) {
      console.error('Error fetching streak data:', error);
      throw error;
    }
  }
  
  /**
   * Get user's dashboard stats
   * @returns {Promise<Object>} - Dashboard stats
   */
  async getDashboardStats() {
    try {
      const response = await this.axiosInstance.get('/user/dashboard-stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
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
      // First try API endpoint if available
      try {
        const response = await this.axiosInstance.get(`/analytics/export`, {
          params: { timeRange },
          responseType: 'blob'
        });
        
        return this.handleCSVDownload(response.data, timeRange);
      } catch (apiError) {
        console.warn('Export API not available, generating CSV locally');
        
        // Get mood data
        const moodData = await this.moodService.getMoods(timeRange);
        
        // Convert to CSV
        const headers = ['Date', 'Mood', 'Intensity', 'Notes', 'Source'];
        const csvRows = [headers.join(',')];
        
        moodData.forEach(entry => {
          const date = entry.date || new Date(entry.timestamp).toISOString().split('T')[0];
          const mood = entry.mood || 'neutral';
          const intensity = entry.intensity || this.getMoodIntensity(mood);
          const notes = (entry.notes || entry.note || '').replace(/,/g, ' ').replace(/\n/g, ' ');
          const source = entry.source || 'mood_log';
          
          csvRows.push(`${date},${mood},${intensity},"${notes}",${source}`);
        });
        
        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        
        return this.handleCSVDownload(blob, timeRange);
      }
    } catch (error) {
      console.error('Error exporting analytics data:', error);
      throw error;
    }
  }
  
  /**
   * Helper to handle CSV download
   * @param {Blob} blob - CSV data blob
   * @param {string} timeRange - Time range for filename
   * @returns {Blob} - The blob (for chaining)
   */
  handleCSVDownload(blob, timeRange) {
    // Create a download link for the CSV file
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `happify-analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return blob;
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
      
      // Generate insights locally
      try {
        const analyticsData = await this.getComprehensiveAnalytics(timeRange);
        
        // Generate basic insights
        const insights = [
          `Your most common mood is ${analyticsData.stats.mostCommonMood}, which appears in ${analyticsData.moodDistribution.find(m => m.mood === analyticsData.stats.mostCommonMood)?.count || 0} entries.`,
          `Your mood trend is ${analyticsData.stats.trend}, with an average intensity of ${analyticsData.stats.averageIntensity.toFixed(1)}.`
        ];
        
        // Add activity insight if available
        if (analyticsData.activityCorrelation.length > 0 && analyticsData.activityCorrelation[0].positiveImpact > 50) {
          insights.push(`${analyticsData.activityCorrelation[0].name} appears to have a positive impact on your mood (${analyticsData.activityCorrelation[0].positiveImpact}% positive correlation).`);
        }
        
        return { insights };
      } catch (fallbackError) {
        console.error('Fallback insights generation failed:', fallbackError);
        throw error;
      }
    }
  }
}

export default AnalyticsService;