import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, ChevronLeft, BarChart2, PieChart, LineChart as LineChartIcon, 
  TrendingUp, Filter, Download, RefreshCw, HelpCircle, Clock, Dumbbell,
  Brain, BookHeart
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import AnalyticsService from '../../services/AnalyticsService';
import MoodCalendarVisualization from '../MoodCalendarVisualization/MoodCalendarVisualization';
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
  const [moodData, setMoodData] = useState([]);
  const [moodDistribution, setMoodDistribution] = useState([]);
  const [moodByTimeOfDay, setMoodByTimeOfDay] = useState([]);
  const [activityCorrelation, setActivityCorrelation] = useState([]);
  const [streakData, setStreakData] = useState({
    current: 0,
    longest: 0,
    thisWeek: 0,
    thisMonth: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data based on selected time range
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const analyticsService = new AnalyticsService();
        
        // Fetch mood history data
        const moodHistory = await analyticsService.getMoodHistory(timeRange);
        setMoodData(moodHistory.data);
        
        // Fetch mood distribution data
        const distribution = await analyticsService.getMoodDistribution(timeRange);
        setMoodDistribution(distribution.data);
        
        // Fetch mood by time of day
        const timeOfDayData = await analyticsService.getMoodByTimeOfDay(timeRange);
        setMoodByTimeOfDay(timeOfDayData.data);
        
        // Fetch activity correlation
        const correlationData = await analyticsService.getActivityCorrelation(timeRange);
        setActivityCorrelation(correlationData.data);
        
        // Fetch streak data
        const streaks = await analyticsService.getStreakData();
        setStreakData(streaks);
        
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError('Failed to load analytics data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnalyticsData();
  }, [timeRange]);

  // Mock data for development/demonstration purposes
  const getMockData = () => {
    // Mock mood history data
    const mockMoodData = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      const moodKeys = Object.keys(moodConfig);
      const randomMood = moodKeys[Math.floor(Math.random() * moodKeys.length)];
      
      return {
        date: date.toISOString().split('T')[0],
        mood: randomMood,
        intensity: Math.floor(Math.random() * 5) + 1
      };
    });
    
    // Mock mood distribution data
    const mockDistribution = Object.keys(moodConfig).map(mood => ({
      mood,
      count: Math.floor(Math.random() * 20)
    }));
    
    // Mock time of day data
    const mockTimeOfDay = [
      { time: 'Morning', excited: 5, happy: 8, content: 7, neutral: 4, anxious: 2, tired: 10, sad: 1, angry: 0 },
      { time: 'Afternoon', excited: 7, happy: 10, content: 6, neutral: 5, anxious: 4, tired: 3, sad: 2, angry: 1 },
      { time: 'Evening', excited: 3, happy: 5, content: 8, neutral: 7, anxious: 6, tired: 9, sad: 4, angry: 2 },
      { time: 'Night', excited: 1, happy: 2, content: 3, neutral: 4, anxious: 7, tired: 12, sad: 5, angry: 3 }
    ];
    
    // Mock activity correlation
    const mockActivities = [
      { name: 'Exercise', positiveImpact: 85 },
      { name: 'Meditation', positiveImpact: 75 },
      { name: 'Journal', positiveImpact: 65 },
      { name: 'Music', positiveImpact: 80 },
      { name: 'LOL Videos', positiveImpact: 70 }
    ];
    
    return {
      moodData: mockMoodData,
      distribution: mockDistribution,
      timeOfDay: mockTimeOfDay,
      activities: mockActivities,
      streaks: {
        current: 5,
        longest: 12,
        thisWeek: 5,
        thisMonth: 18
      }
    };
  };

  // Handle back button click
  const handleBackClick = () => {
    navigate('/dashboard');
  };

  // Handle time range change
  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
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
          <HelpCircle size={48} />
          <h3>Oops! Something went wrong</h3>
          <p>{error}</p>
          <button className="btn-primary" onClick={() => window.location.reload()}>
            <RefreshCw size={16} /> Try Again
          </button>
        </div>
      </div>
    );
  }

  // Use mock data for development/demo purposes
  const mockDataResults = getMockData();
  const finalMoodData = moodData.length ? moodData : mockDataResults.moodData;
  const finalDistribution = moodDistribution.length ? moodDistribution : mockDataResults.distribution;
  const finalTimeOfDay = moodByTimeOfDay.length ? moodByTimeOfDay : mockDataResults.timeOfDay;
  const finalActivities = activityCorrelation.length ? activityCorrelation : mockDataResults.activities;
  const finalStreaks = streakData.current ? streakData : mockDataResults.streaks;

  // Format mood data for the line chart
  const lineChartData = finalMoodData.map(entry => {
    // Convert the mood to a numeric value (1-8) for the line chart
    const moodIndex = Object.keys(moodConfig).indexOf(entry.mood) + 1;
    
    return {
      date: entry.date,
      mood: moodIndex,
      moodName: moodConfig[entry.mood].label,
      intensity: entry.intensity
    };
  });

  // Prepare data for the pie chart
  const pieChartData = finalDistribution.map(entry => ({
    name: moodConfig[entry.mood].label,
    value: entry.count,
    color: moodConfig[entry.mood].color
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
            <h3 className="streak-value">{finalStreaks.current} days</h3>
          </div>
        </div>
        <div className="streak-card">
          <div className="streak-icon-container">
            <TrendingUp />
          </div>
          <div className="streak-info">
            <p className="streak-label">Longest Streak</p>
            <h3 className="streak-value">{finalStreaks.longest} days</h3>
          </div>
        </div>
        <div className="streak-card">
          <div className="streak-icon-container">
            <Calendar />
          </div>
          <div className="streak-info">
            <p className="streak-label">This Week</p>
            <h3 className="streak-value">{finalStreaks.thisWeek} days</h3>
          </div>
        </div>
        <div className="streak-card">
          <div className="streak-icon-container">
            <Calendar />
          </div>
          <div className="streak-info">
            <p className="streak-label">This Month</p>
            <h3 className="streak-value">{finalStreaks.thisMonth} days</h3>
          </div>
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
                      return [Object.values(moodConfig)[value-1].label, 'Mood'];
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
                data={finalTimeOfDay}
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
                data={finalActivities}
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
      </div>

      {/* Insight Cards */}
      <div className="insights-section">
        <h2 className="section-title">Personalized Insights</h2>
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-icon exercise-icon">
              <Dumbbell size={24} />
            </div>
            <h3 className="insight-title">Exercise Impact</h3>
            <p className="insight-text">
              Days with exercise show a 30% improvement in your mood. Try to maintain your exercise routine.
            </p>
          </div>
          
          <div className="insight-card">
            <div className="insight-icon meditation-icon">
              <Brain size={24} />
            </div>
            <h3 className="insight-title">Meditation Pattern</h3>
            <p className="insight-text">
              You tend to feel more content on days when you meditate in the morning. Consider making this a daily habit.
            </p>
          </div>
          
          <div className="insight-card">
            <div className="insight-icon time-icon">
              <Clock size={24} />
            </div>
            <h3 className="insight-title">Time of Day</h3>
            <p className="insight-text">
              Your mood tends to be most positive in the afternoons. Schedule important activities during this time.
            </p>
          </div>
          
          <div className="insight-card">
            <div className="insight-icon journal-icon">
              <BookHeart size={24} />
            </div>
            <h3 className="insight-title">Journaling Impact</h3>
            <p className="insight-text">
              Regular journaling correlates with reduced anxiety levels. Keep up the good work with your journal entries.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodAnalytics;