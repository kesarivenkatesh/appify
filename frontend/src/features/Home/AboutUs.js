import { useState, useEffect } from 'react';
import { 
  Heart, Brain, BookHeart, Music, 
  Video, Users, Award, Star, 
  Coffee, Bookmark, Mail, Laugh
} from 'lucide-react';

const AboutUs = () => {
  // State setup
  const [emojiIndex, setEmojiIndex] = useState(0);
  const [backgroundMood, setBackgroundMood] = useState(0);
  
  // Array of calming and happy emojis to rotate through
  const emojis = ['😊', '😌', '🥰', '😇', '🧘', '🌈', '✨', '🌿', '💆', '🌸', '🌼', '🌞', '🌠', '💙', '☁️', '🦋'];
  
  // Change emoji every 3 seconds for a more relaxing pace
  useEffect(() => {
    const interval = setInterval(() => {
      setEmojiIndex((prevIndex) => (prevIndex + 1) % emojis.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [emojis.length]);
  
  // Background mood gradient that slowly changes
  useEffect(() => {
    const interval = setInterval(() => {
      setBackgroundMood((prev) => (prev + 1) % 5);
    }, 8000);
    
    return () => clearInterval(interval);
  }, []);

  // Navigation handler without react-router
  const handleNavigation = (path) => {
    // Using window.location for navigation
    window.location.href = path;
  };

  // Team data
  const teamMembers = [
    {
      id: 1,
      name: "Dr. James Wilson",
      avatar: "👨‍⚕️",
      role: "Chief Psychology Officer",
      bio: "With over 15 years of clinical experience, Dr. Wilson leads our psychological approach to wellness."
    },
    {
      id: 2,
      name: "Emily Chang",
      avatar: "👩‍💻",
      role: "Lead Developer",
      bio: "Emily has a passion for creating intuitive, accessible applications that make a positive impact."
    },
    {
      id: 3,
      name: "Dr. Maya Patel",
      avatar: "🧠",
      role: "Mindfulness Expert",
      bio: "Dr. Patel combines traditional mindfulness practices with modern psychology to create our meditation content."
    },
    {
      id: 4,
      name: "Thomas Rodriguez",
      avatar: "🎵",
      role: "Music Therapist",
      bio: "Thomas curates our calming music collection and develops sound-based therapy approaches."
    },
    {
      id: 5,
      name: "Sarah Johnson",
      avatar: "📊",
      role: "Data Scientist",
      bio: "Sarah works behind the scenes to improve our mood tracking algorithms and personalization features."
    },
    {
      id: 6,
      name: "David Kim",
      avatar: "🎨",
      role: "UI/UX Designer",
      bio: "David ensures that every interaction with Happify is intuitive, calming, and delightful."
    }
  ];

  return (
    <div 
      className="page-container relative min-h-screen pt-16 overflow-hidden"
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
      
      {/* Hero Section */}
      <section className="relative z-20 pt-8 md:pt-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex justify-center items-center mb-4 space-x-2">
            <span className="text-2xl animate-gentle-bounce delay-100">😊</span>
            <span className="text-2xl animate-gentle-float delay-200">🌸</span>
            <span className="text-2xl animate-gentle-pulse delay-300">✨</span>
            <span className="text-2xl animate-gentle-bounce delay-400">💙</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-indigo-900 mb-4 flex flex-wrap justify-center items-center">
            <div className="logo-container flex items-center">
              <div className="logo-circle bg-gradient-to-br from-pink-400 to-pink-500 rounded-full w-12 h-12 flex items-center justify-center shadow-md mr-3">
                <Laugh size={28} className="text-white animate-gentle-pulse" />
              </div>
              <span className="gradient-text italic mr-3">About Happify</span>
            </div>
            <span className="text-3xl md:text-5xl inline-block animate-gentle-pulse">{emojis[emojiIndex]}</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-indigo-700 mb-12 max-w-3xl mx-auto">
            Your mental health companion - <span className="font-medium italic">Happify to Happy Me</span>
          </p>
        </div>
      </section>
      
      {/* Our Mission Section */}
      <section className="relative z-20 py-12 px-4 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 gradient-text">
                Our Mission
              </h2>
              
              <p className="text-lg text-indigo-900 mb-6">
              To be the ultimate companion for stress relief and wellness, fostering peace of mind in a hectic world. Through our accessible mobile platform equipped with engaging features, we empower individuals to discover their path to happiness while developing sustainable mental wellness practices. We designed our application to cultivate emotional resilience through its comprehensive suite of tools including mindfulness exercises, mood-tracking capabilities, and stress-relief activities that create a supportive environment for personal growth and mental well-being.
              </p>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-6 gradient-text">
                Our Vision
              </h2>

              <p className="text-lg text-indigo-900 mb-6">
              "Transforming stress into serenity with a playful blend of mindfulness, motivation, and healthy living."
              </p>
              
              <div className="flex items-center">
                <Heart 
                  size={48} 
                  color="#7C3AED" 
                  className="mr-4" 
                />
                <p className="text-lg font-medium text-indigo-900">
                  <span className="italic">Happify to Happy Me</span> - Because your mental health matters.
                </p>
              </div>
            </div>
            
            <div className="md:w-1/2 flex justify-center">
              <div className="relative">
                <div className="bg-white rounded-2xl shadow-lg p-8 relative z-10">
                  <div className="text-4xl mb-4 text-center">🧠❤️</div>
                  <h3 className="text-2xl font-bold text-indigo-900 mb-3 text-center">
                    A Safe Space for Your Journey
                  </h3>
                  <p className="text-indigo-700">
                    Happify offers a private, secure environment where you can track your moods, journal your thoughts, practice meditation, and access resources to support your mental wellbeing journey.
                  </p>
                  <div className="mt-6 flex justify-center">
                    <button 
                      onClick={() => handleNavigation('/register')}
                      className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-2 rounded-full text-lg font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                    >
                      Start Your Journey
                    </button>
                  </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute top-[-20px] right-[-20px] w-16 h-16 bg-purple-100 rounded-full z-0"></div>
                <div className="absolute bottom-[-15px] left-[-15px] w-12 h-12 bg-indigo-100 rounded-full z-0"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="relative z-20 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 gradient-text">
            What Makes Happify Special
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Brain size={32} color="#7C3AED" className="animate-gentle-pulse" />}
              emoji="😌"
              title="Mood Tracking"
              description="Track your daily moods and identify patterns in your emotional wellbeing"
              onClick={() => handleNavigation('/mood-analytics')}
            />
            
            <FeatureCard
              icon={<BookHeart size={32} color="#7C3AED" className="animate-gentle-bounce" />}
              emoji="🧘"
              title="Journal"
              description="Express your thoughts and feelings in a private, secure space"
              onClick={() => handleNavigation('/journal')}
            />
            
            <FeatureCard
              icon={<Music size={32} color="#7C3AED" className="animate-gentle-wiggle" />}
              emoji="🦋"
              title="Calming Music"
              description="Access a curated collection of soothing music and meditation tracks"
              onClick={() => handleNavigation('/music')}
            />
            
            <FeatureCard
              icon={<Video size={32} color="#7C3AED" className="animate-gentle-spin" />}
              emoji="💆"
              title="Resources"
              description="Discover videos, articles, and exercises for mental wellness"
              onClick={() => handleNavigation('/resources')}
            />
          </div>
        </div>
      </section>
      
      
      {/* Values Section */}
      <section className="relative z-20 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 gradient-text">
            Our Values
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ValueCard 
              icon="❤️"
              title="Compassion" 
              description="We approach mental health with kindness, understanding, and respect for each person's unique journey."
            />
            <ValueCard 
              icon="🔒"
              title="Privacy" 
              description="Your data is yours. We maintain the highest standards of security and privacy protection."
            />
            <ValueCard 
              icon="🔬"
              title="Evidence-Based" 
              description="Our features are grounded in psychological research and proven approaches to mental wellness."
            />
            <ValueCard 
              icon="🌍"
              title="Accessibility" 
              description="We strive to make mental health tools accessible to everyone, regardless of background or circumstance."
            />
            <ValueCard 
              icon="🤝"
              title="Community" 
              description="We believe in the power of connection and support in the mental health journey."
            />
            <ValueCard 
              icon="🔄"
              title="Continuous Improvement" 
              description="We constantly evolve our platform based on user feedback and emerging research."
            />
          </div>
        </div>
      </section>
      
      
      
      {/* Footer */}
      <footer className="relative z-20 py-8 px-4 bg-indigo-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="bg-white rounded-full p-2 mr-3">
                <Heart size={24} color="#7C3AED" />
              </div>
              <span className="text-2xl font-bold gradient-text-light italic">Happify</span>
            </div>
            
            <div className="flex gap-6">
              <button onClick={() => handleNavigation('/')} className="hover:text-purple-300 transition-colors">
                Home
              </button>
              <button onClick={() => handleNavigation('/about')} className="hover:text-purple-300 transition-colors">
                About
              </button>
            </div>
          </div>
          
          <div className="mt-6 text-center text-indigo-300 text-sm">
            © 2025 Happify. All rights reserved.
          </div>
        </div>
      </footer>
      
      <style jsx>{`
        /* Gradient text with rainbow shift animation */
        @keyframes rainbow-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .gradient-text {
          background: linear-gradient(to right, #7C3AED, #EC4899, #F59E0B, #10B981, #3B82F6, #8B5CF6);
          background-size: 400% 400%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: rainbow-shift 10s ease infinite;
        }
        
        .gradient-text-light {
          background: linear-gradient(to right, #E9D5FF, #F9A8D4, #FEF3C7, #A7F3D0, #BFDBFE, #DDD6FE);
          background-size: 400% 400%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: rainbow-shift 10s ease infinite;
        }
        
        /* Animation keyframes - REMOVED FLOATING ANIMATIONS */
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
        
        @keyframes gentle-float {
          0% { transform: translateY(0); opacity: 0.9; }
          50% { transform: translateY(-10px); opacity: 1; }
          100% { transform: translateY(0); opacity: 0.9; }
        }
        
        @keyframes gentle-wiggle {
          0% { transform: rotate(-2deg); }
          50% { transform: rotate(2deg); }
          100% { transform: rotate(-2deg); }
        }
        
        /* Background */
        .bg-emoji-pattern {
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        
        /* Animation classes - REMOVED FLOATING ANIMATIONS */
        .animate-gentle-pulse {
          animation: gentle-pulse 3s ease-in-out infinite;
        }
        
        .animate-gentle-bounce {
          animation: gentle-bounce 3s ease-in-out infinite;
        }
        
        .animate-gentle-float {
          animation: gentle-float 3s ease-in-out infinite;
        }
        
        .animate-gentle-wiggle {
          animation: gentle-wiggle 3s infinite;
        }
        
        .animate-gentle-spin {
          animation: spin-slow 12s linear infinite;
        }
        
        /* Animation delays */
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

// Feature Card Component
const FeatureCard = ({ icon, title, description, emoji, onClick }) => {
  return (
    <div 
      className="bg-white p-6 rounded-xl shadow-sm border border-purple-100 transition-all duration-300 hover:shadow-md hover:translate-y-[-5px] cursor-pointer"
      onClick={onClick}
    >
      <div className="bg-purple-100 w-16 h-16 rounded-lg flex items-center justify-center mb-4">
        {icon}
      </div>
      
      <h3 className="text-xl font-bold text-indigo-900 mb-2 flex items-center">
        {title}
        <span className="ml-2 text-xl animate-gentle-pulse">{emoji}</span>
      </h3>
      
      <p className="text-gray-700">{description}</p>
    </div>
  );
};

// Value Card Component
const ValueCard = ({ icon, title, description }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-100">
      <div className="text-4xl mb-4 text-center">{icon}</div>
      <h3 className="text-xl font-bold text-indigo-900 mb-2 text-center">{title}</h3>
      <p className="text-gray-700 text-center">{description}</p>
    </div>
  );
};

export default AboutUs;