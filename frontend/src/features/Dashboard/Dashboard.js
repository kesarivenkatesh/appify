import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { 
  Brain, Music, Dumbbell, BookHeart, 
  TrendingUp, Calendar, Award, Clock, Quote, Laugh,
  Home, LogOut, Menu, X, Play, User, BarChart2
} from 'lucide-react';
import UserService from '../../services/UserService';
import DashboardService from '../../services/DashboardService';
import VideoService from '../../services/VideoService';
import MoodService from '../../services/MoodService';
import YouTubeVideoPlayer from '../YouTubeVideoPlayer';
import MoodAnalyticsSummary from './MoodAnalytics/MoodAnalyticsSummary';
import Sidebar from '../SideBar/SideBar';
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
  const [user, setUser] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    journalCount: 0,
    streak: 0,
    lastActivity: 'No activity yet',
    moodTrend: {
      trend: 'neutral',
      description: 'No recent mood data'
    }
  });
  const [moodData, setMoodData] = useState([]);
  const [recommendedVideos, setRecommendedVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentVideo, setCurrentVideo] = useState(null);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        // Fetch current user
        const userService = new UserService();
        const userData = await userService.getCurrentUser();
        if (!userData) {
          navigate('/login');
          return;
        }
        setUser(userData);
        
        // Create service instances
        const dashboardService = new DashboardService();
        const moodService = new MoodService();
        
        try {
          // Fetch dashboard stats (may fail if endpoint not available)
          const statsResponse = await dashboardService.getDashboardStats();
          setDashboardStats(statsResponse);
        } catch (statsError) {
          console.warn('Error fetching dashboard stats, using defaults:', statsError);
          // Leave default stats
        }
        
        try {
          // Fetch mood data (using safer implementation that handles errors internally)
          const moodsResponse = await moodService.getAllMoods();
          setMoodData(moodsResponse);
        } catch (moodError) {
          console.warn('Error fetching mood data:', moodError);
          // Leave empty mood data
        }
        
        try {
          // Fetch video recommendations based on mood trend
          const videoService = new VideoService();
          const videos = await videoService.getRecommendedVideos(dashboardStats.moodTrend.trend);
          setRecommendedVideos(videos);
        } catch (videoError) {
          console.warn('Error fetching video recommendations:', videoError);
          // Leave empty recommendations
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [navigate]);

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
      icon: <TrendingUp className="icon" />,
      title: 'Mood Trend',
      value: config.label,
      colorClass: config.colorClass
    };
  };

  // Build stats display with dynamic mood trend
  const statsDisplay = [
    {
      icon: <BookHeart className="icon" />,
      title: 'Journal Entries',
      value: dashboardStats.journalCount,
      colorClass: 'pink-bg'
    },
    getTrendDisplay(),
    {
      icon: <Award className="icon" />,
      title: 'Current Streak',
      value: `${dashboardStats.streak} days`,
      colorClass: 'yellow-bg'
    },
    {
      icon: <Clock className="icon" />,
      title: 'Last Activity',
      value: dashboardStats.lastActivity,
      colorClass: 'blue-bg'
    },
  ];
  
  return (
    <div className="dashboard-layout">
      {/* Mobile Menu Button - only visible on small screens */}
      <button 
        className="mobile-menu-button"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X /> : <Menu />}
      </button>
      
      {/* Use the updated Sidebar component */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      {/* Main Content */}
      <div className="dashboard-main">
        <div className="dashboard-container">
          {/* Header */}
          <div className="dashboard-header">
            <div className="dashboard-header-top">
              <h1 className="dashboard-title">
                Welcome back{user.username ? `, ${user.username}` : ''}!
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

          {/* Mood Analytics Summary Component */}
          <div className="mood-analytics-container">
            <MoodAnalyticsSummary />
          </div>

          {/* Video Recommendations */}
          <div className="video-recommendations-section">
            <h2 className="section-title">Recommended Videos For Your Mood</h2>
            <p className="recommendation-subtitle">
              Videos to help with your {dashboardStats.moodTrend.description.toLowerCase()} mood
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