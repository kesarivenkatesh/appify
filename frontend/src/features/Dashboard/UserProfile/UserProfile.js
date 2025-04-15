import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { 
  User, Mail, Key, BarChart2,  Activity,
  Home, LogOut, Menu, X, Clock,Library, BookHeart, Calendar, Save,
  Shield, Trash2, Eye, EyeOff, ChevronLeft, Award
} from 'lucide-react';
import UserService from '../../../services/UserService';
import UserProfileService from '../../../services/UserProfileService';
//import VideoService from '../services/VideoService';
//import { Line } from 'react-chartjs-2';
//import { Chart, registerables } from 'chart.js';


// Register Chart.js components
//Chart.register(...registerables);

// Mood intensity map for chart
const moodIntensityMap = {
  'excited': 5,
  'happy': 4,
  'content': 3,
  'neutral': 2,
  'tired': 1,
  'anxious': 0,
  'sad': -1,
  'angry': -2
};

// Mood trend colors
const moodTrendConfig = {
  'excited': { label: 'Excited', colorClass: 'yellow-bg' },
  'happy': { label: 'Positive', colorClass: 'green-bg' },
  'content': { label: 'Content', colorClass: 'indigo-bg' },
  'neutral': { label: 'Neutral', colorClass: 'gray-bg' },
  'anxious': { label: 'Anxious', colorClass: 'orange-bg' },
  'tired': { label: 'Tired', colorClass: 'purple-bg' },
  'sad': { label: 'Sad', colorClass: 'blue-bg' },
  'angry': { label: 'Angry', colorClass: 'red-bg' }
};

const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    username: '',
    email: '',
    createdAt: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [moodHistory, setMoodHistory] = useState([]);
  const [activityHistory, setActivityHistory] = useState([]);
  const [watchedVideos, setWatchedVideos] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    journalCount: 0,
    streak: 0,
    lastActivity: '',
    moodTrend: { trend: 'neutral', description: '' }
  });
  const [alertMessage, setAlertMessage] = useState({ type: '', message: '' });
  const [showAlert, setShowAlert] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch current user
        const userService = new UserService();
        const userData = await userService.getCurrentUser();
        if (!userData) {
          window.location.href = '/login';
          return;
        }
        
        // Fetch profile details
        const profileService = new UserProfileService();
        const userProfileData = await profileService.getProfile();
        
        // Format date
        const createdDate = new Date(userProfileData.created_at);
        const formattedDate = createdDate.toLocaleDateString();
        
        setUser({
          ...user,
          username: userProfileData.username,
          email: userProfileData.email,
          createdAt: formattedDate
        });

        // Fetch dashboard stats
        const statsResponse = await profileService.getDashboardStats();
        setDashboardStats(statsResponse);

        // Fetch mood history
        const moodResponse = await profileService.getMoodHistory();
        setMoodHistory(moodResponse.moods);

        // Fetch activity history
        const activityResponse = await profileService.getActivityHistory();
        setActivityHistory(activityResponse);

        // Fetch watched videos
        const videosResponse = await profileService.getWatchedVideos();
        setWatchedVideos(videosResponse);

      } catch (error) {
        console.error('Error fetching user data:', error);
        displayAlert('error', 'Failed to load user profile. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Navigation handler
  const handleNavigation = (path) => {
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

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Display alert message
  const displayAlert = (type, message) => {
    setAlertMessage({ type, message });
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
    }, 5000);
  };

  // Handle profile update
  const handleProfileUpdate = async () => {
    try {
      const profileService = new UserProfileService();
      await profileService.updateProfile({
        email: user.email
      });
      
      displayAlert('success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      displayAlert('error', 'Failed to update profile. Please try again.');
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    // Validate passwords
    if (user.newPassword !== user.confirmPassword) {
      displayAlert('error', 'New passwords do not match!');
      return;
    }

    try {
      const profileService = new UserProfileService();
      await profileService.changePassword({
        currentPassword: user.currentPassword,
        newPassword: user.newPassword
      });
      
      setUser({
        ...user,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      displayAlert('success', 'Password changed successfully!');
    } catch (error) {
      console.error('Error changing password:', error);
      displayAlert('error', 'Failed to change password. Please verify your current password.');
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    try {
      const profileService = new UserProfileService();
      await profileService.deleteAccount();
      window.location.href = '/logout';
    } catch (error) {
      console.error('Error deleting account:', error);
      displayAlert('error', 'Failed to delete account. Please try again.');
    }
    setShowDeleteConfirm(false);
  };

  // Prepare mood chart data
  const prepareMoodData = () => {
    if (!moodHistory || moodHistory.length === 0) {
      return {
        labels: [],
        datasets: [{
          label: 'Mood Intensity',
          data: [],
          fill: false,
          backgroundColor: 'rgba(75,192,192,0.4)',
          borderColor: 'rgba(75,192,192,1)',
        }]
      };
    }

    // Sort by date ascending
    const sortedMoods = [...moodHistory].sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );

    const labels = sortedMoods.map(mood => 
      new Date(mood.timestamp).toLocaleDateString()
    );
    
    const data = sortedMoods.map(mood => 
      mood.intensity !== undefined ? mood.intensity : moodIntensityMap[mood.mood] || 0
    );

    return {
      labels,
      datasets: [{
        label: 'Mood Intensity',
        data,
        fill: false,
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
      }]
    };
  };

  const sidebarItems = [
    {
      icon: <Home className="sidebar-icon" />,
      title: 'Dashboard',
      path: '/dashboard'
    },
    {
      icon: <User className="sidebar-icon" />,
      title: 'Profile',
      path: '/user-profile'
    },
    {
      icon: <BarChart2 className="sidebar-icon" />,
      title: 'Mood Analytics',
      path: '/analytics'
    }
  ];

  const renderActiveTab = () => {
    switch(activeTab) {
      case 'profile':
        return (
          <div className="profile-section">
            <h2 className="section-title">Account Information</h2>
            
            <div className="form-group">
              <label>Username</label>
              <div className="form-input-container">
                <User className="input-icon" />
                <input 
                  type="text" 
                  name="username" 
                  value={user.username} 
                  disabled 
                  className="form-input"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Email</label>
              <div className="form-input-container">
                <Mail className="input-icon" />
                <input 
                  type="email" 
                  name="email" 
                  value={user.email} 
                  onChange={handleInputChange} 
                  className="form-input"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Account Created</label>
              <div className="form-input-container">
                <Calendar className="input-icon" />
                <input 
                  type="text" 
                  value={user.createdAt} 
                  disabled 
                  className="form-input"
                />
              </div>
            </div>
            
            <div className="profile-actions">
              <button 
                className="btn-primary"
                onClick={handleProfileUpdate}
              >
                <Save size={18} />
                Save Changes
              </button>
              
              <button 
                className="btn-danger"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 size={18} />
                Delete Account
              </button>
            </div>
          </div>
        );
        
      case 'security':
        return (
          <div className="security-section">
            <h2 className="section-title">Change Password</h2>
            
            <div className="form-group">
              <label>Current Password</label>
              <div className="form-input-container">
                <Key className="input-icon" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="currentPassword" 
                  value={user.currentPassword} 
                  onChange={handleInputChange} 
                  className="form-input"
                />
                <button 
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <div className="form-group">
              <label>New Password</label>
              <div className="form-input-container">
                <Shield className="input-icon" />
                <input 
                  type={showNewPassword ? "text" : "password"} 
                  name="newPassword" 
                  value={user.newPassword} 
                  onChange={handleInputChange} 
                  className="form-input"
                />
                <button 
                  className="password-toggle"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  type="button"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <div className="form-group">
              <label>Confirm New Password</label>
              <div className="form-input-container">
                <Shield className="input-icon" />
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  name="confirmPassword" 
                  value={user.confirmPassword} 
                  onChange={handleInputChange} 
                  className="form-input"
                />
                <button 
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  type="button"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <div className="profile-actions centered">
              <button 
                className="btn-primary"
                onClick={handlePasswordChange}
                disabled={!user.currentPassword || !user.newPassword || !user.confirmPassword}
              >
                <Save size={18} />
                Change Password
              </button>
            </div>
          </div>
        );
        
      case 'mood':
        return (
          <div className="mood-section">
            <h2 className="section-title">Mood Analytics</h2>
            
            <div className="mood-trend-info">
              <div className={`mood-badge ${moodTrendConfig[dashboardStats.moodTrend.trend]?.colorClass || 'gray-bg'}`}>
                {moodTrendConfig[dashboardStats.moodTrend.trend]?.label || 'Neutral'}
              </div>
              <p className="mood-description">{dashboardStats.moodTrend.description}</p>
            </div>
            
            <div className="chart-container">
              <div
                data={prepareMoodData()} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      title: {
                        display: true,
                        text: 'Mood Intensity'
                      },
                      min: -3,
                      max: 6
                    },
                    x: {
                      title: {
                        display: true,
                        text: 'Date'
                      }
                    }
                  }
                }}
              />
            </div>
            
            <h3 className="subsection-title">Recent Moods</h3>
            <div className="recent-moods-list">
              {moodHistory.slice(0, 5).map((mood, index) => (
                <div key={index} className="mood-card">
                  <div className={`mood-icon ${moodTrendConfig[mood.mood]?.colorClass || 'gray-bg'}`}>
                    {mood.mood.charAt(0).toUpperCase()}
                  </div>
                  <div className="mood-details">
                    <p className="mood-name">{mood.mood}</p>
                    <p className="mood-time">{new Date(mood.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'videos':
        return (
          <div className="videos-section">
            <h2 className="section-title">Watched Videos</h2>
            
            {watchedVideos.length === 0 ? (
              <div className="no-data-message">
                <p>You haven't watched any videos yet.</p>
              </div>
            ) : (
              <div className="videos-grid">
                {watchedVideos.map((video, index) => (
                  <div key={index} className="video-card">
                    <div className="video-thumbnail">
                      <img src={video.thumbnail} alt={video.title} />
                    </div>
                    <div className="video-info">
                      <h3 className="video-title">{video.title}</h3>
                      <p className="video-description">{video.description}</p>
                      <p className="video-watched">Watched on: {new Date(video.watchedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
        
      case 'activity':
        return (
          <div className="activity-section">
            <h2 className="section-title">Activity Overview</h2>
            
            <div className="stats-summary">
              <div className="stat-box pink-bg">
                <BookHeart className="stat-icon" />
                <div className="stat-content">
                  <p className="stat-value">{dashboardStats.journalCount}</p>
                  <p className="stat-title">Journal Entries</p>
                </div>
              </div>
              
              <div className="stat-box yellow-bg">
                <Award className="stat-icon" />
                <div className="stat-content">
                  <p className="stat-value">{dashboardStats.streak}</p>
                  <p className="stat-title">Day Streak</p>
                </div>
              </div>
              
              <div className="stat-box blue-bg">
                <Activity className="stat-icon" />
                <div className="stat-content">
                  <p className="stat-value">{moodHistory.length}</p>
                  <p className="stat-title">Mood Logs</p>
                </div>
              </div>
            </div>
            
            <h3 className="subsection-title">Recent Activity</h3>
            <div className="activity-timeline">
              {activityHistory.length === 0 ? (
                <div className="no-data-message">
                  <p>No recent activity found.</p>
                </div>
              ) : (
                <div className="timeline">
                  {activityHistory.map((activity, index) => (
                    <div key={index} className="timeline-item">
                      <div className="timeline-dot"></div>
                      <div className="timeline-content">
                        <h4 className="activity-type">
                          {activity.activity_type.replace(/_/g, ' ')}
                        </h4>
                        <p className="activity-time">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-layout">
      {/* Mobile Menu Button */}
      <button 
        className="mobile-menu-button"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X /> : <Menu />}
      </button>
      
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="app-title">Happify</h2>
        </div>
        
        <div className="sidebar-user">
          <div className="user-avatar">
            <User className="avatar-icon" />
          </div>
          <div className="user-info">
            <p className="user-name">{user.username}</p>
            <p className="user-role">Member</p>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          {sidebarItems.map((item, index) => (
            <button
              key={index}
              className={`sidebar-nav-item ${window.location.pathname === item.path ? 'active' : ''}`}
              onClick={() => handleNavigation(item.path)}
            >
              {item.icon}
              <span>{item.title}</span>
            </button>
          ))}
        </nav>
        
        <button
          className="sidebar-logout-button"
          onClick={handleLogout}
        >
          <LogOut className="sidebar-icon" />
          <span>Log Out</span>
        </button>
      </div>
      
      {/* Main Content */}
      <div className="profile-main">
        <div className="profile-container">
          {/* Header */}
          <div className="profile-header">
            <button 
              className="back-button"
              onClick={() => handleNavigation('/dashboard')}
            >
              <ChevronLeft />
              Back to Dashboard
            </button>
            <h1 className="profile-title">Your Profile</h1>
          </div>

          {/* Tab Navigation */}
          <div className="profile-tabs">
            <button 
              className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => handleTabChange('profile')}
            >
              <User size={18} />
              <span>Profile</span>
            </button>
            <button 
              className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => handleTabChange('security')}
            >
              <Key size={18} />
              <span>Security</span>
            </button>
            <button 
              className={`tab-button ${activeTab === 'mood' ? 'active' : ''}`}
              onClick={() => handleTabChange('mood')}
            >
              <BarChart2 size={18} />
              <span>Mood</span>
            </button>
            <button 
              className={`tab-button ${activeTab === 'videos' ? 'active' : ''}`}
              onClick={() => handleTabChange('videos')}
            >
              <Library size={18} />
              <span>Videos</span>
            </button>
            <button 
              className={`tab-button ${activeTab === 'activity' ? 'active' : ''}`}
              onClick={() => handleTabChange('activity')}
            >
              <Activity size={18} />
              <span>Activity</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {renderActiveTab()}
          </div>
        </div>
      </div>

      {/* Alert Message */}
      {showAlert && (
        <div className={`alert-message ${alertMessage.type}`}>
          <p>{alertMessage.message}</p>
        </div>
      )}

      {/* Delete Account Confirmation */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Delete Account</h2>
            <p>Are you sure you want to delete your account? This action cannot be undone.</p>
            <div className="modal-actions">
              <button 
                className="btn-secondary"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-danger"
                onClick={handleDeleteAccount}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;