import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, ChevronLeft, BarChart2, PieChart, LineChart as LineChartIcon, 
  TrendingUp, Filter, Download, RefreshCw, HelpCircle, Clock, Dumbbell,
  Brain, BookHeart, AlertTriangle
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import MoodCalendarVisualization from '../MoodCalendarVisualization/MoodCalendarVisualization';
import MoodDayDetail from '../MoodDayDetail/MoodDayDetail';
import MoodService from '../../services/MoodService';
import './MoodAnalytics.css';

// Mood categories and their corresponding colors
const moodConfig = {
  'excited': { label: 'Excited', color: '#eab308' },
  'happy': { label: 'Happy', color: '#22c55e' },
  'content': { label: 'Content', color: '#3b82f6' },
  'neutral': { label: 'Neutral', color: '#64748b' },
  'anxious': { label: 'Anxious', color: '#f97316' },
  'tired': { label: 'Tired', color: '#8b5cf6' },
  'sad': { label: 'Sad', color: '#0ea5e9' },
  'angry': { label: 'Angry', color: '#ef4444' }
};

const MoodAnalytics = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('month');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showDayDetail, setShowDayDetail] = useState(false);
  
  // State for all mood data
  const [moodData, setMoodData] = useState([]);
  const [moodDistribution, setMoodDistribution] = useState([]);
  const [moodByTimeOfDay, setMoodByTimeOfDay] = useState([]);
  const [activityCorrelation, setActivityCorrelation] = useState([]);
  const [journalSentiment, setJournalSentiment] = useState([]);
  const [streakData, setStreakData] = useState({
    current: 0,
    longest: 0,
    thisWeek: 0,
    thisMonth: 0
  });
  const [analyticsSummary, setAnalyticsSummary] = useState({
    mostCommonMood: 'neutral',
    averageIntensity: 0,
    variability: 'low',
    trend: 'stable',
    totalEntries: 0
  });

  // Fetch data based on selected time range
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const moodService = new MoodService();
        
        // Fetch all mood data including those extracted from journals
        const allMoodData = await moodService.getAllMoodData(timeRange);
        setMoodData(allMoodData);
        
        // Fetch mood analytics data from backend
        const analyticsData = await moodService.getMoodAnalytics(timeRange);
        
        // Set mood distribution
        if (analyticsData && analyticsData.distribution) {
          setMoodDistribution(analyticsData.distribution);
        }
        
        // Set analytics summary
        if (analyticsData && analyticsData.summary) {
          setAnalyticsSummary(analyticsData.summary);
        }
        
        // Process mood by time of day
        processMoodByTimeOfDay(allMoodData);
        
        // Process activity correlation
        processActivityCorrelation(allMoodData);
        
        // Fetch streak data
        try {
          const userStats = await fetch('/user/dashboard-stats');
          const statsData = await userStats.json();
          if (statsData && statsData.streak) {
            setStreakData({
              current: statsData.streak,
              longest: statsData.longestStreak || statsData.streak,
              thisWeek: statsData.thisWeek || 0,
              thisMonth: statsData.thisMonth || 0
            });
          }
        } catch (err) {
          console.warn('Could not fetch streak data, using fallback', err);
          // Fallback to calculating streaks from mood data
          calculateStreakFromMoodData(allMoodData);
        }
        
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError('Failed to load analytics data. Please try again later.');
        // Use mock data if API fails
        setMockData();
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnalyticsData();
  }, [timeRange]);

  // Calculate streaks from mood data if API endpoint unavailable
  const calculateStreakFromMoodData = (moodData) => {
    if (!moodData || moodData.length === 0) {
      setStreakData({
        current: 0,
        longest: 0,
        thisWeek: 0,
        thisMonth: 0
      });
      return;
    }
    
    // Sort data by date
    const sortedData = [...moodData].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB - dateA; // Most recent first
    });
    
    // Group by date (to handle multiple entries on same day)
    const dateMap = new Map();
    sortedData.forEach(entry => {
      const dateStr = entry.date.split('T')[0];
      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, true);
      }
    });
    
    // Get unique dates as array
    const uniqueDates = Array.from(dateMap.keys()).sort((a, b) => {
      return new Date(b) - new Date(a); // Most recent first
    });
    
    if (uniqueDates.length === 0) {
      setStreakData({
        current: 0,
        longest: 0,
        thisWeek: 0,
        thisMonth: 0
      });
      return;
    }
    
    // Calculate current streak
    let currentStreak = 1;
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if most recent date is today or yesterday
    const mostRecentDate = new Date(uniqueDates[0]);
    const mostRecentDay = mostRecentDate.getDate();
    const todayDay = now.getDate();
    const yesterdayDay = yesterday.getDate();
    
    // If most recent entry isn't today or yesterday, streak is 0
    if (mostRecentDay !== todayDay && mostRecentDay !== yesterdayDay) {
      currentStreak = 0;
    } else {
      // Calculate streak by looking for consecutive days
      for (let i = 0; i < uniqueDates.length - 1; i++) {
        const currentDate = new Date(uniqueDates[i]);
        const nextDate = new Date(uniqueDates[i + 1]);
        
        // Check if dates are consecutive
        const diffTime = currentDate - nextDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }
    
    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 1;
    
    for (let i = 0; i < uniqueDates.length - 1; i++) {
      const currentDate = new Date(uniqueDates[i]);
      const nextDate = new Date(uniqueDates[i + 1]);
      
      const diffTime = currentDate - nextDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    
    longestStreak = Math.max(longestStreak, tempStreak);
    
    // Calculate entries this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const entriesThisWeek = uniqueDates.filter(date => {
      const entryDate = new Date(date);
      return entryDate >= oneWeekAgo;
    }).length;
    
    // Calculate entries this month
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
    
    const entriesThisMonth = uniqueDates.filter(date => {
      const entryDate = new Date(date);
      return entryDate >= oneMonthAgo;
    }).length;
    
    setStreakData({
      current: currentStreak,
      longest: longestStreak,
      thisWeek: entriesThisWeek,
      thisMonth: entriesThisMonth
    });
  };

  // Process mood data by time of day
  const processMoodByTimeOfDay = (moodData) => {
    if (!moodData || moodData.length === 0) {
      setMoodByTimeOfDay([]);
      return;
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
    
    setMoodByTimeOfDay(timeOfDayData);
  };

  // Process activity correlation with moods
  const processActivityCorrelation = (moodData) => {
    if (!moodData || moodData.length === 0) {
      setActivityCorrelation([]);
      return;
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
    const filteredResult = result.filter(activity => activity.count > 0);
    
    // Add a default activity if none found
    if (filteredResult.length === 0) {
      filteredResult.push({ name: 'No activities detected', positiveImpact: 0, count: 0 });
    }
    
    setActivityCorrelation(filteredResult);
  };

  // Set mock data for development/demo/fallback purposes
  const setMockData = () => {
    // Mock mood history data
    const mockMoodData = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      const moodKeys = Object.keys(moodConfig);
      const randomMood = moodKeys[Math.floor(Math.random() * moodKeys.length)];
      
      return {
        date: date.toISOString().split('T')[0],
        mood: randomMood,
        intensity: Math.floor(Math.random() * 5) + 1,
        source: Math.random() > 0.7 ? 'journal' : 'mood_log'
      };
    });
    
    setMoodData(mockMoodData);
    
    // Mock mood distribution data
    const mockDistribution = Object.keys(moodConfig).map(mood => ({
      mood,
      count: Math.floor(Math.random() * 20)
    }));
    
    setMoodDistribution(mockDistribution);
    
    // Mock time of day data
    const mockTimeOfDay = [
      { time: 'Morning', excited: 5, happy: 8, content: 7, neutral: 4, anxious: 2, tired: 10, sad: 1, angry: 0 },
      { time: 'Afternoon', excited: 7, happy: 10, content: 6, neutral: 5, anxious: 4, tired: 3, sad: 2, angry: 1 },
      { time: 'Evening', excited: 3, happy: 5, content: 8, neutral: 7, anxious: 6, tired: 9, sad: 4, angry: 2 },
      { time: 'Night', excited: 1, happy: 2, content: 3, neutral: 4, anxious: 7, tired: 12, sad: 5, angry: 3 }
    ];
    
    setMoodByTimeOfDay(mockTimeOfDay);
    
    // Mock activity correlation
    const mockActivities = [
      { name: 'Exercise', positiveImpact: 85, count: 12 },
      { name: 'Meditation', positiveImpact: 75, count: 8 },
      { name: 'Journal', positiveImpact: 65, count: 15 },
      { name: 'Social', positiveImpact: 80, count: 7 },
      { name: 'Work', positiveImpact: 40, count: 14 }
    ];
    
    setActivityCorrelation(mockActivities);
    
    // Mock streak data
    setStreakData({
      current: 5,
      longest: 12,
      thisWeek: 5,
      thisMonth: 18
    });
    
    // Mock analytics summary
    setAnalyticsSummary({
      mostCommonMood: 'content',
      averageIntensity: 3.2,
      variability: 'medium',
      trend: 'improving',
      totalEntries: 30
    });
  };

  // Handle back button click
  const handleBackClick = () => {
    navigate('/dashboard');
  };

  // Handle time range change
  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };
  
  // Handle day selection in calendar
  const handleDayClick = (day) => {
    setSelectedDay(day);
    setShowDayDetail(true);
  };
  
  // Handle closing day detail modal
  const handleCloseDayDetail = () => {
    setShowDayDetail(false);
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="mood-analytics-container">
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading your mood data...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="mood-analytics-container">
        <div className="error-message">
          <AlertTriangle size={48} />
          <h3>Oops! Something went wrong</h3>
          <p>{error}</p>
          <button className="btn-primary" onClick={() => window.location.reload()}>
            <RefreshCw size={16} /> Try Again
          </button>
        </div>
      </div>
    );
  }

  // Format mood data for the line chart
  const lineChartData = moodData.map(entry => {
    // Convert the mood to a numeric value (1-8) for the line chart
    const moodIndex = Object.keys(moodConfig).indexOf(entry.mood) + 1;
    
    return {
      date: entry.date,
      mood: moodIndex,
      moodName: moodConfig[entry.mood]?.label || 'Neutral',
      intensity: entry.intensity,
      source: entry.source || 'mood_log'
    };
  }).sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date ascending

  // Prepare data for the pie chart
  const pieChartData = moodDistribution.map(entry => ({
    name: moodConfig[entry.mood]?.label || entry.mood,
    value: entry.count,
    color: moodConfig[entry.mood]?.color || '#94A3B8'
  }));

  return (
    <div className="mood-analytics-container">
      {/* Header Section */}
      <div className="analytics-header">
        <button className="back-button" onClick={handleBackClick}>
          <ChevronLeft size={20} /> Back to Dashboard
        </button>
        <h1 className="analytics-title">
          <BarChart2 className="header-icon" /> Mood Analytics
        </h1>
        <p className="analytics-subtitle">
          Gain insights into your emotional patterns and trends
        </p>
      </div>

      {/* Time Range Filter */}
      <div className="filter-section">
        <div className="filter-heading">
          <Filter size={16} />
          <span>Time Range:</span>
        </div>
        <div className="filter-options">
          <button 
            className={`filter-button ${timeRange === 'week' ? 'active' : ''}`}
            onClick={() => handleTimeRangeChange('week')}
          >
            7 Days
          </button>
          <button 
            className={`filter-button ${timeRange === 'month' ? 'active' : ''}`}
            onClick={() => handleTimeRangeChange('month')}
          >
            30 Days
          </button>
          <button 
            className={`filter-button ${timeRange === 'quarter' ? 'active' : ''}`}
            onClick={() => handleTimeRangeChange('quarter')}
          >
            3 Months
          </button>
          <button 
            className={`filter-button ${timeRange === 'year' ? 'active' : ''}`}
            onClick={() => handleTimeRangeChange('year')}
          >
            12 Months
          </button>
        </div>
        <button className="export-button">
          <Download size={16} /> Export Data
        </button>
      </div>

      {/* Mood Streak Stats */}
      <div className="streak-stats">
        <div className="streak-card">
          <div className="streak-icon-container">
            <Calendar />
          </div>
          <div className="streak-info">
            <p className="streak-label">Current Streak</p>
            <h3 className="streak-value">{streakData.current} days</h3>
          </div>
        </div>
        <div className="streak-card">
          <div className="streak-icon-container">
            <TrendingUp />
          </div>
          <div className="streak-info">
            <p className="streak-label">Longest Streak</p>
            <h3 className="streak-value">{streakData.longest} days</h3>
          </div>
        </div>
        <div className="streak-card">
          <div className="streak-icon-container">
            <Calendar />
          </div>
          <div className="streak-info">
            <p className="streak-label">This Week</p>
            <h3 className="streak-value">{streakData.thisWeek} days</h3>
          </div>
        </div>
        <div className="streak-card">
          <div className="streak-icon-container">
            <Calendar />
          </div>
          <div className="streak-info">
            <p className="streak-label">This Month</p>
            <h3 className="streak-value">{streakData.thisMonth} days</h3>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="stat-grid">
        <div className="stat-box">
          <BarChart2 /><span>Most Frequent:</span>
          <strong style={{ color: moodConfig[analyticsSummary.mostCommonMood]?.color || '#94A3B8' }}>
            {analyticsSummary.mostCommonMood}
          </strong>
        </div>
        <div className="stat-box">
          <TrendingUp /><span>Trend:</span>
          <strong>{analyticsSummary.trend}</strong>
        </div>
        <div className="stat-box">
          <div className="stat-icon-container">
            <span className="stat-icon">⚡</span>
          </div>
          <span>Avg. Intensity:</span>
          <strong>{analyticsSummary.averageIntensity.toFixed(1)}</strong>
        </div>
        <div className="stat-box">
          <BookHeart /><span>Variability:</span>
          <strong>{analyticsSummary.variability}</strong>
        </div>
      </div>

      {/* Calendar Visualization */}
      <div className="calendar-section">
        <h2 className="section-title">Mood Calendar</h2>
        <div className="calendar-container">
          <MoodCalendarVisualization 
            moodData={moodData} 
            onDayClick={handleDayClick}
            timeRange={timeRange}
          />
        </div>
      </div>

      {/* Charts Section */}
      <div className="analytics-charts">
        {/* Mood History Line Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h2 className="chart-title">
              <LineChartIcon size={20} className="chart-icon" /> Mood History
            </h2>
            <p className="chart-description">Track how your mood has changed over time</p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={lineChartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => {
                    const d = new Date(date);
                    return `${d.getMonth() + 1}/${d.getDate()}`;
                  }}
                />
                <YAxis 
                  domain={[1, 8]} 
                  ticks={[1, 2, 3, 4, 5, 6, 7, 8]}
                  tickFormatter={(value) => {
                    const moods = Object.values(moodConfig).map(m => m.label);
                    return value > 0 && value <= moods.length ? moods[value-1] : '';
                  }}
                />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'mood') {
                      return [Object.values(moodConfig)[value-1]?.label || 'Unknown', 'Mood'];
                    }
                    return [value, name];
                  }}
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="mood" 
                  stroke="#8884d8" 
                  strokeWidth={2} 
                  activeDot={{ r: 8 }}
                  name="Mood"
                />
                <Line 
                  type="monotone" 
                  dataKey="intensity" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  name="Intensity"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mood Distribution Pie Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h2 className="chart-title">
              <PieChart size={20} className="chart-icon" /> Mood Distribution
            </h2>
            <p className="chart-description">How often you experience each mood</p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} entries`, 'Count']} />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mood by Time of Day Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h2 className="chart-title">
              <Clock size={20} className="chart-icon" /> Mood by Time of Day
            </h2>
            <p className="chart-description">How your mood changes throughout the day</p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={moodByTimeOfDay}
                margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                {Object.keys(moodConfig).map((mood) => (
                  <Bar 
                    key={mood} 
                    dataKey={mood} 
                    stackId="a" 
                    fill={moodConfig[mood].color} 
                    name={moodConfig[mood].label} 
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Impact Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h2 className="chart-title">
              <BarChart2 size={20} className="chart-icon" /> Activity Impact
            </h2>
            <p className="chart-description">Which activities improve your mood the most</p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={activityCorrelation}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 80, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="name" type="category" />
                <Tooltip formatter={(value) => [`${value}%`, 'Positive Impact']} />
                <Legend />
                <Bar 
                  dataKey="positiveImpact" 
                  fill="#6366f1" 
                  name="Positive Impact" 
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Mood Source Distribution */}
        <div className="chart-card">
          <div className="chart-header">
            <h2 className="chart-title">
              <BookHeart size={20} className="chart-icon" /> Mood Sources
            </h2>
            <p className="chart-description">Where your mood data comes from</p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                {(() => {
                  // Count data sources
                  const sources = moodData.reduce((acc, entry) => {
                    const source = entry.source || 'mood_log';
                    acc[source] = (acc[source] || 0) + 1;
                    return acc;
                  }, {});
                  
                  // Format data for pie chart
                  const sourceData = Object.entries(sources).map(([key, value]) => ({
                    name: key === 'mood_log' ? 'Mood Log' : key.charAt(0).toUpperCase() + key.slice(1),
                    value,
                    color: key === 'mood_log' ? '#6366f1' : 
                           key === 'journal' ? '#22c55e' : 
                           key === 'trend' ? '#eab308' : '#94A3B8'
                  }));
                  
                  return (
                    <Pie
                      data={sourceData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {sourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  );
                })()}
                <Tooltip formatter={(value) => [`${value} entries`, 'Count']} />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Insight Cards */}
      <div className="insights-section">
        <h2 className="section-title">Personalized Insights</h2>
        <div className="insights-grid">
          {/* Dynamically generate insights based on data */}
          {(() => {
            const insights = [];
            
            // Most common mood insight
            if (analyticsSummary.mostCommonMood) {
              insights.push(
                <div key="common-mood" className="insight-card">
                  <div className="insight-icon" 
                    style={{ backgroundColor: moodConfig[analyticsSummary.mostCommonMood]?.color || '#94A3B8' }}>
                    <BarChart2 size={24} />
                  </div>
                  <h3 className="insight-title">Your Common Mood</h3>
                  <p className="insight-text">
                    Your most common mood is <strong>{analyticsSummary.mostCommonMood}</strong>. 
                    This suggests a consistent emotional pattern in your life.
                  </p>
                </div>
              );
            }
            
            // Mood trend insight
            if (analyticsSummary.trend) {
              const trendText = analyticsSummary.trend === 'improving' 
                ? 'Your mood appears to be improving over time. Keep up the good work!'
                : analyticsSummary.trend === 'worsening'
                ? 'Your mood seems to be declining recently. Consider what factors might be affecting you.'
                : 'Your mood has been relatively stable over time.';
              
              insights.push(
                <div key="trend" className="insight-card">
                  <div className="insight-icon trend-icon">
                    <TrendingUp size={24} />
                  </div>
                  <h3 className="insight-title">Mood Trend</h3>
                  <p className="insight-text">{trendText}</p>
                </div>
              );
            }
            
            // Time of day insight
            if (moodByTimeOfDay && moodByTimeOfDay.length > 0) {
              // Find time of day with most positive moods
              const positiveMoods = ['excited', 'happy', 'content'];
              let bestTime = null;
              let bestScore = -1;
              
              moodByTimeOfDay.forEach(timeSlot => {
                const positiveScore = positiveMoods.reduce((sum, mood) => sum + (timeSlot[mood] || 0), 0);
                if (positiveScore > bestScore) {
                  bestScore = positiveScore;
                  bestTime = timeSlot.time;
                }
              });
              
              if (bestTime) {
                insights.push(
                  <div key="time-of-day" className="insight-card">
                    <div className="insight-icon time-icon">
                      <Clock size={24} />
                    </div>
                    <h3 className="insight-title">Best Time of Day</h3>
                    <p className="insight-text">
                      Your mood tends to be most positive during the <strong>{bestTime}</strong>. 
                      Consider scheduling important activities during this time.
                    </p>
                  </div>
                );
              }
            }
            
            // Activity insight
            if (activityCorrelation && activityCorrelation.length > 0 && activityCorrelation[0].positiveImpact > 0) {
              const topActivity = activityCorrelation[0];
              
              insights.push(
                <div key="activity" className="insight-card">
                  <div className="insight-icon exercise-icon">
                    <Dumbbell size={24} />
                  </div>
                  <h3 className="insight-title">{topActivity.name} Impact</h3>
                  <p className="insight-text">
                    <strong>{topActivity.name}</strong> shows a {topActivity.positiveImpact}% correlation with positive moods. 
                    Try to incorporate more of this activity into your routine.
                  </p>
                </div>
              );
            }
            
            // Variability insight
            if (analyticsSummary.variability) {
              const variabilityText = analyticsSummary.variability === 'high'
                ? 'Your mood shows high variability. Consider implementing consistency in your daily routines.'
                : analyticsSummary.variability === 'medium'
                ? 'Your mood shows moderate variability, which is typical for most people.'
                : 'Your mood is quite stable, showing low variability over time.';
              
              insights.push(
                <div key="variability" className="insight-card">
                  <div className="insight-icon journal-icon">
                    <BookHeart size={24} />
                  </div>
                  <h3 className="insight-title">Mood Stability</h3>
                  <p className="insight-text">{variabilityText}</p>
                </div>
              );
            }
            
            // If no insights were generated, add a default one
            if (insights.length === 0) {
              insights.push(
                <div key="default" className="insight-card">
                  <div className="insight-icon">
                    <Brain size={24} />
                  </div>
                  <h3 className="insight-title">Log More Data</h3>
                  <p className="insight-text">
                    Add more mood entries to get personalized insights about your emotional patterns.
                  </p>
                </div>
              );
            }
            
            // Add more insights if we have fewer than 4
            while (insights.length < 4) {
              const possibleInsights = [
                <div key="consistency" className="insight-card">
                  <div className="insight-icon">
                    <Calendar size={24} />
                  </div>
                  <h3 className="insight-title">Consistency Matters</h3>
                  <p className="insight-text">
                    Regular mood tracking provides the most accurate insights. Try to log at least once daily.
                  </p>
                </div>,
                <div key="journal" className="insight-card">
                  <div className="insight-icon journal-icon">
                    <BookHeart size={24} />
                  </div>
                  <h3 className="insight-title">Journal Impact</h3>
                  <p className="insight-text">
                    Adding context in journal entries helps identify patterns in your emotional responses.
                  </p>
                </div>,
                <div key="meditation" className="insight-card">
                  <div className="insight-icon meditation-icon">
                    <Brain size={24} />
                  </div>
                  <h3 className="insight-title">Self-Reflection</h3>
                  <p className="insight-text">
                    Taking time to reflect on your mood patterns can lead to better emotional awareness.
                  </p>
                </div>
              ];
              
              // Add a unique insight
              const availableInsights = possibleInsights.filter(insight => 
                !insights.some(existing => existing.key === insight.key)
              );
              
              if (availableInsights.length > 0) {
                insights.push(availableInsights[0]);
              } else {
                break; // No more unique insights to add
              }
            }
            
            return insights;
          })()}
        </div>
      </div>
      
      {/* Conditional rendering of day detail modal */}
      {showDayDetail && selectedDay && (
        <div className="modal-overlay" onClick={handleCloseDayDetail}>
          <div className="day-detail-modal" onClick={e => e.stopPropagation()}>
            <button className="close-button" onClick={handleCloseDayDetail}>×</button>
            <MoodDayDetail day={selectedDay} moodData={moodData} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodAnalytics;