import React, { useState, useEffect } from 'react';
import { 
  Calendar, TrendingUp, BookHeart, BarChart2, Award, 
  AlertTriangle, ChevronLeft, Download, Filter, PieChart,
  RefreshCw, Clock
} from 'lucide-react';
import MoodService from '../../../services/MoodService';
import MoodCalendarVisualization from './MoodCalendarVisualization';

import MoodAnalyticsSummary from './MoodAnalyticsSummary';
import { 
  LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import './MoodAnalyticsPage.css';

const moodColors = {
  excited: '#FFD700', 
  happy: '#4CAF50', 
  content: '#3F51B5', 
  neutral: '#94A3B8',
  anxious: '#FF9800', 
  tired: '#A78BFA', 
  sad: '#2196F3', 
  angry: '#F44336'
};

const MoodAnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState('month');
  const [data, setData] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [stats, setStats] = useState({
    mostCommonMood: 'neutral',
    averageIntensity: 0,
    variability: 'low',
    trend: 'stable',
    totalEntries: 0
  });
  const [moodDistribution, setMoodDistribution] = useState([]);
  const [moodByTimeOfDay, setMoodByTimeOfDay] = useState([]);
  const [activityCorrelation, setActivityCorrelation] = useState([]);
  const [streakData, setStreakData] = useState({
    current: 0,
    longest: 0,
    thisWeek: 0,
    thisMonth: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showDayDetail, setShowDayDetail] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const moodService = new MoodService();
      
      // Get combined analytics data
      const analyticsData = await moodService.generateCombinedAnalytics(timeRange);
      setAnalytics(analyticsData);
      
      // Get all mood data including journal-derived moods
      if (analyticsData && analyticsData.moods) {
        setData(analyticsData.moods);
      } else {
        const allMoodData = await moodService.getAllMoodData(timeRange);
        setData(allMoodData);
      }
      
      // Set statistics
      if (analyticsData && analyticsData.summary) {
        setStats(analyticsData.summary);
      }
      
      // Set mood distribution
      if (analyticsData && analyticsData.distribution) {
        setMoodDistribution(analyticsData.distribution);
      } else {
        // Calculate distribution directly from mood data
        const moodCounts = {};
        data.forEach(entry => {
          const mood = entry.mood || 'neutral';
          moodCounts[mood] = (moodCounts[mood] || 0) + 1;
        });
        
        setMoodDistribution(Object.entries(moodCounts).map(([mood, count]) => ({
          mood,
          count
        })));
      }
      
      // Set mood by time of day
      if (analyticsData && analyticsData.timeOfDay) {
        setMoodByTimeOfDay(analyticsData.timeOfDay);
      } else {
        // Process time of day data
        const moodService = new MoodService();
        setMoodByTimeOfDay(moodService.processMoodByTimeOfDay(data));
      }
      
      // Set activity correlations
      if (analyticsData && analyticsData.activityCorrelations) {
        setActivityCorrelation(analyticsData.activityCorrelations);
      } else {
        // Process activity correlations
        const moodService = new MoodService();
        setActivityCorrelation(moodService.analyzeActivityCorrelations(data));
      }
      
      // Set streak data
      if (analyticsData && analyticsData.streakData) {
        setStreakData(analyticsData.streakData);
      } else {
        try {
          const response = await fetch('/user/streak');
          const streakResponse = await response.json();
          
          if (streakResponse && streakResponse.streak) {
            setStreakData({
              current: streakResponse.streak,
              longest: streakResponse.longestStreak || streakResponse.streak,
              thisWeek: streakResponse.thisWeek || 0,
              thisMonth: streakResponse.thisMonth || 0
            });
          }
        } catch (err) {
          console.warn('Could not fetch streak data:', err);
          // Use default streak values
        }
      }
      
    } catch (err) {
      console.error('Failed to fetch analytics data:', err);
      setError('Failed to load analytics. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleBackClick = () => {
    // Navigate back to dashboard
    window.history.back();
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };
  
  const handleDayClick = (day) => {
    setSelectedDay(day);
    setShowDayDetail(true);
  };
  
  const handleCloseDayDetail = () => {
    setShowDayDetail(false);
  };
  
  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading && !refreshing) return (
    <div className="analytics-page">
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading mood insights...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="analytics-page">
      <div className="error">
        <AlertTriangle size={48} />
        <h3>Oops! Something went wrong</h3>
        <p>{error}</p>
        <button className="btn-primary" onClick={handleRefresh}>
          <RefreshCw size={16} /> Try Again
        </button>
      </div>
    </div>
  );

  // Format mood data for the line chart
  const lineChartData = data
    .map(entry => {
      // Convert the mood to a numeric value (1-8) for the line chart
      const moodIndex = Object.keys(moodColors).indexOf(entry.mood) + 1;
      
      return {
        date: entry.date,
        mood: moodIndex,
        moodName: entry.mood,
        intensity: entry.intensity,
        source: entry.source
      };
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date for proper charting
  
  // Prepare data for the pie chart
  const pieChartData = moodDistribution.map(entry => ({
    name: entry.mood,
    value: entry.count,
    color: moodColors[entry.mood] || '#94A3B8'
  }));

  return (
    <div className="analytics-page">
      {/* Overlay for refresh indicator */}
      {refreshing && (
        <div className="refresh-overlay">
          <div className="spinner"></div>
          <p>Refreshing data...</p>
        </div>
      )}
      
      {/* Header section */}
      <div className="analytics-header">
       
        <h2>Mood Analytics Overview</h2>
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
        <div className="filter-actions">
          <button className="refresh-button" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw size={16} className={refreshing ? 'spin' : ''} /> Refresh
          </button>
          <button className="export-button">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* Analytics Summary Component */}
      <MoodAnalyticsSummary 
        stats={stats}
        streakData={streakData}
        moodDistribution={moodDistribution}
        timeRange={timeRange}
        activityCorrelation={activityCorrelation}
      />

      {/* Calendar Visualization */}
      <div className="calendar-section">
        <h3>Mood Calendar</h3>
        <div className="calendar-container">
          <MoodCalendarVisualization 
            moodData={data} 
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
            <h3 className="chart-title">
              <TrendingUp size={20} className="chart-icon" /> Mood History
            </h3>
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
                    const moods = Object.keys(moodColors);
                    return value > 0 && value <= moods.length ? moods[value-1] : '';
                  }}
                />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'mood') {
                      const moods = Object.keys(moodColors);
                      return [moods[value-1] || 'Unknown', 'Mood'];
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
            <h3 className="chart-title">
              <PieChart size={20} className="chart-icon" /> Mood Distribution
            </h3>
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
            <h3 className="chart-title">
              <Clock size={20} className="chart-icon" /> Mood by Time of Day
            </h3>
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
                {Object.keys(moodColors).map((mood) => (
                  <Bar 
                    key={mood} 
                    dataKey={mood} 
                    stackId="a" 
                    fill={moodColors[mood]} 
                    name={mood} 
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Impact Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">
              <BarChart2 size={20} className="chart-icon" /> Activity Impact
            </h3>
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
            <h3 className="chart-title">
              <BookHeart size={20} className="chart-icon" /> Mood Sources
            </h3>
            <p className="chart-description">Where your mood data comes from</p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                {(() => {
                  // Count data sources
                  const sources = data.reduce((acc, entry) => {
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

      <div className="insights-section">
        <h3>Insights</h3>
        <div className="insights-content">
          <p>Your most logged mood is <strong>{stats.mostCommonMood}</strong>, suggesting a frequent emotional pattern.</p>
          <p>Your mood trend appears to be <strong>{stats.trend}</strong>. This might indicate changes in your emotional well-being over time.</p>
          <p>The variability in your mood is <strong>{stats.variability}</strong>, with an average intensity of <strong>{stats.averageIntensity.toFixed(1)}</strong>.</p>
          
          {/* Dynamic insights based on data */}
          {activityCorrelation.length > 0 && activityCorrelation[0].positiveImpact > 50 && (
            <p><strong>{activityCorrelation[0].name}</strong> appears to have a significant positive impact on your mood ({activityCorrelation[0].positiveImpact}% positive correlation).</p>
          )}
          
          {moodDistribution.some(item => 
            ['sad', 'angry', 'anxious'].includes(item.mood) && 
            item.count > (stats.totalEntries / 3)
          ) && (
            <p>You've logged a significant number of negative moods. Consider talking to someone or exploring mood-lifting activities.</p>
          )}
          
          {moodByTimeOfDay.length > 0 && (() => {
            // Find time of day with highest positive moods
            const positiveMoods = ['excited', 'happy', 'content'];
            let bestTimeSlot = null;
            let bestScore = -1;
            
            moodByTimeOfDay.forEach(timeSlot => {
              const positiveScore = positiveMoods.reduce((sum, mood) => sum + (timeSlot[mood] || 0), 0);
              if (positiveScore > bestScore) {
                bestScore = positiveScore;
                bestTimeSlot = timeSlot;
              }
            });
            
            return bestTimeSlot && bestScore > 0 ? (
              <p>Your mood tends to be most positive during the <strong>{bestTimeSlot.time}</strong>. Consider scheduling important activities during this time.</p>
            ) : null;
          })()}
        </div>
      </div>
      
      {/* Conditional rendering of day detail modal */}
      {showDayDetail && selectedDay && (
        <div className="modal-overlay" onClick={handleCloseDayDetail}>
          <div className="day-detail-modal" onClick={e => e.stopPropagation()}>
            <button className="close-button" onClick={handleCloseDayDetail}>×</button>
            
          </div>
        </div>
      )}
      
      {/* No data message */}
      {data.length === 0 && (
        <div className="no-data-message">
          <AlertTriangle size={48} />
          <h3>No mood data available</h3>
          <p>Start logging your moods to see analytics and insights.</p>
        </div>
      )}
    </div>
  );
};

export default MoodAnalyticsPage;