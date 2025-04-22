import { useNavigate } from 'react-router';
import { Heart, Brain, BookHeart, Music, Video } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const Main = () => {
  // State and refs setup
  const navigate = useNavigate();
  const [emojiIndex, setEmojiIndex] = useState(0);
  const [floating, setFloating] = useState([]);
  const [backgroundMood, setBackgroundMood] = useState(0);
  
  // Array of calming and happy emojis to rotate through
  const emojis = ['😊', '😌', '🥰', '😇', '🧘', '✨', '🌿', '💆', '🌸', '🌼', '🌞', '🌠', '💙', '☁️', '🦋'];
  
  // Rotate through emojis periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setEmojiIndex((prevIndex) => (prevIndex + 1) % emojis.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Change background mood periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setBackgroundMood((prevMood) => (prevMood + 1) % 5);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Create occasional floating emojis
  useEffect(() => {
    const interval = setInterval(() => {
      addFloatingEmoji();
    }, 2000);
    return () => clearInterval(interval);
  }, []);
  
  // Create floating emoji effect with calming emojis - improved animation
  const addFloatingEmoji = (isExplosion = false) => {
    // Happy smiling emojis focused on relaxation and joy - brighter colors preferred
    const happyEmojis = ['😊', '😄', '😁', '😀', '🙂', '😌', '🥰', '😇', '😂', '😆', '🤗', '😃', '😋', '🤭', '😺', '😸', '🌟', '⭐', '✨', '🌈', '💫'];
    const emoji = happyEmojis[Math.floor(Math.random() * happyEmojis.length)];
    
    // Position differently based on explosion or normal floating
    const left = isExplosion 
      ? 10 + Math.random() * 80 // More concentrated for explosion
      : 5 + Math.random() * 90; // Full width coverage
    
    // Random starting position from bottom of screen
    const bottom = isExplosion 
      ? -20 + Math.random() * 10 // Slightly below viewport for explosion
      : -10 + Math.random() * 5; // Just below viewport for regular
    
    // Size varies more during explosion
    const size = isExplosion 
      ? 2.2 + Math.random() * 1.8 // Even larger for explosion
      : 1.5 + Math.random() * 1.0; // Larger than before for visibility
    
    // Random rotation for more dynamic appearance
    const rotation = Math.random() * 360;
    
    const id = Date.now() + Math.random();
    
    setFloating(prev => [...prev, { 
      id, 
      emoji, 
      left, 
      bottom,
      size, 
      rotation,
      isExplosion 
    }]);
    
    // Remove emoji after animation completes
    setTimeout(() => {
      setFloating(prev => prev.filter(item => item.id !== id));
    }, isExplosion ? 4000 : 7000);
  };
  
  // Handler for primary button click
  const handlePrimaryButtonClick = () => {
    navigate('/dashboard');
  };
  
  return (
    <div 
      className="page-container relative min-h-screen transition-all duration-1000"
      style={{ 
        background: [
          'linear-gradient(to bottom, rgba(249,249,255,0.85), rgba(240,248,255,0.85))',
          'linear-gradient(to bottom, rgba(240,248,255,0.85), rgba(245,245,253,0.85))',
          'linear-gradient(to bottom, rgba(245,240,255,0.85), rgba(248,248,255,0.85))',
          'linear-gradient(to bottom, rgba(240,250,255,0.85), rgba(245,245,255,0.85))',
          'linear-gradient(to bottom, rgba(248,245,255,0.85), rgba(240,248,255,0.85))'
        ][backgroundMood]
      }}
    >
      {/* Background layer */}
      <div className="fixed inset-0 z-5 bg-emoji-pattern opacity-10"></div>
      
      {/* Emoji Container - Fixed positioning to avoid affecting layout */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
        {/* Floating Emojis with improved animation */}
        {floating.map((item) => (
          <div
            key={item.id}
            className={`absolute ${item.isExplosion ? 'animate-explosion-vertical' : 'animate-float-vertical'}`}
            style={{ 
              left: `${item.left}%`,
              bottom: `${item.bottom}%`,
              fontSize: `${item.size}rem`,
              transform: `rotate(${item.rotation}deg)`,
              animationDuration: item.isExplosion ? `${2 + Math.random() * 1.5}s` : `${6 + Math.random() * 4}s`,
              opacity: item.isExplosion ? 1 : 1, // Full opacity for all emojis
              textShadow: "0px 0px 8px rgba(0,0,0,0.25), 0px 0px 3px rgba(255,255,255,0.9)", // Enhanced shadow for better contrast
              filter: "drop-shadow(0 0 2px rgba(255,255,255,0.8))", // Additional glow effect
              zIndex: item.isExplosion ? 20 : 10,
              willChange: "transform, opacity" // Performance optimization
            }}
          >
            {item.emoji}
          </div>
        ))}
      </div>
      
      {/* Hero Section */}
      <section className="hero-section relative z-20">
        <div className="hero-content">
          <h1 className="hero-title flex items-center justify-center text-indigo-900">
            Your Mental Health Companion
            <span className="ml-2 text-3xl animate-gentle-pulse">{emojis[emojiIndex]}</span>
          </h1>
          <div className="flex justify-center space-x-2 my-2">
            <span className="text-xl animate-gentle-bounce delay-100">😊</span>
            <span className="text-xl animate-gentle-float delay-200">🌸</span>
            <span className="text-xl animate-gentle-pulse delay-300">✨</span>
            <span className="text-xl animate-gentle-bounce delay-400">💙</span>
          </div>
          <p className="hero-subtitle">
            A safe space for your mental wellbeing journey
          </p>
          <span 
            className="primary-button inline-flex items-center cursor-pointer" 
            onClick={handlePrimaryButtonClick}
          >
            Start Your Journey
            <Heart 
              size={25} 
              className="ml-2 animate-heartbeat" 
            />
          </span>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section relative z-20">
        <div className="features-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<Brain size={32} color="#7C3AED" className="animate-gentle-pulse" />}
            emoji="😌"
            title="Mood Tracking"
            description="Track your daily moods and identify patterns in your emotional wellbeing"
            onHover={addFloatingEmoji}
          />
          <FeatureCard
            icon={<BookHeart size={32} color="#7C3AED" className="animate-gentle-bounce" />}
            emoji="🧘"
            title="Journal"
            description="Express your thoughts and feelings in a private, secure space"
            onHover={addFloatingEmoji}
          />
          <FeatureCard
            icon={<Music size={32} color="#7C3AED" className="animate-gentle-wiggle" />}
            emoji="🦋"
            title="Calming Music"
            description="Access a curated collection of soothing music and meditation tracks"
            onHover={addFloatingEmoji}
          />
          <FeatureCard
            icon={<Video size={32} color="#7C3AED" className="animate-gentle-spin" />}
            emoji="💆"
            title="Resources"
            description="Discover videos, articles, and exercises for mental wellness"
            onHover={addFloatingEmoji}
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section relative z-20">
        <div className="cta-container">
          <Heart 
            size={48} 
            color="#7C3AED" 
            className="mx-auto mb-6 animate-gentle-heartbeat cursor-pointer" 
            onClick={() => addFloatingEmoji(true)}
          />
          <h2 className="cta-title">Your Wellbeing Matters</h2>
          <p className="cta-description flex items-center justify-center">
            <span className="animate-gentle-bounce inline-flex mx-1">🥗</span> 
            Eat Well 
            <span className="animate-gentle-pulse inline-flex mx-1">😴</span> 
            Rest 
            <span className="animate-gentle-float inline-flex mx-1">🧘</span> 
            Breathe
          </p>
          <div className="flex justify-center my-4">
            <button 
              className="py-3 px-6 bg-purple-100 hover:bg-purple-200 rounded-full text-xl transition-all transform hover:scale-105 shadow-sm"
              onClick={() => addFloatingEmoji(true)}
            >
              Brighten Your Day! 😄✨
            </button>
          </div>
        </div>
      </section>

      <style jsx>{`
        /* New vertical floating animation from bottom to top */
        @keyframes float-vertical {
          0% { 
            transform: translateY(0) rotate(0deg) scale(0.7); 
            opacity: 0; 
          }
          15% {
            opacity: 1;
            transform: translateY(-15vh) rotate(5deg) scale(1);
          }
          85% {
            opacity: 1;
            transform: translateY(-85vh) rotate(10deg) scale(1);
          }
          100% { 
            transform: translateY(-100vh) rotate(15deg) scale(0.9); 
            opacity: 0; 
          }
        }
        
        /* New vertical explosion animation from bottom to top */
        @keyframes explosion-vertical {
          0% { 
            transform: translateY(0) scale(0.5) rotate(0deg); 
            opacity: 0; 
          }
          20% { 
            transform: translateY(-20vh) scale(1.8) rotate(10deg); 
            opacity: 1; 
          }
          80% {
            opacity: 1;
            transform: translateY(-80vh) scale(1.2) rotate(20deg);
          }
          100% { 
            transform: translateY(-100vh) scale(0.9) rotate(30deg); 
            opacity: 0; 
          }
        }
        
        @keyframes gentle-float {
          0% { transform: translateY(0); opacity: 0.9; }
          50% { transform: translateY(-10px); opacity: 1; }
          100% { transform: translateY(0); opacity: 0.9; }
        }
        
        @keyframes heartbeat {
          0% { transform: scale(1); }
          25% { transform: scale(1.1); }
          50% { transform: scale(1); }
          75% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        
        @keyframes gentle-heartbeat {
          0% { transform: scale(1); }
          50% { transform: scale(1.07); }
          100% { transform: scale(1); }
        }
        
        @keyframes gentle-wiggle {
          0% { transform: rotate(-2deg); }
          50% { transform: rotate(2deg); }
          100% { transform: rotate(-2deg); }
        }
        
        @keyframes gentle-pulse {
          0% { opacity: 0.8; }
          50% { opacity: 1; }
          100% { opacity: 0.8; }
        }
        
        @keyframes gentle-bounce {
          0% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
          100% { transform: translateY(0); }
        }
        
        .bg-emoji-pattern {
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        
        .animate-float-vertical {
          animation: float-vertical 7s ease-out forwards;
        }
        
        .animate-explosion-vertical {
          animation: explosion-vertical 4s ease-out forwards;
        }
        
        .animate-gentle-float {
          animation: gentle-float 3s ease-in-out infinite;
        }
        
        .animate-heartbeat {
          animation: heartbeat 1.5s infinite;
        }
        
        .animate-gentle-heartbeat {
          animation: gentle-heartbeat 2s infinite;
        }
        
        .animate-gentle-wiggle {
          animation: gentle-wiggle 3s infinite;
        }
        
        .animate-gentle-spin {
          animation: spin-slow 12s linear infinite;
        }
        
        .animate-gentle-pulse {
          animation: gentle-pulse 3s ease-in-out infinite;
        }
        
        .animate-gentle-bounce {
          animation: gentle-bounce 3s ease-in-out infinite;
        }
        
        .page-container {
          position: relative;
          overflow-x: hidden;
        }
        
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, redirect, emoji, onHover }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (redirect) {
      navigate(redirect);
    }
    if (onHover) {
      onHover();
    }
  };

  return (
    <div 
      className="feature-card relative" 
      onClick={handleClick}
      onMouseEnter={onHover}
    >
      <div className="feature-icon">{icon}</div>
      <h3 className="feature-title flex items-center">
        {title}
        <span className="ml-2 text-xl animate-gentle-pulse">{emoji}</span>
      </h3>
      <p className="feature-description">{description}</p>
    </div>
  );
};

export default Main;