import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router';
import { Menu, X } from 'lucide-react';
import Sidebar from '../features/SideBar/SideBar';
import './MainLayout.css';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Set sidebar open by default on large screens, closed on mobile
  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth > 768);
    };
    
    // Set initial state
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="main-layout">
      {/* Mobile Menu Button */}
      <button 
        className="mobile-menu-button"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X /> : <Menu />}
      </button>
      
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      {/* Main Content */}
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;