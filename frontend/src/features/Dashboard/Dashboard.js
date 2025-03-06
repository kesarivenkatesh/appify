import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { 
  Smile, Brain, Music, Dumbbell, BookHeart, 
  TrendingUp, Calendar, Award, Clock, Quote 
} from 'lucide-react';
import UserService from '../../services/UserService';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState('');
  const [stats, setStats] = useState({
    totalJournalEntries: 0,
    lastMood: 'neutral',
    streak: 7,
    lastActivity: '2 hours ago'
  });
  
  useEffect(() => {
    const fetchUser = async () => {
      const userData = await new UserService().getCurrentUser();
      if (userData) {
        setUser(userData);
      } else {
        // Redirect to login if not authenticated
        window.location.href = '/login';
      }
    };
    
    fetchUser();
  }, []);

   // Updated navigation handler to enable navigation
   const handleNavigation = (path) => {
    console.log(`Navigating to: ${path}`);
    navigate(path);
  };

  const statsDisplay = [
    {
      icon: <BookHeart className="icon pink" />,
      title: 'Journal Entries',
      value: stats.totalJournalEntries,
      colorClass: 'pink-bg'
    },
    {
      icon: <TrendingUp className="icon purple" />,
      title: 'Mood Trend',
      value: 'Positive',
      colorClass: 'purple-bg'
    },
    {
      icon: <Award className="icon yellow" />,
      title: 'Current Streak',
      value: `${stats.streak} days`,
      colorClass: 'yellow-bg'
    },
    {
      icon: <Clock className="icon blue" />,
      title: 'Last Activity',
      value: stats.lastActivity,
      colorClass: 'blue-bg'
    },
  ];


  const quickActions = [
    {
      icon: <Smile className="icon yellow" />,
      title: 'Mood Check',
      description: 'How are you feeling today?',
      //path: '/mood',
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
      //path: '/music',
      colorClass: 'purple-bg'
    },
    {
      icon: <Brain className="icon blue" />,
      title: 'Meditation',
      description: 'Clear your mind',
      //path: '/meditation',
      colorClass: 'blue-bg'
    },
    {
      icon: <Dumbbell className="icon green" />,
      title: 'Exercise',
      description: 'Stay active',
      //path: '/exercise',
      colorClass: 'green-bg'
    },
    // New Quotes Action
    {
      icon: <Quote className="icon orange" />,
      title: 'Inspirational Quotes',
      description: 'Get daily motivation',
      //path: '/quotes',
      colorClass: 'orange-bg'
    }
  ];

  // ... rest of the statsDisplay array and other code remains the same ...

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <h1 className="dashboard-title">
            {console.log(user)}
            Welcome back{user.username!==undefined? `, ${user.username}` : ''}!
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