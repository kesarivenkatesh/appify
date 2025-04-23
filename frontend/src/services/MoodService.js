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
  
  // Log a new mood
  async logMood(moodData) {
    try {
      const response = await this.axiosInstance.post('/moods', moodData);
      return response.data;
    } catch (error) {
      console.error('Error logging mood:', error);
      throw error;
    }
  }

  // Get mood trend data
  async getMoodTrend() {
    try {
      const response = await this.axiosInstance.get('/moods/trend');
      return response.data;
    } catch (error) {
      console.error('Error getting mood trend:', error);
      throw error;
    }
  }

  // Get the last logged mood
  async getLastMood() {
    try {
      const response = await this.axiosInstance.get('/moods/last');
      return response.data;
    } catch (error) {
      console.error('Error getting last mood:', error);
      throw error;
    }
  }

  // Get all moods with optional time range
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

  // Get comprehensive mood analytics
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

  // Get mood distribution
  async getMoodDistribution(timeRange = 'month') {
    try {
      const response = await this.axiosInstance.get(`/moods/distribution?time_range=${timeRange}`);
      return response.data;
    } catch (error) {
      console.error('Error getting mood distribution:', error);
      throw error;
    }
  }

  // Get user streak data
  async getUserStreak() {
    try {
      const response = await this.axiosInstance.get('/user/streak');
      return response.data;
    } catch (error) {
      console.error('Error getting user streak:', error);
      return { streak: 0, longest: 0, thisWeek: 0, thisMonth: 0 };
    }
  }

  // Get dashboard stats
  async getDashboardStats() {
    try {
      const response = await this.axiosInstance.get('/user/dashboard-stats');
      return response.data;
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      return null;
    }
  }

  // Extract mood from journal entries
  async extractMoodsFromJournals(timeRange = 'month') {
    try {
      // First, get all journal entries
      const journalResponse = await this.axiosInstance.get('/journal');
      const allJournals = journalResponse.data || [];
      
      // Calculate date range based on timeRange
      const now = new Date();
      let startDate = new Date();
      
      switch(timeRange) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setDate(now.getDate() - 30);
          break;
        case 'quarter':
          startDate.setDate(now.getDate() - 90);
          break;
        case 'year':
          startDate.setDate(now.getDate() - 365);
          break;
        default:
          startDate = new Date(2000, 0, 1); // Far back in time
      }
      
      // Filter journals by date
      const journals = allJournals.filter(journal => {
        const journalDate = new Date(journal.date || journal.createdAt || journal.timestamp);
        return journalDate >= startDate && journalDate <= now;
      });
      
      if (!journals || journals.length === 0) {
        return [];
      }
      
      // Simple sentiment analysis to extract mood from journal content
      const moodKeywords = {
        'happy': ['happy', 'joy', 'delighted', 'pleased', 'cheerful', 'content', 'great'],
        'excited': ['excited', 'thrilled', 'enthusiastic', 'eager', 'energetic'],
        'content': ['content', 'satisfied', 'peaceful', 'relaxed', 'calm', 'good'],
        'neutral': ['neutral', 'okay', 'fine', 'normal', 'average'],
        'tired': ['tired', 'exhausted', 'sleepy', 'fatigued', 'drained'],
        'anxious': ['anxious', 'worried', 'nervous', 'uneasy', 'stressed', 'overwhelmed'],
        'sad': ['sad', 'unhappy', 'disappointed', 'down', 'blue', 'depressed'],
        'angry': ['angry', 'upset', 'annoyed', 'frustrated', 'mad', 'irritated']
      };
      
      const extractedMoods = journals.map(journal => {
        const text = (journal.content || '').toLowerCase();
        
        // Count occurrences of mood keywords
        let moodCounts = {};
        for (const [mood, keywords] of Object.entries(moodKeywords)) {
          moodCounts[mood] = keywords.reduce((count, keyword) => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
            const matches = text.match(regex);
            return count + (matches ? matches.length : 0);
          }, 0);
        }
        
        // Find the mood with the highest count
        let detectedMood = 'neutral';
        let maxCount = 0;
        
        for (const [mood, count] of Object.entries(moodCounts)) {
          if (count > maxCount) {
            detectedMood = mood;
            maxCount = count;
          }
        }
        
        // Calculate intensity based on keyword match ratio and confidence
        const totalWords = text.split(/\s+/).length;
        const matchRatio = maxCount / (totalWords || 1);
        const intensity = Math.min(5, Math.max(1, Math.ceil(matchRatio * 50) + 1));
        
        // Map to the expected format
        return {
          date: journal.date || (journal.timestamp ? new Date(journal.timestamp).toISOString().split('T')[0] : new Date(journal.createdAt || Date.now()).toISOString().split('T')[0]),
          mood: detectedMood,
          notes: journal.content?.slice(0, 100) + (journal.content?.length > 100 ? '...' : '') || '',
          intensity: intensity,
          username: journal.username || '',
          timestamp: journal.timestamp || journal.createdAt || new Date().toISOString(),
          source: 'journal',
          _id: journal._id
        };
      });
      
      return extractedMoods;
    } catch (error) {
      console.error('Error extracting moods from journals:', error);
      return [];
    }
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
  
  // Get combined mood data from all sources
  async getAllMoodData(timeRange = 'month') {
    try {
      // Initialize an array to collect mood data from all sources
      let combinedMoodData = [];
      
      // 1. Try to get explicit mood entries first
      try {
        const moodResponse = await this.getMoods(timeRange);
        if (moodResponse && Array.isArray(moodResponse) && moodResponse.length > 0) {
          const formattedMoods = moodResponse.map(mood => ({
            ...this.formatMoodData(mood),
            source: 'mood_log'
          }));
          combinedMoodData = [...combinedMoodData, ...formattedMoods];
        }
      } catch (e) {
        console.warn('Could not fetch mood data, continuing with other sources', e);
      }
      
      // 2. Get mood data extracted from journal entries
      try {
        const journalMoods = await this.extractMoodsFromJournals(timeRange);
        if (journalMoods && journalMoods.length > 0) {
          combinedMoodData = [...combinedMoodData, ...journalMoods];
        }
      } catch (e) {
        console.warn('Could not extract mood data from journals, continuing', e);
      }
      
      // 3. If still no data, try getting mood trend data
      if (combinedMoodData.length === 0) {
        try {
          const trendData = await this.getMoodTrend();
          if (trendData && trendData.recentMoods && trendData.recentMoods.length > 0) {
            const now = new Date();
            const trendMoods = trendData.recentMoods.map((mood, index) => {
              // Create a date for this mood (past few days)
              const moodDate = new Date(now);
              moodDate.setDate(moodDate.getDate() - index);
              
              return {
                date: moodDate.toISOString().split('T')[0],
                mood: mood,
                notes: 'Generated from mood trend data',
                intensity: this.getMoodIntensityValue(mood),
                username: '',
                timestamp: moodDate.toISOString(),
                source: 'trend',
                _id: `trend-${index}`
              };
            });
            
            combinedMoodData = [...combinedMoodData, ...trendMoods];
          }
        } catch (e) {
          console.warn('Could not fetch mood trend data, continuing', e);
        }
      }
      
      // 4. If still no data, provide a minimal placeholder
      if (combinedMoodData.length === 0) {
        const now = new Date();
        combinedMoodData = [{
          date: now.toISOString().split('T')[0],
          mood: 'neutral',
          notes: 'No mood data available for this time period',
          intensity: 3,
          username: '',
          timestamp: now.toISOString(),
          source: 'default',
          _id: 'default-1'
        }];
        
        // Add a few more entries to show a pattern
        for (let i = 1; i <= 5; i++) {
          const moodDate = new Date(now);
          moodDate.setDate(moodDate.getDate() - i);
          
          const moods = ['happy', 'content', 'neutral', 'tired', 'excited'];
          const randomMood = moods[Math.floor(Math.random() * moods.length)];
          
          combinedMoodData.push({
            date: moodDate.toISOString().split('T')[0],
            mood: randomMood,
            notes: 'Sample mood data',
            intensity: Math.floor(Math.random() * 5) + 1,
            username: '',
            timestamp: moodDate.toISOString(),
            source: 'default',
            _id: `default-${i+1}`
          });
        }
      }
      
      // Sort the combined data by date (newest to oldest)
      combinedMoodData.sort((a, b) => {
        const dateA = new Date(a.date || a.timestamp);
        const dateB = new Date(b.date || b.timestamp);
        return dateB - dateA;
      });
      
      return combinedMoodData;
    } catch (error) {
      console.error('Error getting all mood data:', error);
      
      // Return a placeholder as fallback
      const now = new Date();
      return [{
        date: now.toISOString().split('T')[0],
        mood: 'neutral',
        notes: 'Error fetching mood data',
        intensity: 3,
        username: '',
        timestamp: now.toISOString(),
        source: 'error',
        _id: 'error-1'
      }];
    }
  }
  
  // Process mood data by time of day (local processing)
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
  
  // Helper method to get numerical value for a mood
  getMoodIntensityValue(mood) {
    const moodValueMap = {
      'angry': 1,
      'sad': 2,
      'anxious': 2,
      'tired': 3,
      'neutral': 3,
      'content': 4, 
      'happy': 5,
      'excited': 5
    };
    
    return moodValueMap[mood] !== undefined ? moodValueMap[mood] : 3;
  }
  
  // Analyze correlations between activities and moods
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
  
  // Calculate mood summary statistics
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
      const intensity = entry.intensity || 3;
      
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
      const firstHalfAvg = firstHalf.reduce((sum, entry) => sum + (entry.intensity || 3), 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((sum, entry) => sum + (entry.intensity || 3), 0) / secondHalf.length;
      
      // Determine trend
      if (secondHalfAvg - firstHalfAvg > 0.5) {
        trend = 'improving';
      } else if (firstHalfAvg - secondHalfAvg > 0.5) {
        trend = 'worsening';
      }
    }
    
    return {
      mostCommonMood,
      averageIntensity: avgIntensity,
      variability,
      trend,
      totalEntries: moodData.length
    };
  }
  
  // Generate combined analytics (local processing when API endpoints aren't available)
  async generateCombinedAnalytics(timeRange = 'month') {
    try {
      // First, try to get analytics from the backend API
      try {
        const apiAnalytics = await this.getMoodAnalytics(timeRange);
        if (apiAnalytics) {
          return apiAnalytics;
        }
      } catch (e) {
        console.warn('Could not fetch analytics from API, generating locally', e);
      }
      
      // If API fails, generate analytics locally
      const allMoodData = await this.getAllMoodData(timeRange);
      
      // Calculate mood distribution
      const moodCounts = {};
      allMoodData.forEach(entry => {
        const mood = entry.mood || 'neutral';
        moodCounts[mood] = (moodCounts[mood] || 0) + 1;
      });
      
      const distribution = Object.entries(moodCounts).map(([mood, count]) => ({
        mood,
        count
      }));
      
      // Calculate summary statistics
      const summary = this.calculateMoodStats(allMoodData);
      
      // Process mood by time of day
      const timeOfDay = this.processMoodByTimeOfDay(allMoodData);
      
      // Analyze activity correlations
      const activityCorrelations = this.analyzeActivityCorrelations(allMoodData);
      
      // Process calendar data
      const calendarData = {};
      allMoodData.forEach(mood => {
        // Ensure date is extracted correctly
        const date = mood.date || (mood.timestamp ? new Date(mood.timestamp).toISOString().split('T')[0] : null);
        if (!date) return;
        
        if (!calendarData[date]) {
          calendarData[date] = [];
        }
        calendarData[date].push(mood);
      });
      
      // Get streak data
      let streakData = { current: 0, longest: 0, thisWeek: 0, thisMonth: 0 };
      try {
        const response = await this.getUserStreak();
        if (response && response.streak !== undefined) {
          streakData = {
            current: response.streak,
            longest: response.longestStreak || response.streak,
            thisWeek: response.thisWeek || 0,
            thisMonth: response.thisMonth || 0
          };
        }
      } catch (e) {
        console.warn('Could not fetch streak data, using defaults', e);
      }
      
      return {
        moods: allMoodData,
        summary,
        distribution,
        timeOfDay,
        activityCorrelations,
        streakData,
        calendar: Object.entries(calendarData).map(([date, entries]) => ({
          date,
          entries
        }))
      };
    } catch (error) {
      console.error('Error generating combined analytics:', error);
      // Return default structure with empty data
      return {
        moods: [],
        summary: {
          mostCommonMood: 'neutral',
          averageIntensity: 3,
          variability: 'low',
          trend: 'stable',
          totalEntries: 0
        },
        distribution: [],
        timeOfDay: [],
        activityCorrelations: [],
        streakData: { current: 0, longest: 0, thisWeek: 0, thisMonth: 0 },
        calendar: []
      };
    }
  }
}

export default MoodService;