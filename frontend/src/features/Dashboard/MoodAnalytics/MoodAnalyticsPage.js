import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, TrendingUp, BookHeart, BarChart2, Award, 
  AlertTriangle, ChevronLeft, Download, Filter, PieChart,
  RefreshCw, Clock
} from 'lucide-react';
import MoodService from '../../../services/MoodService';
import AnalyticsService from '../../../services/AnalyticsService';
import JournalService from '../../../services/JournalService';
import MoodCalendarVisualization from './MoodCalendarVisualization';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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
  const [dateRange, setDateRange] = useState('');
  const [data, setData] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
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
  const [insights, setInsights] = useState([]);
  const [exportLoading, setExportLoading] = useState(false);
  const analyticsPageRef = useRef(null);

  // Calculate date range whenever the time range changes
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
    } else if (timeRange === 'quarter') {
      // Calculate the current quarter
      const quarter = Math.floor(now.getMonth() / 3);
      
      // Set start to the first day of the current quarter
      start = new Date(now.getFullYear(), quarter * 3, 1);
      
      // Set end to the last day of the current quarter
      const end = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
      
      // Format dates
      const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      
      rangeText = `${startStr} - ${endStr}`;
    } else if (timeRange === 'year') {
      // Set to the current year
      rangeText = now.getFullYear().toString();
    }
    
    setDateRange(rangeText);
  }, [timeRange]);

  useEffect(() => {
    fetchData();
    fetchJournalEntries();
  }, [timeRange]);
  
  // New effect to generate insights based on the latest data
  useEffect(() => {
    if (!loading && (data.length > 0 || journalEntries.length > 0)) {
      generateInsights();
    }
  }, [loading, data, journalEntries, stats, moodDistribution, moodByTimeOfDay, activityCorrelation, timeRange]);

  // Function to fetch journal entries using the JournalService
  const fetchJournalEntries = async () => {
    try {
      const journalService = new JournalService();
      
      // Get journal entries for the selected time range
      const response = await journalService.getJournalEntries({ timeRange });
      
      // Access the data array from the response
      const entries = response.data || [];
      
      console.log(`Fetched ${entries.length} journal entries for time range: ${timeRange}`, entries);
      
      // Process journal entries to match mood data format for integration
      const processedEntries = entries.map(entry => {
        // Extract date from different possible formats
        let entryDate;
        if (entry.date && entry.date.$date) {
          entryDate = new Date(entry.date.$date);
        } else if (typeof entry.date === 'string') {
          entryDate = new Date(entry.date);
        } else if (entry.timestamp) {
          entryDate = new Date(entry.timestamp);
        } else {
          entryDate = new Date(); // Fallback
        }
        
        // Format date consistently
        const formattedDate = entryDate.toISOString().split('T')[0];
        
        return {
          date: formattedDate,
          timestamp: entryDate.toISOString(),
          mood: entry.mood || 'neutral',
          intensity: entry.intensity || 3,
          notes: entry.content || '',
          source: 'journal',
          id: entry._id || `journal-${Math.random().toString(36).substr(2, 9)}`
        };
      });
      
      setJournalEntries(processedEntries);
    } catch (err) {
      console.error('Failed to fetch journal entries:', err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Create a new instance of the service
      const analyticsService = new AnalyticsService();
      
      // Add some console logs for debugging
      console.log(`Fetching analytics for time range: ${timeRange}`);
      
      // Try to get the comprehensive analytics
      const analyticsData = await analyticsService.getComprehensiveAnalytics(timeRange);
      console.log("Analytics data received:", analyticsData);
      
      // Check if the data is valid before setting state
      if (!analyticsData) {
        throw new Error("No analytics data received");
      }
      
      // Set all state variables from the comprehensive data
      setData(analyticsData.moods || []);
      setStats(analyticsData.stats || {
        mostCommonMood: 'neutral',
        averageIntensity: 3,
        variability: 'low',
        trend: 'stable',
        totalEntries: 0
      });
      setMoodDistribution(analyticsData.moodDistribution || []);
      setMoodByTimeOfDay(analyticsData.moodByTimeOfDay || []);
      setActivityCorrelation(analyticsData.activityCorrelation || []);
      setStreakData(analyticsData.streakData || {
        current: 0,
        longest: 0,
        thisWeek: 0,
        thisMonth: 0
      });
      
    } catch (err) {
      console.error('Failed to fetch analytics data:', err);
      // More detailed error message
      setError(`Failed to load analytics: ${err.message || 'Unknown error'}. Please try again.`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const generateInsights = () => {
    const newInsights = [];
    
    // Base insights from stats
    if (stats.mostCommonMood) {
      newInsights.push(`Your most logged mood is <strong>${stats.mostCommonMood}</strong> during this ${timeRange} period, suggesting a frequent emotional pattern.`);
    }
    
    if (stats.trend) {
      newInsights.push(`Your mood trend appears to be <strong>${stats.trend}</strong> over this ${timeRange}. This might indicate ${stats.trend === 'improving' ? 'positive changes in' : stats.trend === 'declining' ? 'challenges to' : 'consistency in'} your emotional well-being over time.`);
    }
    
    if (stats.variability && stats.averageIntensity) {
      newInsights.push(`The variability in your mood is <strong>${stats.variability}</strong>, with an average intensity of <strong>${stats.averageIntensity.toFixed(1)}</strong> for this ${timeRange}.`);
    }
    
    // Journal insights
    if (journalEntries.length > 0) {
      newInsights.push(`You've written <strong>${journalEntries.length} journal entries</strong> during this ${timeRange}, which helps you track your emotional journey more effectively.`);
      
      // Find most common mood in journals
      const moodCounts = {};
      journalEntries.forEach(entry => {
        moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
      });
      
      let mostCommonJournalMood = 'neutral';
      let maxCount = 0;
      
      Object.entries(moodCounts).forEach(([mood, count]) => {
        if (count > maxCount) {
          maxCount = count;
          mostCommonJournalMood = mood;
        }
      });
      
      if (mostCommonJournalMood !== stats.mostCommonMood) {
        newInsights.push(`Interestingly, your journal entries most frequently express <strong>${mostCommonJournalMood}</strong>, which differs from your mood logs. This might indicate deeper reflection in your journaling.`);
      }
    }
    
    // Activity insights
    if (activityCorrelation.length > 0) {
      const topActivity = activityCorrelation[0];
      if (topActivity.positiveImpact > 50) {
        newInsights.push(`<strong>${topActivity.name}</strong> appears to have a significant positive impact on your mood (${topActivity.positiveImpact}% positive correlation) during this period.`);
      }
      
      // Compare time-period specific activities
      if (timeRange === 'week' && activityCorrelation.length >= 3) {
        newInsights.push(`This week, your top mood-boosting activities are <strong>${activityCorrelation[0].name}</strong>, <strong>${activityCorrelation[1].name}</strong>, and <strong>${activityCorrelation[2].name}</strong>.`);
      } else if (timeRange === 'year' && activityCorrelation.length >= 2) {
        newInsights.push(`Throughout the year, <strong>${activityCorrelation[0].name}</strong> and <strong>${activityCorrelation[1].name}</strong> have been your most consistent mood enhancers.`);
      }
    }
    
    // Mood distribution insights
    if (moodDistribution.length > 0) {
      const negativeCount = moodDistribution
        .filter(item => ['sad', 'angry', 'anxious'].includes(item.mood))
        .reduce((sum, item) => sum + item.count, 0);
      
      const positiveCount = moodDistribution
        .filter(item => ['excited', 'happy', 'content'].includes(item.mood))
        .reduce((sum, item) => sum + item.count, 0);
      
      const totalMoods = moodDistribution.reduce((sum, item) => sum + item.count, 0);
      
      if (totalMoods > 0) {
        const negativePercentage = (negativeCount / totalMoods) * 100;
        const positivePercentage = (positiveCount / totalMoods) * 100;
        
        if (negativePercentage > 33) {
          newInsights.push(`During this ${timeRange}, you've logged a significant number of negative moods (${negativePercentage.toFixed(1)}%). Consider talking to someone or exploring mood-lifting activities.`);
        }
        
        if (positivePercentage > 60) {
          newInsights.push(`You've experienced a high percentage of positive moods (${positivePercentage.toFixed(1)}%) in this ${timeRange}. Keep up whatever you're doing!`);
        }
        
        // Time range specific insights
        if (timeRange === 'month' || timeRange === 'quarter') {
          const dominantMood = moodDistribution.sort((a, b) => b.count - a.count)[0];
          newInsights.push(`Your dominant mood over this ${timeRange} has been <strong>${dominantMood.mood}</strong>, accounting for ${((dominantMood.count / totalMoods) * 100).toFixed(1)}% of your emotions.`);
        }
      }
    }
    
    // Time of day insights
    if (moodByTimeOfDay.length > 0) {
      const positiveMoods = ['excited', 'happy', 'content'];
      const negativeMoods = ['sad', 'angry', 'anxious'];
      
      let bestTimeSlot = null;
      let bestScore = -1;
      let worstTimeSlot = null;
      let worstScore = -1;
      
      moodByTimeOfDay.forEach(timeSlot => {
        const positiveScore = positiveMoods.reduce((sum, mood) => sum + (timeSlot[mood] || 0), 0);
        const negativeScore = negativeMoods.reduce((sum, mood) => sum + (timeSlot[mood] || 0), 0);
        
        if (positiveScore > bestScore) {
          bestScore = positiveScore;
          bestTimeSlot = timeSlot;
        }
        
        if (negativeScore > worstScore) {
          worstScore = negativeScore;
          worstTimeSlot = timeSlot;
        }
      });
      
      if (bestTimeSlot && bestScore > 0) {
        newInsights.push(`Your mood tends to be most positive during <strong>${bestTimeSlot.time}</strong> in this ${timeRange}. Consider scheduling important activities during this time.`);
      }
      
      if (worstTimeSlot && worstScore > 0) {
        newInsights.push(`You tend to experience more negative moods during <strong>${worstTimeSlot.time}</strong>. Be mindful of potential stressors during this time of day.`);
      }
      
      // Time range specific insights
      if (timeRange === 'week') {
        newInsights.push(`This week, tracking your mood patterns throughout the day can help you identify optimal times for different activities.`);
      } else if (timeRange === 'year') {
        newInsights.push(`Your yearly data suggests consistent mood patterns at certain times of day, which may help with long-term scheduling decisions.`);
      }
    }
    
    // Streak insights based on time range
    if (streakData) {
      if (timeRange === 'week' && streakData.thisWeek > 0) {
        newInsights.push(`You've logged your mood ${streakData.thisWeek} out of 7 days this week. ${streakData.thisWeek >= 5 ? 'Great consistency!' : 'Try to log more regularly for better insights.'}`);
      } else if (timeRange === 'month' && streakData.thisMonth > 0) {
        const percentage = (streakData.thisMonth / 30) * 100;
        newInsights.push(`You've logged your mood ${streakData.thisMonth} days this month (${percentage.toFixed(0)}% consistency).`);
      } else if (timeRange === 'year' && streakData.longest > 0) {
        newInsights.push(`Your longest mood logging streak this year was ${streakData.longest} days. Consistent tracking provides the most accurate insights.`);
      }
    }
    
    // Filter out any empty insights and limit to 6 most relevant
    setInsights(newInsights.filter(insight => insight.trim() !== '').slice(0, 6));
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
    fetchJournalEntries();
  };
  
  // Function to handle exporting analytics as PDF
  const handleExport = async () => {
    if (!analyticsPageRef.current) return;
    
    setExportLoading(true);
    
    try {
      // Create filename with date and time range
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `mood-analytics-${timeRange}-${timestamp}.pdf`;
      
      // Create a new jsPDF instance
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      
      // Set up PDF metadata
      pdf.setProperties({
        title: `Mood Analytics - ${timeRange}`,
        subject: `Mood data analytics for ${dateRange}`,
        author: 'Mood Tracker App',
        keywords: 'mood, analytics, mental health',
        creator: 'Mood Tracker App'
      });
      
      // Add title
      pdf.setFontSize(16);
      pdf.text(`Mood Analytics: ${dateRange}`, 15, 15);
      
      // Get all chart elements
      const elements = analyticsPageRef.current.querySelectorAll('.chart-card');
      
      // Handle page navigation
      let yPosition = 25;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Process each chart sequentially
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        
        // Get chart title
        const title = element.querySelector('.chart-title').innerText;
        
        // Create canvas from the chart
        const canvas = await html2canvas(element.querySelector('.chart-container'), {
          scale: 2,
          logging: false,
          useCORS: true
        });
        
        // Convert to image
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        
        // Calculate dimensions - maintain aspect ratio
        const imgWidth = pageWidth - 30; // 15mm margin on each side
        const imgHeight = canvas.height * imgWidth / canvas.width;
        
        // Check if we need a new page
        if (yPosition + imgHeight + 10 > pageHeight) {
          pdf.addPage();
          yPosition = 15;
        }
        
        // Add chart title
        pdf.setFontSize(12);
        pdf.text(title, 15, yPosition);
        yPosition += 7;
        
        // Add the image
        pdf.addImage(imgData, 'JPEG', 15, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 15;
      }
      
      // Add insights
      if (insights.length > 0) {
        if (yPosition + 50 > pageHeight) {
          pdf.addPage();
          yPosition = 15;
        }
        
        pdf.setFontSize(14);
        pdf.text(`Insights for ${timeRange === 'week' ? 'This Week' : 
               timeRange === 'month' ? 'This Month' : 
               timeRange === 'quarter' ? 'This Quarter' : 'This Year'}`, 15, yPosition);
        
        yPosition += 10;
        pdf.setFontSize(10);
        
        insights.forEach(insight => {
          // Strip HTML tags for PDF text
          const plainText = insight.replace(/<\/?[^>]+(>|$)/g, "");
          
          // Add insight text with word wrap
          const splitText = pdf.splitTextToSize(plainText, pageWidth - 30);
          
          // Check if we need a new page
          if (yPosition + splitText.length * 5 > pageHeight) {
            pdf.addPage();
            yPosition = 15;
          }
          
          pdf.text(splitText, 15, yPosition);
          yPosition += splitText.length * 5 + 5;
        });
      }
      
      // Add summary stats
      if (yPosition + 30 > pageHeight) {
        pdf.addPage();
        yPosition = 15;
      }
      
      pdf.setFontSize(12);
      pdf.text('Summary Statistics', 15, yPosition);
      yPosition += 7;
      
      pdf.setFontSize(10);
      pdf.text(`Most Common Mood: ${stats.mostCommonMood}`, 15, yPosition);
      yPosition += 5;
      pdf.text(`Average Intensity: ${stats.averageIntensity.toFixed(1)}`, 15, yPosition);
      yPosition += 5;
      pdf.text(`Mood Trend: ${stats.trend}`, 15, yPosition);
      yPosition += 5;
      pdf.text(`Variability: ${stats.variability}`, 15, yPosition);
      yPosition += 5;
      pdf.text(`Total Entries: ${stats.totalEntries}`, 15, yPosition);
      yPosition += 5;
      pdf.text(`Journal Entries: ${journalEntries.length}`, 15, yPosition);
      
      // Add footer with date
      const footerStr = `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`;
      pdf.setFontSize(8);
      
      // Add footer to all pages
      const pageCount = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.text(footerStr, pageWidth - 15, pageHeight - 10, { align: 'right' });
        pdf.text(`Page ${i} of ${pageCount}`, 15, pageHeight - 10);
      }
      
      // Save the PDF
      pdf.save(filename);
      
    } catch (err) {
      console.error('Failed to export PDF:', err);
      alert('Failed to export analytics. Please try again.');
    } finally {
      setExportLoading(false);
    }
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

  // Format mood data for the line chart based on the current time range
  const formatLineChartData = () => {
    // Combine mood logs and journal entries
    const combinedData = [...data, ...journalEntries]
      .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date
    
    // For specific time ranges, we might want to aggregate differently
    if (timeRange === 'year') {
      // For yearly view, group by month to avoid overwhelming chart
      const monthlyData = {};
      
      combinedData.forEach(entry => {
        const date = new Date(entry.date);
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            date: new Date(date.getFullYear(), date.getMonth(), 15).toISOString().split('T')[0],
            moodCounts: {},
            intensitySum: 0,
            totalEntries: 0
          };
        }
        
        // Count mood occurrences
        monthlyData[monthKey].moodCounts[entry.mood] = (monthlyData[monthKey].moodCounts[entry.mood] || 0) + 1;
        monthlyData[monthKey].intensitySum += entry.intensity;
        monthlyData[monthKey].totalEntries += 1;
      });
      
      // Convert to array and find dominant mood for each month
      return Object.values(monthlyData).map(month => {
        let dominantMood = 'neutral';
        let maxCount = 0;
        
        Object.entries(month.moodCounts).forEach(([mood, count]) => {
          if (count > maxCount) {
            maxCount = count;
            dominantMood = mood;
          }
        });
        
        // Convert mood to numeric value for the chart
        const moodIndex = Object.keys(moodColors).indexOf(dominantMood) + 1;
        const avgIntensity = month.intensitySum / month.totalEntries;
        
        return {
          date: month.date,
          mood: moodIndex,
          moodName: dominantMood,
          intensity: avgIntensity,
          entries: month.totalEntries
        };
      });
    } else {
      // For other time ranges, use individual entries
      return combinedData.map(entry => {
        // Convert the mood to a numeric value (1-8) for the line chart
        const moodIndex = Object.keys(moodColors).indexOf(entry.mood) + 1;
        
        return {
          date: entry.date,
          mood: moodIndex,
          moodName: entry.mood,
          intensity: entry.intensity,
          source: entry.source
        };
      });
    }
  };
  
  const lineChartData = formatLineChartData();
  
  // Prepare data for the pie chart - should reflect the current time range
  const pieChartData = moodDistribution
    .map(entry => ({
      name: entry.mood,
      value: entry.count,
      color: moodColors[entry.mood] || '#94A3B8'
    }))
    .sort((a, b) => b.value - a.value); // Sort by count to highlight most common moods

  // Format mood sources data - properly count both mood logs and journal entries
  const formatMoodSourcesData = () => {
    // Count mood logs
    const moodLogCount = data.filter(entry => !entry.source || entry.source === 'mood_log').length;
    
    // Count journal entries
    const journalCount = journalEntries.length;
    
    // Count other sources
    const otherSources = data.reduce((acc, entry) => {
      if (entry.source && entry.source !== 'mood_log' && entry.source !== 'journal') {
        acc[entry.source] = (acc[entry.source] || 0) + 1;
      }
      return acc;
    }, {});
    
    // Create the source data array
    const sourcesData = [
      {
        name: 'Mood Log',
        value: moodLogCount,
        color: '#6366f1'
      }
    ];
    
    // Add journal entries if there are any
    if (journalCount > 0) {
      sourcesData.push({
        name: 'Journal',
        value: journalCount,
        color: '#22c55e'
      });
    }
    
    // Add other sources
    Object.entries(otherSources).forEach(([key, value]) => {
      sourcesData.push({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value,
        color: key === 'trend' ? '#eab308' : '#94A3B8'
      });
    });
    
    console.log('Source distribution data:', sourcesData);
    
    return sourcesData;
  };
  
  const moodSourcesData = formatMoodSourcesData();

  return (
    <div className="analytics-page" ref={analyticsPageRef}>
      {/* Overlay for refresh indicator */}
      {refreshing && (
        <div className="refresh-overlay">
          <div className="spinner"></div>
          <p>Refreshing data...</p>
        </div>
      )}
      
      {/* Overlay for export loading */}
      {exportLoading && (
        <div className="export-overlay">
          <div className="spinner"></div>
          <p>Generating PDF export...</p>
        </div>
      )}
      
      {/* Header section */}
      <div className="analytics-header">
        <div className="header-main">
          <h2>Mood Analytics Overview</h2>
          <p className="analytics-subtitle">
            Gain insights into your emotional patterns and trends
          </p>
          {dateRange && <p className="date-range">{dateRange}</p>}
        </div>
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
          <button 
            className="export-button" 
            onClick={handleExport} 
            disabled={exportLoading || (data.length === 0 && journalEntries.length === 0)}
            title={(data.length === 0 && journalEntries.length === 0) ? "No data to export" : "Export as PDF"}
          >
            <Download size={16} className={exportLoading ? 'spin' : ''} /> 
            {exportLoading ? 'Exporting...' : 'Export PDF'}
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
        journalCount={journalEntries.length}
      />

      {/* Calendar Visualization */}
      <div className="calendar-section">
        <h3>Mood Calendar</h3>
        <div className="calendar-container">
          <MoodCalendarVisualization 
            moodData={[...data, ...journalEntries]} 
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
            <p className="chart-description">
              {timeRange === 'year' 
                ? 'Monthly mood trends throughout the year' 
                : `Track how your mood has changed over the ${timeRange}`}
            </p>
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
                    // Format differently based on time range
                    if (timeRange === 'year') {
                      return `${d.toLocaleDateString('en-US', { month: 'short' })}`;
                    } else if (timeRange === 'quarter') {
                      return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
                    } else {
                      return `${d.getMonth() + 1}/${d.getDate()}`;
                    }
                  }}
                  tick={{ fontSize: timeRange === 'year' ? 12 : 10 }}
                  interval={timeRange === 'year' ? 0 : timeRange === 'quarter' ? 5 : 'preserveStartEnd'}
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
                  labelFormatter={(date) => {
                    const d = new Date(date);
                    if (timeRange === 'year') {
                      return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                    } else {
                      return d.toLocaleDateString();
                    }
                  }}
                  contentStyle={{ backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="mood" 
                  stroke="#8884d8" 
                  strokeWidth={2} 
                  activeDot={{ r: 8 }}
                  name="Mood"
                  dot={{ stroke: '#8884d8', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="intensity" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  name="Intensity"
                  dot={{ stroke: '#82ca9d', strokeWidth: 2, r: 4 }}
                />
                {timeRange === 'year' && (
                  <Line 
                    type="monotone" 
                    dataKey="entries" 
                    stroke="#ff7300" 
                    strokeWidth={2}
                    name="Entry Count"
                    dot={{ stroke: '#ff7300', strokeWidth: 2, r: 4 }}
                  />
                )}
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
            <p className="chart-description">
              {`How often you experience each mood in this ${timeRange}`}
            </p>
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
                <Tooltip 
                  formatter={(value) => [`${value} entries`, 'Count']} 
                  contentStyle={{ backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
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
            <p className="chart-description">
              {`How your mood changes throughout the day in this ${timeRange}`}
            </p>
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
                <Tooltip 
                  contentStyle={{ backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
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
            <p className="chart-description">
              {`Which activities improve your mood the most in this ${timeRange}`}
            </p>
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
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Positive Impact']} 
                  contentStyle={{ backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
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
            <p className="chart-description">
              {`Where your mood data comes from in this ${timeRange}`}
            </p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={moodSourcesData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {moodSourcesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value} entries`, 'Count']} 
                  contentStyle={{ backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="insights-section">
        <h3>Insights for {timeRange === 'week' ? 'This Week' : 
               timeRange === 'month' ? 'This Month' : 
               timeRange === 'quarter' ? 'This Quarter' : 'This Year'}</h3>
        <div className="insights-content">
          {insights.length > 0 ? (
            insights.map((insight, index) => (
              <p key={index} dangerouslySetInnerHTML={{ __html: insight }} />
            ))
          ) : (
            <p>Log more moods to receive personalized insights for this time period.</p>
          )}
        </div>
      </div>
      
      {/* Conditional rendering of day detail modal */}
      {showDayDetail && selectedDay && (
        <div className="modal-overlay" onClick={handleCloseDayDetail}>
          <div className="day-detail-modal" onClick={e => e.stopPropagation()}>
            <button className="close-button" onClick={handleCloseDayDetail}>×</button>
            <h3>Mood Details for {new Date(selectedDay.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
            
            {selectedDay.entries?.length > 0 ? (
              <div className="day-mood-entries">
                {selectedDay.entries.map((entry, idx) => (
                  <div key={idx} className={`mood-entry-card ${entry.mood}-bg`}>
                    <div className="entry-time">
                      {entry.timestamp ? new Date(entry.timestamp).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'Time not recorded'}
                    </div>
                    <div className="entry-mood">
                      <strong>Mood:</strong> {entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}
                    </div>
                    <div className="entry-intensity">
                      <strong>Intensity:</strong> {entry.intensity}/5
                    </div>
                    {entry.notes && (
                      <div className="entry-notes">
                        <strong>Notes:</strong> {entry.notes}
                      </div>
                    )}
                    <div className="entry-source">
                      <em>Source: {entry.source === 'mood_log' ? 'Mood Log' : entry.source.charAt(0).toUpperCase() + entry.source.slice(1)}</em>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No detailed entries found for this date.</p>
            )}
          </div>
        </div>
      )}
      
      {/* No data message */}
      {data.length === 0 && journalEntries.length === 0 && (
        <div className="no-data-message">
          <AlertTriangle size={48} />
          <h3>No mood data available for this {timeRange}</h3>
          <p>Start logging your moods or writing journal entries to see analytics and insights for this time period.</p>
        </div>
      )}
    </div>
  );
};

export default MoodAnalyticsPage;