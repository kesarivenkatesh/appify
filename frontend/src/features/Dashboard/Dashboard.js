import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { 
  Smile, Brain, Music, Dumbbell, BookHeart, 
  TrendingUp, Calendar, Award, Clock, Quote, Laugh,
  Frown, Meh, Zap, Battery
} from 'lucide-react';
import UserService from '../../services/UserService';
import DashboardService from '../../services/DashboardService';
import './Dashboard.css';

// Mood icons mapping
const moodIcons = {
  'happy': <Smile className="icon green" />,
  'sad': <Frown className="icon blue" />,
  'neutral': <Meh className="icon gray" />,
  'energetic': <Zap className="icon yellow" />,
  'tired': <Battery className="icon purple" />
};

// Mood trend descriptions and colors
const moodTrendConfig = {
  'happy': { label: 'Positive', colorClass: 'green-bg' },
  'improving': { label: 'Improving', colorClass: 'green-bg' },
  'sad': { label: 'Downward', colorClass: 'blue-bg' },
  'neutral': { label: 'Steady', colorClass: 'gray-bg' },
  'energetic': { label: 'Energetic', colorClass: 'yellow-bg' },
  'tired': { label: 'Tired', colorClass: 'purple-bg' },
  'fluctuating': { label: 'Fluctuating', colorClass: 'purple-bg' }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState('');
  const [dashboardStats, setDashboardStats] = useState({
    journalCount: 0,
    streak: 0,
    lastActivity: 'No activity',
    moodTrend: {
      trend: 'neutral',
      description: 'Steady'
    }
  });
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch current user
        const userData = await new UserService().getCurrentUser();
        if (!userData) {
          window.location.href = '/login';
          return;
        }
        setUser(userData);
        
        // Fetch dashboard stats
        const dashboardService = new DashboardService();
        const statsResponse = await dashboardService.getDashboardStats();
        setDashboardStats(statsResponse);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Navigation handler
  const handleNavigation = (path) => {
    console.log(`Navigating to: ${path}`);
    navigate(path);
  };

  // Get the appropriate trend display
  const getTrendDisplay = () => {
    const trend = dashboardStats.moodTrend.trend;
    const config = moodTrendConfig[trend] || moodTrendConfig.neutral;
    const icon = moodIcons[trend] || <TrendingUp className="icon purple" />;
    
    return {
      icon: icon,
      title: 'Mood Trend',
      value: config.label,
      colorClass: config.colorClass
    };
  };

  // Build stats display with dynamic mood trend
  const statsDisplay = [
    {
      icon: <BookHeart className="icon pink" />,
      title: 'Journal Entries',
      value: dashboardStats.journalCount,
      colorClass: 'pink-bg'
    },
    getTrendDisplay(),
    {
      icon: <Award className="icon yellow" />,
      title: 'Current Streak',
      value: `${dashboardStats.streak} days`,
      colorClass: 'yellow-bg'
    },
    {
      icon: <Clock className="icon blue" />,
      title: 'Last Activity',
      value: dashboardStats.lastActivity,
      colorClass: 'blue-bg'
    },
  ];

  const quickActions = [
    {
      icon: <Smile className="icon yellow" />,
      title: 'Mood Check',
      description: 'How are you feeling today?',
      path: '/moodcheck',
      colorClass: 'yellow-bg'
    },
    {
      icon: <BookHeart className="icon pink" />,
      title: 'Journal',
      description: 'Write your thoughts',
      path: '/journal',
      colorClass: 'pink-bg'
    },
    {
      icon: <Music className="icon purple" />,
      title: 'Calming Music',
      description: 'Listen to soothing tracks',
      path: '/music',
      colorClass: 'purple-bg'
    },
    {
      icon: <Brain className="icon blue" />,
      title: 'Meditation',
      description: 'Clear your mind',
      path: '/meditation',
      colorClass: 'blue-bg'
    },
    {
      icon: <Dumbbell className="icon green" />,
      title: 'Exercise',
      description: 'Stay active',
      path: '/exercise',
      colorClass: 'green-bg'
    },
    {
      icon: <Quote className="icon orange" />,
      title: 'Inspirational Quotes',
      description: 'Get daily motivation',
      path: '/motivation',
      colorClass: 'orange-bg'
    },
    {
      icon: <Laugh className="icon yellow" />,
      title: 'Laugh Out Loud',
      description: 'Keep laughing Out Loud',
      path: '/laughoutloud',
      colorClass: 'pink-bg'
    }
  ];

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <h1 className="dashboard-title">
            Welcome back{user.username !== undefined ? `, ${user.username}` : ''}!
          </h1>
          <p className="dashboard-date">
            <Calendar className="inline-icon" />
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
        <p className="dashboard-subtitle">Let's continue your wellness journey today.</p>
      </div>

      <div className="stats-grid">
        {statsDisplay.map((stat, index) => (
          <div
            key={index}
            className={`stat-card ${stat.colorClass}`}
          >
            <div className="icon-container">
              {stat.icon}
            </div>
            <div className="stat-info">
              <p className="stat-title">{stat.title}</p>
              <p className="stat-value">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <h2 className="section-title">Quick Actions</h2>
      <div className="actions-grid">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={() => handleNavigation(action.path)}
            className={`action-card ${action.colorClass}`}
          >
            <div className="action-content">
              <div className="icon-container">
                {action.icon}
              </div>
              <div className="action-info">
                <h3 className="action-title">
                  {action.title}
                </h3>
                <p className="action-description">{action.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;