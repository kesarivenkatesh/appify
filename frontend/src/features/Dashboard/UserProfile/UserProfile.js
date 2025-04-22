// UserProfile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { 
  User, Mail, Key, BarChart2, Activity,
  Home, LogOut, Menu, X, Clock, Library, BookHeart, Calendar, Save,
  Shield, Trash2, Eye, EyeOff, ChevronLeft, Award
} from 'lucide-react';
import UserService from '../../../services/UserService';
import UserProfileService from '../../../services/UserProfileService';
import './UserProfile.css';

// Debug function to log date processing
const debugDate = (context, dateStr, processed) => {
  console.log(`[${context}] Original: ${dateStr} → Processed: ${processed}`);
};

// Helper to format date strings - preserves original date
const formatDateDisplay = (dateStr, includeTime = false) => {
  // If no date provided, show "Not available" instead of today's date
  if (!dateStr) {
    return "Not available";
  }

  try {
    // Try to parse the date string
    const date = new Date(dateStr);
    
    // Check if we have a valid date
    if (isNaN(date.getTime())) {
      return "Not available";
    }

    // Format with time if requested
    return includeTime 
      ? date.toLocaleString() 
      : date.toLocaleDateString();
  } catch (error) {
    console.error("Date formatting error:", error);
    // Return "Not available" instead of today's date
    return "Not available";
  }
};

// Function to format date for chart labels - preserves original date
const formatChartDate = (dateStr) => {
  if (!dateStr) return "Not available";
  
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "Not available";
    
    // Format as "MMM D" (e.g., Jan 15)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error("Chart date formatting error:", error);
    return "Not available";
  }
};

// Generate mock data if needed (for development/testing)
const generateMockData = () => {
  // Generate dates for the last 7 days
  const mockMoods = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    mockMoods.push({
      mood: ['happy', 'content', 'excited', 'neutral', 'sad'][Math.floor(Math.random() * 5)],
      timestamp: date.toISOString(),
    });
  }
  return mockMoods;
};

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

// Mood trend colors - aligned with dashboard
const moodTrendConfig = {
  'excited': { label: 'Excited', colorClass: 'excited-bg', color: '#FFD54F' },
  'happy': { label: 'Positive', colorClass: 'happy-bg', color: '#66BB6A' },
  'content': { label: 'Content', colorClass: 'content-bg', color: '#7986CB' },
  'neutral': { label: 'Neutral', colorClass: 'neutral-bg', color: '#BDBDBD' },
  'anxious': { label: 'Anxious', colorClass: 'anxious-bg', color: '#FFB74D' },
  'tired': { label: 'Tired', colorClass: 'tired-bg', color: '#9575CD' },
  'sad': { label: 'Sad', colorClass: 'sad-bg', color: '#64B5F6' },
  'angry': { label: 'Angry', colorClass: 'angry-bg', color: '#EF5350' }
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
  const [useMockData, setUseMockData] = useState(false); // For development testing
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch current user
        const userService = new UserService();
        const userData = await userService.getCurrentUser();
        if (!userData) {
          navigate('/login');
          return;
        }
        
        // Fetch profile details
        const profileService = new UserProfileService();
        const userProfileData = await profileService.getProfile();
        
        console.log("Profile data:", userProfileData);
        
        // Format date - preserve original date
        const formattedDate = formatDateDisplay(userProfileData?.created_at);
        debugDate("User created_at", userProfileData?.created_at, formattedDate);
        
        setUser({
          ...user,
          username: userProfileData?.username || 'User',
          email: userProfileData?.email || '',
          createdAt: formattedDate
        });

        // Fetch dashboard stats
        const statsResponse = await profileService.getDashboardStats();
        console.log("Dashboard stats:", statsResponse);
        
        setDashboardStats(statsResponse || {
          journalCount: 0,
          streak: 0,
          lastActivity: '',
          moodTrend: { trend: 'neutral', description: 'Your mood has been mostly neutral' }
        });

        // Fetch mood history
        try {
          const moodResponse = await profileService.getMoodHistory();
          console.log("Mood history:", moodResponse);
          
          // Determine the correct structure of the mood data
          let moodsArray = [];
          
          if (moodResponse) {
            if (moodResponse.moods && Array.isArray(moodResponse.moods)) {
              moodsArray = moodResponse.moods;
            } else if (Array.isArray(moodResponse)) {
              moodsArray = moodResponse;
            }
          }
          
          // Use mock data if no real data is available and in development mode
          if (moodsArray.length === 0 && useMockData) {
            moodsArray = generateMockData();
            console.log("Using mock mood data:", moodsArray);
          }
          
          // Process timestamps for all mood entries - PRESERVE ORIGINAL DATES
          const processedMoods = moodsArray.map(mood => {
            const dateDisplay = formatDateDisplay(mood.timestamp, true);
            debugDate("Mood timestamp", mood.timestamp, dateDisplay);
            
            return {
              ...mood,
              formattedDate: dateDisplay // Don't default to today's date
            };
          });
          
          setMoodHistory(processedMoods);
        } catch (error) {
          console.error("Error processing mood history:", error);
          setMoodHistory([]);
        }

        // Fetch activity history
        try {
          const activityResponse = await profileService.getActivityHistory();
          console.log("Activity history:", activityResponse);
          
          const activities = Array.isArray(activityResponse) ? activityResponse : [];
          
          // Process activity timestamps - PRESERVE ORIGINAL DATES
          const processedActivities = activities.map(activity => {
            const dateDisplay = formatDateDisplay(activity.timestamp, true);
            debugDate("Activity timestamp", activity.timestamp, dateDisplay);
            
            return {
              ...activity,
              formattedDate: dateDisplay // Don't default to today's date
            };
          });
          
          setActivityHistory(processedActivities);
        } catch (error) {
          console.error("Error processing activity history:", error);
          setActivityHistory([]);
        }

        // Fetch watched videos
        try {
          const videosResponse = await profileService.getWatchedVideos();
          console.log("Videos watched:", videosResponse);
          
          const videos = Array.isArray(videosResponse) ? videosResponse : [];
          
          // Process video timestamps - PRESERVE ORIGINAL DATES
          const processedVideos = videos.map(video => {
            const dateDisplay = formatDateDisplay(video.watchedAt);
            debugDate("Video watchedAt", video.watchedAt, dateDisplay);
            
            return {
              ...video,
              formattedDate: dateDisplay // Don't default to today's date
            };
          });
          
          setWatchedVideos(processedVideos);
        } catch (error) {
          console.error("Error processing watched videos:", error);
          setWatchedVideos([]);
        }

      } catch (error) {
        console.error('Error fetching user data:', error);
        displayAlert('error', 'Failed to load user profile. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate, useMockData]);

  // Navigation handler
  const handleNavigation = (path) => {
    navigate(path);
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await new UserService().logout();
      navigate('/login');
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
      navigate('/logout');
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
          colors: [],
        }]
      };
    }

    // Sort by date ascending - handle invalid dates properly
    const sortedMoods = [...moodHistory].sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      
      // If either date is invalid, it goes to the end of the list
      if (isNaN(dateA.getTime())) return 1;
      if (isNaN(dateB.getTime())) return -1;
      
      return dateA - dateB;
    });

    // Get the last 7 moods to display
    const recentMoods = sortedMoods.slice(-7);

    const labels = recentMoods.map(mood => formatChartDate(mood.timestamp));
    
    const data = recentMoods.map(mood => 
      mood.intensity !== undefined ? mood.intensity : moodIntensityMap[mood.mood] || 0
    );
    
    const colors = recentMoods.map(mood => getMoodColor(
      mood.intensity !== undefined ? mood.intensity : moodIntensityMap[mood.mood] || 0
    ));

    return {
      labels,
      datasets: [{
        label: 'Mood Intensity',
        data,
        colors,
      }]
    };
  };
  
  // Helper to get mood color based on intensity
  const getMoodColor = (intensity) => {
    if (intensity >= 4) return moodTrendConfig.excited.color;
    if (intensity >= 3) return moodTrendConfig.happy.color;
    if (intensity >= 1) return moodTrendConfig.content.color;
    if (intensity >= -1) return moodTrendConfig.neutral.color;
    return moodTrendConfig.sad.color;
  };

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
              <div className={`mood-badge ${moodTrendConfig[dashboardStats.moodTrend?.trend]?.colorClass || 'neutral-bg'}`}>
                {moodTrendConfig[dashboardStats.moodTrend?.trend]?.label || 'Neutral'}
              </div>
              <p className="mood-description">{dashboardStats.moodTrend?.description || 'Your mood has been mostly neutral'}</p>
            </div>
            
            <div className="chart-container">
              <h3 className="chart-title">Mood Intensity Over Time</h3>
              <div className="dashboard-mood-chart">
                {prepareMoodData().datasets[0].data.length > 0 ? (
                  <>
                    <div className="chart-bars">
                      {prepareMoodData().datasets[0].data.map((value, index) => (
                        <div className="chart-bar-column" key={index}>
                          <div className="mood-value-label">{value > 0 ? `+${value}` : value}</div>
                          <div 
                            className="mood-bar" 
                            style={{
                              height: `${Math.max(20, (value + 3) * 20)}px`,
                              backgroundColor: prepareMoodData().datasets[0].colors[index]
                            }}
                          ></div>
                          <div className="date-label">{prepareMoodData().labels[index]}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mood-legend">
                      <div className="legend-item">
                        <span className="legend-color" style={{backgroundColor: moodTrendConfig.excited.color}}></span>
                        <span>Excited (+5)</span>
                      </div>
                      <div className="legend-item">
                        <span className="legend-color" style={{backgroundColor: moodTrendConfig.happy.color}}></span>
                        <span>Happy (+4)</span>
                      </div>
                      <div className="legend-item">
                        <span className="legend-color" style={{backgroundColor: moodTrendConfig.neutral.color}}></span>
                        <span>Neutral (+2)</span>
                      </div>
                      <div className="legend-item">
                        <span className="legend-color" style={{backgroundColor: moodTrendConfig.sad.color}}></span>
                        <span>Sad (-1)</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="no-data-message">
                    <p>No mood data available yet. Start tracking your mood to see analytics.</p>
                  </div>
                )}
              </div>
            </div>
            
            <h3 className="subsection-title">Recent Moods</h3>
            <div className="recent-moods-list">
              {moodHistory.length > 0 ? (
                moodHistory.slice(0, 5).map((mood, index) => (
                  <div key={index} className="mood-card">
                    <div className={`mood-icon ${moodTrendConfig[mood.mood]?.colorClass || 'neutral-bg'}`}>
                      {mood.mood ? mood.mood.charAt(0).toUpperCase() : 'N'}
                    </div>
                    <div className="mood-details">
                      <p className="mood-name">{mood.mood || 'Neutral'}</p>
                      <p className="mood-time">
                        {/* Use the original timestamp with no fallback to today's date */}
                        {mood.formattedDate || "Not available"}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data-message">
                  <p>No mood data available yet.</p>
                </div>
              )}
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
                      <img src={video.thumbnail || '/assets/placeholder-thumbnail.jpg'} alt={video.title} />
                    </div>
                    <div className="video-info">
                      <h3 className="video-title">{video.title}</h3>
                      <p className="video-description">{video.description}</p>
                      <p className="video-watched">Watched on: {
                        /* Use the original timestamp with no fallback to today's date */
                        video.formattedDate || "Not available"
                      }</p>
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
              <div className="stat-box stat-journal">
                <BookHeart className="stat-icon" />
                <div className="stat-content">
                  <p className="stat-value">{dashboardStats.journalCount}</p>
                  <p className="stat-title">Journal Entries</p>
                </div>
              </div>
              
              <div className="stat-box stat-streak">
                <Award className="stat-icon" />
                <div className="stat-content">
                  <p className="stat-value">{dashboardStats.streak}</p>
                  <p className="stat-title">Day Streak</p>
                </div>
              </div>
              
              <div className="stat-box stat-mood">
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
                          {activity.activity_type ? activity.activity_type.replace(/_/g, ' ') : 'Activity'}
                        </h4>
                        <p className="activity-time">
                          {/* Use the original timestamp with no fallback to today's date */}
                          {activity.formattedDate || "Not available"}
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
    <div className="dashboard-layout">
      {/* Left Sidebar */}
      <div className="dashboard-sidebar">
        <div className="app-brand">
          <h1 className="app-logo">Happify</h1>
        </div>
        
        <div className="user-profile-mini">
          <div className="user-avatar">
            <User />
          </div>
          <div className="user-info-mini">
            <div className="username">{user.username}</div>
            <div className="user-role">Member</div>
          </div>
        </div>
        
        <nav className="dashboard-nav">
          <button
            className="nav-item"
            onClick={() => handleNavigation('/dashboard')}
          >
            <Home size={20} />
            <span>Dashboard</span>
          </button>
          
          <button
            className="nav-item active"
            onClick={() => handleNavigation('/user-profile')}
          >
            <User size={20} />
            <span>Profile</span>
          </button>
          
          <button
            className="nav-item"
            onClick={() => handleNavigation('/analytics')}
          >
            <BarChart2 size={20} />
            <span>Mood Analytics</span>
          </button>
        </nav>
        
        <button className="logout-button" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Log Out</span>
        </button>
      </div>
      
      {/* Main Content */}
      <div className="dashboard-content">
        <div className="profile-header-tabs">
          <button 
            className={`profile-tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => handleTabChange('profile')}
          >
            <User size={20} />
            <span>Profile</span>
          </button>
          
          <button 
            className={`profile-tab ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => handleTabChange('security')}
          >
            <Key size={20} />
            <span>Security</span>
          </button>
          
          <button 
            className={`profile-tab ${activeTab === 'mood' ? 'active' : ''}`}
            onClick={() => handleTabChange('mood')}
          >
            <BarChart2 size={20} />
            <span>Mood</span>
          </button>
          
          <button 
            className={`profile-tab ${activeTab === 'videos' ? 'active' : ''}`}
            onClick={() => handleTabChange('videos')}
          >
            <Library size={20} />
            <span>Videos</span>
          </button>
          
          <button 
            className={`profile-tab ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => handleTabChange('activity')}
          >
            <Activity size={20} />
            <span>Activity</span>
          </button>
        </div>
        
        {/* Tab Content */}
        <div className="profile-content">
          {renderActiveTab()}
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