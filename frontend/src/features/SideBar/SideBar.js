import React from 'react';
import { useNavigate, useLocation } from 'react-router';
import { 
  Brain, Music, Dumbbell, BookHeart, 
  Quote, Laugh, Home, LogOut, User, BarChart2
} from 'lucide-react';
import UserService from '../../services/UserService';
import './SideBar.css';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation handler
  const handleNavigation = (path) => {
    console.log(`Navigating to: ${path}`);
    navigate(path);
    if (window.innerWidth <= 768) {
      setIsOpen(false);
    }
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

  // Sidebar navigation items
  const sidebarItems = [
    {
      icon: <Home className="sidebar-icon" />,
      title: 'Dashboard',
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
      icon: <Dumbbell className="sidebar-icon" />,
      title: 'Exercise',
      path: '/exercise'
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

  return (
    <div className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-header">
        <Laugh className="avatar-icon"/>
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
  );
};

export default Sidebar;