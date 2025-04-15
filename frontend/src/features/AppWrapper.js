// AppWrapper.js - Wrap your application to include emoji animations on all pages
import React, { useState } from 'react';
import EmojiAnimation from './EmojiAnimation.js';

// Custom event emitter for triggering emoji explosions from anywhere in the app
export const emojiEventEmitter = {
  _listeners: {},
  
  addEventListener(event, callback) {
    if (!this._listeners[event]) {
      this._listeners[event] = [];
    }
    this._listeners[event].push(callback);
  },
  
  removeEventListener(event, callback) {
    if (!this._listeners[event]) return;
    this._listeners[event] = this._listeners[event].filter(cb => cb !== callback);
  },
  
  emit(event, ...args) {
    if (!this._listeners[event]) return;
    this._listeners[event].forEach(callback => callback(...args));
  }
};

// Function to trigger emoji explosion from anywhere in the application
export const triggerEmojiExplosion = () => {
  emojiEventEmitter.emit('triggerExplosion');
};

const AppWrapper = ({ children }) => {
  const [explosionTrigger, setExplosionTrigger] = useState(false);
  
  // Listen for emoji explosion events
  React.useEffect(() => {
    const handleExplosion = () => {
      setExplosionTrigger(prev => !prev); // Toggle to trigger a new explosion
    };
    
    emojiEventEmitter.addEventListener('triggerExplosion', handleExplosion);
    
    return () => {
      emojiEventEmitter.removeEventListener('triggerExplosion', handleExplosion);
    };
  }, []);
  
  // Handle explosion completion
  const handleExplosionComplete = () => {
    // Nothing to do here, but could be used for callbacks
  };

  return (
    <div className="app-wrapper relative min-h-screen">
      {/* Semi-transparent background for better emoji visibility */}
      <div className="fixed inset-0 z-0 bg-opacity-75" 
           style={{ 
             background: 'linear-gradient(to bottom, rgba(249,249,255,0.75), rgba(240,248,255,0.75))'
           }} 
      />
      
      {/* Emoji animation layer */}
      <EmojiAnimation 
        triggerExplosion={explosionTrigger} 
        onExplosionComplete={handleExplosionComplete}
      />
      
      {/* Main content */}
      <div className="relative z-20">
        {children}
      </div>
    </div>
  );
};

export default AppWrapper;