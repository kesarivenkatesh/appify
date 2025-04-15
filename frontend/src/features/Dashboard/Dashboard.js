import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { 
  Brain, Music, Dumbbell, BookHeart, 
  TrendingUp, Calendar, Award, Clock, Quote, Laugh,
  Home, LogOut, Menu, X, Play, User, BarChart2,
  Moon, Coffee, LightbulbIcon, Flag, Move
} from 'lucide-react';
import UserService from '../../services/UserService';
import DashboardService from '../../services/DashboardService';
import VideoService from '../../services/VideoService';
import YouTubeVideoPlayer from '../YouTubeVideoPlayer';
import './Dashboard.css';

// Mood trend descriptions and colors
const moodTrendConfig = {
  'excited': { label: 'Excited', colorClass: 'yellow-bg' },
  'happy': { label: 'Positive', colorClass: 'green-bg' },
  'content': { label: 'Content', colorClass: 'indigo-bg' },
  'neutral': { label: 'Neutral', colorClass: 'gray-bg' },
  'fluctuating': { label: 'Fluctuating', colorClass: 'purple-bg' },
  'anxious': { label: 'Anxious', colorClass: 'orange-bg' },
  'tired': { label: 'Tired', colorClass: 'purple-bg' },
  'sad': { label: 'Sad', colorClass: 'blue-bg' },
  'angry': { label: 'Angry', colorClass: 'red-bg' }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    journalCount: 9,
    streak: 0,
    lastActivity: '5 days ago',
    moodTrend: {
      trend: 'fluctuating',
      description: 'Fluctuating'
    }
  });
  const [recommendedVideos, setRecommendedVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentVideo, setCurrentVideo] = useState(null);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
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
        
        // Fetch video recommendations based on mood trend
        const videoService = new VideoService();
        const videos = await videoService.getRecommendedVideos(statsResponse.moodTrend.trend);
        setRecommendedVideos(videos);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
    
    // Set the sidebar to be open by default
    setSidebarOpen(true);
  }, []);

  // Navigation handler
  const handleNavigation = (path) => {
    console.log(`Navigating to: ${path}`);
    navigate(path);
    setSidebarOpen(false);
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await new UserService().logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Handle video click to play
  const handleVideoClick = (video) => {
    setCurrentVideo(video);
  };

  // Close video player
  const handleCloseVideo = () => {
    setCurrentVideo(null);
  };

  // Get the appropriate trend display
  const getTrendDisplay = () => {
    const trend = dashboardStats.moodTrend.trend;
    const config = moodTrendConfig[trend] || moodTrendConfig.neutral;
    
    return {
      icon: <TrendingUp className="icon purple" />,
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

  // Updated sidebar items to match the application names
  const sidebarItems = [
    {
      icon: <Home className="sidebar-icon" />,
      title: 'Home',
      path: '/dashboard'
    },
    {
      icon: <BookHeart className="sidebar-icon" />,
      title: 'Journal',
      path: '/journal'
    },
    {
      icon: <Brain className="sidebar-icon" />,
      title: 'Meditation',
      path: '/meditation'
    },
    {
      icon: <Music className="sidebar-icon" />,
      title: 'Calming Music',
      path: '/music'
    },
    {
      icon: <Quote className="sidebar-icon" />,
      title: 'Motivation',
      path: '/motivation'
    },
    {
      icon: <Laugh className="sidebar-icon" />,
      title: 'Laugh Out Loud',
      path: '/laughoutloud'
    },
    {
      icon: <Dumbbell className="sidebar-icon" />,
      title: 'Exercise',
      path: '/exercise'
    },
    {
      icon: <BarChart2 className="sidebar-icon" />,
      title: 'Mood Analytics',
      path: '/profile'
    },
    {
      icon: <User className="sidebar-icon" />,
      title: 'Profile',
      path: '/user-profile'
    }
  ];

  // Get current path for active state
  const location = useLocation();
  
  return (
    <div className="dashboard-layout">
      {/* Mobile Menu Button - only visible on small screens */}
      <button 
        className="mobile-menu-button"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X /> : <Menu />}
      </button>
      
      {/* Updated Sidebar with fixed visibility and white background */}
      <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <Laugh className="logo-icon"/>
          <h2 className="app-title">Happify</h2>
        </div>
        
        <nav className="sidebar-nav">
          {sidebarItems.map((item, index) => (
            <button
              key={index}
              className={`sidebar-nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => handleNavigation(item.path)}
            >
              <div className="nav-icon-container">
                {item.icon}
              </div>
              <span>{item.title}</span>
            </button>
          ))}
        </nav>
        
        {/* Logout button at the end of sidebar */}
        <button
          className="sidebar-logout-button"
          onClick={handleLogout}
        >
          <div className="nav-icon-container logout-icon">
            <LogOut className="sidebar-icon" />
          </div>
          <span>Log Out</span>
        </button>
      </div>
      
      {/* Main Content */}
      <div className="dashboard-main">
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

          {/* Stats Grid */}
          <div className="stats-grid">
            {statsDisplay.map((stat, index) => (
              <div
                key={index}
                className={`stat-card ${stat.colorClass}`}
              >
                <div className="stat-icon-container">
                  {stat.icon}
                </div>
                <div className="stat-info">
                  <p className="stat-title">{stat.title}</p>
                  <p className="stat-value">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Video Recommendations */}
          <div className="video-recommendations-section">
            <h2 className="section-title">Recommended Videos For Your Mood</h2>
            <p className="recommendation-subtitle">
              Videos to help with your {dashboardStats.moodTrend.trend} mood
            </p>
            
            {isLoading ? (
              <div className="loading-indicator">
                <div className="spinner"></div>
                <p>Loading recommendations...</p>
              </div>
            ) : recommendedVideos.length > 0 ? (
              <div className="video-grid">
                {recommendedVideos.map((video, index) => (
                  <div 
                    key={index} 
                    className="video-card"
                    onClick={() => handleVideoClick(video)}
                  >
                    <div className="video-thumbnail">
                      <img src={video.thumbnail} alt={video.title} />
                      <div className="play-overlay">
                        <Play />
                      </div>
                    </div>
                    <div className="video-info">
                      <h3 className="video-title">{video.title}</h3>
                      <p className="video-description">{video.description}</p>
                      <p className="video-duration">{video.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-recommendations">
                <p>No videos found for your current mood. Try checking again later.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* YouTube Video Player Modal */}
      {currentVideo && (
        <YouTubeVideoPlayer
          videoId={currentVideo.youtube_id}
          videoTitle={currentVideo.title}
          dbVideoId={currentVideo.id}
          onClose={handleCloseVideo}
        />
      )}
    </div>
  );
};

export default Dashboard;