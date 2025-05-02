import React, { useState, useEffect } from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Brain, Calendar, TrendingUp, BarChart2 } from 'lucide-react';
import MoodService from '../../../services/MoodService';
import './MoodAnalyticsSummary.css';

const MoodAnalyticsSummary = () => {
  const [timeRange, setTimeRange] = useState('month');
  const [dateRange, setDateRange] = useState('');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mood color mapping
  const moodColors = {
    'excited': '#FFD700', // gold
    'happy': '#4CAF50', // green
    'content': '#3F51B5', // indigo
    'neutral': '#9E9E9E', // gray
    'fluctuating': '#9C27B0', // purple
    'anxious': '#FF9800', // orange
    'tired': '#673AB7', // deep purple
    'sad': '#2196F3', // blue
    'angry': '#F44336' // red
  };

  useEffect(() => {
    // Calculate and set the date range string based on the selected time range
    const now = new Date();
    let start = new Date();
    let rangeText = '';
    
    if (timeRange === 'week') {
      // Set start to the beginning of the current week (Sunday)
      const day = now.getDay(); // 0 = Sunday, 6 = Saturday
      start.setDate(now.getDate() - day);
      
      // Format dates
      const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const endStr = new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      
      rangeText = `${startStr} - ${endStr}`;
    } else if (timeRange === 'month') {
      // Set start to the first day of the current month
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      
      // Set end to the last day of the current month
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      // Format dates
      const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      
      rangeText = `${startStr} - ${endStr}`;
    } else if (timeRange === 'year') {
      // Set start to January 1st of the current year
      start = new Date(now.getFullYear(), 0, 1);
      
      // Format as full year
      rangeText = now.getFullYear().toString();
    }
    
    setDateRange(rangeText);
  }, [timeRange]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const moodService = new MoodService();
        
        // Try to use the generateCombinedAnalytics method first
        try {
          const data = await moodService.generateCombinedAnalytics(timeRange);
          console.log('Analytics data:', data);
          setAnalyticsData(data);
        } catch (combinedError) {
          console.warn('Error generating combined analytics, trying individual methods:', combinedError);
          
          // If that fails, try to get analytics from the API
          try {
            const data = await moodService.getMoodAnalytics(timeRange);
            console.log('API Analytics data:', data);
            setAnalyticsData(data);
          } catch (apiError) {
            console.warn('Error getting mood analytics from API, using fallback:', apiError);
            
            // If both methods fail, create a minimal fallback
            // Get moods to create a simple distribution
            const moods = await moodService.getMoods(timeRange);
            
            // Calculate a simple distribution
            const distribution = {};
            moods.forEach(mood => {
              const moodType = mood.mood || 'neutral';
              distribution[moodType] = (distribution[moodType] || 0) + 1;
            });
            
            const distributionData = Object.entries(distribution).map(([mood, count]) => ({
              mood,
              count
            }));
            
            // Create a simple analytics object
            const fallbackData = {
              moods: moods,
              distribution: distributionData,
              summary: {
                mostCommonMood: moods.length > 0 ? 
                  Object.entries(distribution).sort((a, b) => b[1] - a[1])[0][0] : 'neutral',
                averageIntensity: moods.length > 0 ? 
                  moods.reduce((sum, m) => sum + (m.intensity || 3), 0) / moods.length : 3,
                variability: 'medium',
                trend: 'stable',
                totalEntries: moods.length
              }
            };
            
            setAnalyticsData(fallbackData);
          }
        }
      } catch (error) {
        console.error('Error fetching mood analytics:', error);
        setError('Could not load mood analytics data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  // Handle time range change
  const handleTimeRangeChange = (newRange) => {
    setTimeRange(newRange);
  };

  if (loading) {
    return (
      <div className="mood-analytics-loading">
        <div className="spinner"></div>
        <p>Loading mood analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mood-analytics-error">
        <p>{error}</p>
      </div>
    );
  }

  // If no data or no moods
  if (!analyticsData || !analyticsData.moods || analyticsData.moods.length === 0) {
    return (
      <div className="mood-analytics-empty">
        <Brain size={48} />
        <h2>No Mood Data Yet</h2>
        <p>Log your first mood to start seeing analytics here!</p>
      </div>
    );
  }

  // Format distribution data for the chart
  const distributionData = analyticsData.distribution || [];
  
  return (
    <div className="mood-analytics-summary">
      <div className="mood-analytics-header">
        <div className="header-main">
          <h2>Mood Analytics</h2>
          {dateRange && <p className="date-range">{dateRange}</p>}
        </div>
        <div className="time-range-selector">
          <button 
            className={timeRange === 'week' ? 'active' : ''} 
            onClick={() => handleTimeRangeChange('week')}
          >
            Week
          </button>
          <button 
            className={timeRange === 'month' ? 'active' : ''} 
            onClick={() => handleTimeRangeChange('month')}
          >
            Month
          </button>
          <button 
            className={timeRange === 'year' ? 'active' : ''} 
            onClick={() => handleTimeRangeChange('year')}
          >
            Year
          </button>
        </div>
      </div>
      
      <div className="mood-analytics-cards">
        <div className="analytics-card">
          <div className="analytics-icon">
            <Brain />
          </div>
          <div className="analytics-content">
            <h3>Most Common Mood</h3>
            <p className="analytics-value">
              {analyticsData.summary?.mostCommonMood || 'Neutral'}
            </p>
          </div>
        </div>
        
        <div className="analytics-card">
          <div className="analytics-icon">
            <TrendingUp />
          </div>
          <div className="analytics-content">
            <h3>Mood Trend</h3>
            <p className="analytics-value">
              {analyticsData.summary?.trend ? 
                analyticsData.summary.trend.charAt(0).toUpperCase() + analyticsData.summary.trend.slice(1) : 
                'Stable'}
            </p>
          </div>
        </div>
        
        <div className="analytics-card">
          <div className="analytics-icon">
            <Calendar />
          </div>
          <div className="analytics-content">
            <h3>Total Entries</h3>
            <p className="analytics-value">
              {analyticsData.summary?.totalEntries || 0}
            </p>
          </div>
        </div>
      </div>
      
      {/* Mood Distribution Chart */}
      {distributionData.length > 0 && (
        <div className="mood-distribution-chart">
          <h3>Mood Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={distributionData}
              margin={{
                top: 20,
                right: 30,
                left: 0,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mood" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey="count" 
                name="Occurrences" 
                fill="#8884d8"
                barSize={30}
              >
                {distributionData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={moodColors[entry.mood] || '#8884d8'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      
      <div className="mood-analytics-footer">
        <p>Log your mood regularly for more detailed insights!</p>
      </div>
    </div>
  );
};

export default MoodAnalyticsSummary;