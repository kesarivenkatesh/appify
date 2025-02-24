import {useNavigate} from 'react-router';
import { Heart, Brain, BookHeart, Music, Video } from 'lucide-react';

const Main =() =>{
    const navigate = useNavigate();
    
    
    return (
      <div className="page-container">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">Your Mental Health Companion</h1>
            <p className="hero-subtitle">
              A safe space for your mental wellbeing journey
            </p>
            <span className="primary-button">
            Start Your Journey
            <Heart size={25} />
              
            </span>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <div className="features-grid  grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Brain size={32} color="#7C3AED" />}
              title="Mood Tracking"
              description="Track your daily moods and identify patterns in your emotional wellbeing"
            />
            <FeatureCard
              icon={<BookHeart size={32} color="#7C3AED" />}
              title="Journal"
              onClick={() => navigate('/journal')}
              description="Express your thoughts and feelings in a private, secure space"
            />
            <FeatureCard
              icon={<Music size={32} color="#7C3AED" />}
              title="Calming Music"
              description="Access a curated collection of soothing music and meditation tracks"
            />
            <FeatureCard
              icon={<Video size={32} color="#7C3AED" />}
              title="Resources"
              description="Discover videos, articles, and exercises for mental wellness"
            />
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="cta-container">
            <Heart size={48} color="#7C3AED" className="mx-auto mb-6" />
            <h2 className="cta-title">Your Wellbeing Matters</h2>
            <p className="cta-description">
              Eat Sleep Exercise
            </p>
          </div>
        </section>
      </div>
    );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="feature-card">
    <div className="feature-icon">
      {icon}
    </div>
    <h3 className="feature-title">{title}</h3>
    <p className="feature-description">{description}</p>
  </div>
);

export default Main;