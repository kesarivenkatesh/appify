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
  
  // Sidebar navigation items with specific colors for each
  const sidebarItems = [
    {
      icon: <Home className="sidebar-icon" />,
      title: 'Dashboard',
      path: '/dashboard',
      colorClass: 'blue-item'
    },
    {
      icon: <BookHeart className="sidebar-icon" />,
      title: 'Journal',
      path: '/journal',
      colorClass: 'pink-item'
    },
    {
      icon: <Brain className="sidebar-icon" />,
      title: 'Meditation',
      path: '/meditation',
      colorClass: 'purple-item'
    },
    {
      icon: <Music className="sidebar-icon" />,
      title: 'Calming Music',
      path: '/music',
      colorClass: 'indigo-item'
    },
    {
      icon: <Quote className="sidebar-icon" />,
      title: 'Motivation',
      path: '/motivation',
      colorClass: 'orange-item'
    },
    {
      icon: <Laugh className="sidebar-icon" />,
      title: 'Laugh Out Loud',
      path: '/laughoutloud',
      colorClass: 'rose-item'
    },
    {
      icon: <Dumbbell className="sidebar-icon" />,
      title: 'Exercise',
      path: '/exercise',
      colorClass: 'green-item'
    },
    {
      icon: <BarChart2 className="sidebar-icon" />,
      title: 'Mood Analytics',
      path: '/mood-analytics',
      colorClass: 'yellow-item'
    },
    {
      icon: <User className="sidebar-icon" />,
      title: 'Profile',
      path: '/user-profile',
      colorClass: 'gray-item'
    }
  ];
  
  return (
    <div className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-header">
        <div className="logo-circle">
          <Laugh className="logo-icon"/>
        </div>
        <h2 className="app-title">Happify</h2>
      </div>
      
      <nav className="sidebar-nav">
        {sidebarItems.map((item, index) => (
          <button
            key={index}
            className={`sidebar-nav-item ${location.pathname === item.path ? 'active' : ''} ${item.colorClass}`}
            onClick={() => handleNavigation(item.path)}
          >
            <div className={`icon-circle ${item.colorClass}`}>
              {item.icon}
            </div>
            <span className="nav-text">{item.title}</span>
          </button>
        ))}
      </nav>
      
      {/* Logout button at the end of sidebar */}
      <button
        className="sidebar-logout-button"
        onClick={handleLogout}
      >
        <div className="icon-circle red-item">
          <LogOut className="sidebar-icon" />
        </div>
        <span className="nav-text">Log Out</span>
      </button>
      <div className="mt-6 text-center text-indigo-300 text-sm">
            © 2025 Happify. All rights reserved.
          </div>
    </div>
    
  );
};

export default Sidebar;