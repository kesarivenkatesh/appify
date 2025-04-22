import { useState, useEffect } from 'react';
import { 
  Heart, Laugh, Smile, Brain, 
  Music, BookHeart, Star, Award, 
  Users, ArrowRight, Coffee
} from 'lucide-react';

const Home = () => {
  const [emojiIndex, setEmojiIndex] = useState(0);
  const [backgroundMood, setBackgroundMood] = useState(0);
  
  // Array of calming and happy emojis to rotate through
  const emojis = ['😊', '😌', '🥰', '😇', '🧘', '🌈', '✨', '🌿', '💆', '🌸', '🌼', '🌞', '🌠', '💙', '☁️', '🦋'];
  
  // Change main display emoji every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setEmojiIndex((prevIndex) => (prevIndex + 1) % emojis.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [emojis.length]);
  
  // Background mood gradient changes
  useEffect(() => {
    const interval = setInterval(() => {
      setBackgroundMood((prev) => (prev + 1) % 5);
    }, 8000);
    
    return () => clearInterval(interval);
  }, []);

  // Navigation handler without react-router
  const handleNavigation = (path) => {
    // Using window.location for navigation instead of react-router
    window.location.href = path;
  };

  // Testimonials data
  const testimonials = [
    {
      id: 1,
      name: "Sannidhi",
      avatar: "🧘‍♀️",
      text: "Happify has transformed my daily routine. The mood tracking feature helps me stay mindful of my emotional well-being.",
      rating: 5
    },
    {
      id: 2,
      name: "Aaryan Gurung",
      avatar: "👨‍💼",
      text: "As someone dealing with anxiety, the calming music and meditation exercises have been a game-changer for me.",
      rating: 5
    },
    {
      id: 3,
      name: "Samuel Thompson",
      avatar: "👩‍🎓",
      text: "The journal feature has helped me process my thoughts during a challenging semester. Highly recommend!",
      rating: 4
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
      
      {/* Hero Section - New Design */}
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
              <span className="gradient-text italic mr-3">Happify Welcomes You</span>
            </div>
            <span className="text-3xl md:text-5xl inline-block animate-gentle-pulse">{emojis[emojiIndex]}</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-indigo-700 mb-8 max-w-3xl mx-auto">
            Your journey to mental wellness begins from <span className="font-medium italic">Happify to Happy Me.</span>
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <button 
              onClick={() => handleNavigation('/register')}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-8 py-3 rounded-full text-lg font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center"
            >
              Start Your Journey
              <Heart size={22} className="ml-2" />
            </button>
            
            <button 
              onClick={() => handleNavigation('/about')}
              className="bg-white text-indigo-600 border-2 border-indigo-600 px-8 py-3 rounded-full text-lg font-medium hover:shadow-lg transition-all duration-300 hover:bg-indigo-50 flex items-center"
            >
              Learn More
              <ArrowRight size={18} className="ml-2" />
            </button>
          </div>
        </div>
      </section>
      
      {/* Features Section - Modern Card Design */}
      <section className="relative z-20 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 gradient-text">
             Your Day gets Brighter with our Wonderful Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="relative z-20 py-12 px-4 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-2 gradient-text">
            User Testimonials
          </h2>
          
          <p className="text-center text-indigo-600 mb-12">
            See how Happify has helped others on their wellness journey
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map(testimonial => (
              <div 
                key={testimonial.id}
                className="bg-white p-6 rounded-xl shadow-sm border border-purple-100 transition-all duration-300 hover:shadow-md"
              >
                <div className="flex items-start mb-4">
                  <div className="mr-4 text-4xl">{testimonial.avatar}</div>
                  <div>
                    <h3 className="font-bold text-lg text-indigo-900">{testimonial.name}</h3>
                    <div className="flex text-yellow-400">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} size={16} fill="#FBBF24" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700">{testimonial.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="relative z-20 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Heart 
            size={48} 
            color="#7C3AED" 
            className="mx-auto mb-6" 
          />
          
          <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">
            Get Start Your Wellness Journey Today!
          </h2>
          
          
          <div className="flex justify-center">
            <button 
              onClick={() => handleNavigation('/register')}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-10 py-4 rounded-full text-xl font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center"
            >
              Get Started Now
              <ArrowRight size={24} className="ml-2" />
            </button>
          </div>
          
          <div className="mt-8 flex items-center justify-center text-indigo-600">
            <div className="flex flex-wrap justify-center gap-2 items-center">
              <span className="animate-gentle-bounce inline-flex">🥗</span> 
              Eat Well 
              <span className="animate-gentle-pulse inline-flex mx-2">😴</span> 
              Rest 
              <span className="animate-gentle-float inline-flex mx-2">🧘</span> 
              Breathe 
              <span className="animate-gentle-bounce inline-flex mx-2">❤️</span>
              Be Well
            </div>
          </div>
        </div>
      </section>
      
      
      
      {/* Footer Preview */}
      <footer className="relative z-20 py-8 px-4 bg-indigo-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="bg-white rounded-full p-2 mr-3">
                <Laugh size={24} color="#7C3AED" className="animate-gentle-pulse" />
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

// Team Member Preview Component
const TeamMemberPreview = ({ avatar, name, role }) => {
  return (
    <div className="text-center">
      <div className="text-5xl mb-2">{avatar}</div>
      <h3 className="font-bold text-indigo-900">{name}</h3>
      <p className="text-indigo-600 text-sm">{role}</p>
    </div>
  );
};

export default Home;