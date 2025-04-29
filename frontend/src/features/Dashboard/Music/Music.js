import React, { useState } from 'react';
import { VideoPlayer } from '../VideoPlayer';
import { 
  Music as MusicIcon, 
  HeartPulse, 
  Moon, 
  Brain,
  Sparkles
} from 'lucide-react';
import './Music.css';

// Music video categories
const musicVideos = {
  relaxing: [
    { 
      id: '40tPuU6jrgQ', 
      title: 'Beautiful Piano Music', 
      description: 'Relaxing music for stress relief',
      duration: '3 hours'
    },
    { 
      id: 'AImuCtIokl0', 
      title: 'Relaxing Sleep Music', 
      description: 'Deep sleeping music for stress relief',
      duration: '3 hours'
    },
    { 
      id: 'cI4ryatVkKw', 
      title: 'Peaceful Music', 
      description: 'Relaxing piano for calm and serenity',
      duration: '3 hours'
    },
    {
      id: 'lFcSrYw-ARY',
      title: 'Study Music',
      description: 'Alpha Waves for Focus and Creativity',
      duration: '3 hours'
    },
    {
      id: 'SDXGjgi7r_o',
      title: 'Relaxing Guitar Music',
      description: 'Beautiful acoustic guitar for stress relief',
      duration: '1 hour'
    },
    {
      id: 'qsEBaIMCKl4',
      title: 'Peaceful Ambient Music',
      description: 'Calming sounds for relaxation',
      duration: '2 hours'
    }
  ],
  sleep: [
    { 
      id: 'bP9gMpl1gyQ', 
      title: 'Sleep Music with Rain Sounds', 
      description: 'Deep sleeping music with rain',
      duration: '10 hours'
    },
    { 
      id: 'z9UYJRf4RVw', 
      title: 'Deep Sleep Music', 
      description: 'Fall asleep fast with 432Hz healing',
      duration: '8 hours'
    },
    { 
      id: '3PfBP7Dm2ZxQ', 
      title: 'Sleep Meditation Music', 
      description: 'Delta waves for deep sleep',
      duration: '10 hours'
    },
    {
      id: '9iQAq9GuZao',
      title: 'Black Screen Sleep Music',
      description: 'Relaxing music with black screen for sleeping',
      duration: '10 hours'
    },
    {
      id: 'NoIivY2oO4Y',
      title: 'Peaceful Piano for Sleep',
      description: 'Soft piano melodies to help you sleep',
      duration: '3 hours'
    },
    {
      id: 'pJYwKJPaEKU',
      title: 'Sleep Music with Ocean Waves',
      description: 'Calming music with ocean sounds',
      duration: '8 hours'
    }
  ],
  focus: [
    {
      id: '03CSl20LcRU',
      title: 'Study Music Alpha Waves',
      description: 'Focus music to improve concentration',
      duration: '3 hours'
    },
    {
      id: 'mBZfRVM7iLc',
      title: 'Focus Concentration Music',
      description: 'Brain power, study music',
      duration: '2 hours'
    },
    {
      id: 'GLASrUS44tE',
      title: 'Focus Music',
      description: 'Increase concentration and brain power',
      duration: '3 hours'
    },
    {
      id: 'IQ3SaSf--8Q',
      title: 'Deep Focus Music',
      description: 'Binaural beats concentration music',
      duration: '3 hours'
    },
    {
      id: 'qk9ggEk_3P4',
      title: 'Ambient Study Music',
      description: 'Improve focus and concentration',
      duration: '3 hours'
    },
    {
      id: 'R6reLZGzTDw',
      title: 'Deep Focus Music',
      description: '24/7 Study Music, Concentration Music',
      duration: '10 hours'
    }
  ],
  healing: [
    { 
      id: 'xcVt6s_M7uo', 
      title: 'Healing Music 432Hz', 
      description: 'Raise positive vibrations',
      duration: '3 hours'
    },
    { 
      id: 'koRbYQyPU0U', 
      title: 'Healing Meditation Music', 
      description: 'Relaxing mind, body and soul',
      duration: '3 hours'
    },
    { 
      id: 'nkqnuxKj8Dk', 
      title: 'Positive Energy Music', 
      description: '432Hz healing frequency',
      duration: '3 hours'
    },
    {
      id: 'BWMcR35D-cE',
      title: 'Miracle Healing Music',
      description: 'Music to heal all pains',
      duration: '3 hours'
    },
    {
      id: 'n6dbQx3yj9M',
      title: 'Healing Sleep Music',
      description: '528Hz positive energy, anxiety relief',
      duration: '3 hours'
    },
    {
      id: 'RJI4nZtKzpU',
      title: 'Reiki Healing Music',
      description: 'Meditation music for positive energy',
      duration: '3 hours'
    }
  ],
  nature: [
    { 
      id: 'eNUpTV9BGac', 
      title: 'Relaxing Nature Sounds', 
      description: 'Forest ambience for stress relief',
      duration: '3 hours'
    },
    { 
      id: 'tF4z5kntXAA', 
      title: 'Rain Sounds', 
      description: 'Sleep and relaxation with rain',
      duration: '10 hours'
    },
    { 
      id: 'hTDuZWt6Xbg', 
      title: 'Ocean Waves Sounds', 
      description: 'Calming sea waves for relaxation',
      duration: '8 hours'
    },
    {
      id: '4S3yJkGWM4E',
      title: 'Forest Bird Sounds',
      description: 'Beautiful nature sounds',
      duration: '2 hours'
    },
    {
      id: 'DqewBvd-bAA',
      title: 'Waterfall Sounds',
      description: 'Relaxing water sounds for sleep',
      duration: '10 hours'
    },
    {
      id: 'pOHQdIDds6s',
      title: 'Campfire Sound',
      description: 'Crackling fire with dark screen',
      duration: '10 hours'
    }
  ]
};

// Category configuration for styling and icons
const categoryConfig = {
  relaxing: { 
    icon: <MusicIcon className="category-icon text-blue-500" />, 
    title: 'Relaxing Music', 
    description: 'Calming melodies to reduce stress and anxiety' 
  },
  sleep: { 
    icon: <Moon className="category-icon text-indigo-500" />, 
    title: 'Sleep Music', 
    description: 'Gentle sounds to help you fall asleep' 
  },
  focus: { 
    icon: <Brain className="category-icon text-amber-500" />, 
    title: 'Focus Music', 
    description: 'Enhance concentration and productivity' 
  },
  healing: { 
    icon: <HeartPulse className="category-icon text-pink-500" />, 
    title: 'Healing Music', 
    description: 'Therapeutic frequencies for mind and body' 
  },
  nature: { 
    icon: <Sparkles className="category-icon text-green-500" />, 
    title: 'Nature Sounds', 
    description: 'Natural ambience for relaxation' 
  }
};

const Music = () => {
  const [activeCategory, setActiveCategory] = useState('relaxing');

  return (
    <div className="music-container">
      {/* Sticky Header */}
      <div className="music-sticky-header">
        <section className="music-header">
          <h1 className="header-title">Calming Music Therapy</h1>
          <p className="header-description">
            Experience the healing power of music with our carefully selected tracks. Choose from various categories to match your mood and needs.
          </p>

          {/* Category Navigation */}
          <div className="category-navigation">
            {Object.keys(musicVideos).map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`category-button ${activeCategory === category ? 'active' : ''}`}
              >
                {categoryConfig[category].icon}
                <span>{categoryConfig[category].title}</span>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Active Category Section */}
      <section className="category-content">
        <div className="category-header">
          {categoryConfig[activeCategory].icon}
            <p className="category-description">{categoryConfig[activeCategory].description}</p>
          
        </div>

        <div className="video-grid">
          {musicVideos[activeCategory].map((video) => (
            <div key={video.id} className="video-card">
              <VideoPlayer videoId={video.id} title={video.title} />
              <div className="video-details">
                <h3>{video.title}</h3>
                <p>{video.description}</p>
                <div className="video-meta">
                  <span className="video-duration">{video.duration}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Music;