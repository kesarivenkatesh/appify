import React, { useState } from 'react';
import { VideoPlayer } from '../VideoPlayer';
import { 
  Zap, 
  Cloud, 
  Heart, 
  Droplet,
  Frown
} from 'lucide-react';
import './Meditation.css';

// Meditation video categories
const meditationVideos = {
  stress: [
    { 
      id: 'O-6f5wQXSu8', 
      title: 'Stress Relief Meditation', 
      description: 'Relax and release tension',
      duration: '10 mins'
    },
    { 
      id: 'j7d5Plai03g', 
      title: 'Quick Stress Reduction', 
      description: '10 Minute Guided Daily Meditation',
      duration: '10 mins'
    },
    { 
      id: '2FGR-OspxsU', 
      title: '10 Minute Meditation For Heling', 
      description: 'Heal your racing mind',
      duration: '10 mins'
    },
    {
      id: '9yj8mBfHlMk',
      title: 'Quick Stress Relief',
      description: 'Meditation for De-Stress',
      duration: '6 mins'
    },
    {
      id: 'z6X5oEIg6Ak',
      title: 'Meditation for Stress Relief',
      description: 'Guided Meditation to Relieve Stress',
      duration: '10 mins'
    },
    {
      id: 'U9YKY7fdwyg',
      title: '10 Minute Meditation For Beginners',
      description: 'Guided Meditation for Beginners',
      duration: '10 mins'
    }

  ],
  relaxation: [
    { 
      id: '2DXqMBXmP8Q', 
      title: 'Deep Relaxation Journey', 
      description: 'Total body and mind relaxation',
      duration: '20 mins'
    },
    { 
      id: 'y3O22mqcnPI', 
      title: 'Let Go and Unwind', 
      description: 'Release stress and find peace',
      duration: '12 mins'
    },
    { 
      id: '1iOUQHCes6Q', 
      title: 'Complete Relaxation Meditation', 
      description: 'Guided Meditation Just as you are',
      duration: '10 mins'
    },
    {
      id: 'unCya_-8ECs',
      title: 'Sound Healing For Relaxation and Stress Relief',
      description: 'Sound Healing Meditation for Relaxation',
      duration: '10 mins'
    },
    {
      id: 'inpok4MKVLM',
      title: '5 Minute Meditation',
      description: 'Meditation You Can Do Anywhere',
      duration: '5 mins'
    },
    {
      id: 'wkse4PPxkk4',
      title: 'Meditation to reduce Anger',
      description: 'Guided Meditation For Anger Issues',
      duration: '10 mins'
    }
  ],
  anxietyanddepression:[
    {
      id: '2FGR-OspxsU',
      title: '10 minute meditation for healing',
      description: 'Guided Meditation on Healing',
      duration: '10 mins'
    },
    {
      id: 'sfSDQRdIvTc',
      title: 'Reduce Overthinking and Stress',
      description: 'Guided Meditation on Reducing Over Thinking',
      duration: '10 mins'
    },
    {
      id: 'xRxT9cOKiM8',
      title: 'Meditation for Depression',
      description: '10 minute Meditation For Depression',
      duration: '10 mins'
    },
    {
      id: 'O-6f5wQXSu8',
      title: 'Meditation for Anxiety',
      description: '10 minute guided Meditation for Anxiety',
      duration: '10 mins'
    },
    {
      id: 'j7d5Plai03g',
      title: 'Daily Meditation To Relieve anxiety and feel free',
      description: '10 Minute Guided Daily Meditation',
      duration: '10 mins'
    },
    {
      id: '77bmP_SqsfQ',
      title: 'Guided Meditation that everything is working out for you',
      description: 'Guided Meditation for Positivity and Hope',
      duration: '10 mins'
    }

  ],
  spiritual: [
    { 
      id: 'qjzTH5e7_iU', 
      title: 'Meditation for Clearing Blockages and Negativity', 
      description: 'Connect with your inner self and declutter negativity',
      duration: '5 mins'
    },
    { 
      id: 'aEqlQvczMJQ', 
      title: 'Mindful Meditation for Sleep', 
      description: 'Mindful Meditation for Sleep',
      duration: '10 mins'
    },
    { 
      id: 'IN5z4gNOVYg', 
      title: 'Inner Peace Meditation for Kids', 
      description: 'Guided Meditation for Kids',
      duration: '10 mins'
    },
    {
      id: 'qPHoTSaZ7yY',
      title: 'Morning Meditation',
      description: 'Guided Meditation for Inner Peace',
      duration: '10 mins'
    },
    {
      id: 'tOE17a0GfPM',
      title: 'Mindfulness Meditation',
      description: 'Guided Meditation for Mindfulness',
      duration: '10 mins'
    },
    {
      id: 'ENYYb5vIMkU',
      title: 'Meditation to start a day with freshness',
      description: 'Guided Meditation for Starting a day with Happiness',
      duration: '10 mins'
    }
  ],
  calming: [
    { 
      id: 'rG_mpEJcOtg', 
      title: 'Meditation for Inner Calmness', 
      description: 'Guided Meditation to inner calm and stillness',
      duration: '10 mins'
    },
    { 
      id: 'RVzIDLcGzYw', 
      title: 'Relax Everything is going to be okay', 
      description: 'Quick Guided Meditation to calm yourself',
      duration: '5 mins'
    },
    { 
      id: 'pAEioF7FaWY', 
      title: 'Guided Meditation for Inner Calm and Peace', 
      description: 'Soft breathing relaxation for Inner Peace',
      duration: '10 mins'
    },
    {
      id: 'tIZpNrr0uX8',
      title: 'Nature Deep Meditation',
      description: 'Nature Sounds Relaxation',
      duration: ''
    },
    {
      id: '4S3yJkGWM4E',
      title: 'Peaceful Forest Sounds Meditation',
      description: 'Peaceful Forest Sounds Relaxation',
      duration: '10 mins'
    },
    {
      id: 'op6oEzXM_Yw',
      title: 'Guided Meditation On Focus',
      description: 'How long can you focus Meditation',
      duration: '10 mins'
    }
  ]
};

// Category configuration for styling and icons
const categoryConfig = {
  stress: { 
    icon: <Zap className="text-red-500" />, 
    title: 'Stress Relief', 
    description: 'Techniques to reduce and manage stress' 
  },
  anxietyanddepression:{
    icon: <Frown className="text-pink-500" />,
    title: 'Anxiety & Depression',
    description: 'Relieve Anxiety and Depression and Feel Relaxed'

  },
  relaxation: { 
    icon: <Cloud className="text-blue-500" />, 
    title: 'Deep Relaxation', 
    description: 'Complete mind and body unwinding' 
  },
  spiritual: { 
    icon: <Heart className="text-purple-500" />, 
    title: 'Spiritual Growth', 
    description: 'Connect with your inner self' 
  },
  calming: { 
    icon: <Droplet className="text-teal-500" />, 
    title: 'Calming Practices', 
    description: 'Gentle meditation for peace' 
  }
};


const Meditation = () => {
  const [activeCategory, setActiveCategory] = useState('stress');

  return (
    <div className="meditation-container">
      {/* Sticky Header */}
      <div className="meditation-sticky-header">
        <section className="meditation-header">
          <h1 className="header-title"> Meditation Sanctuary </h1>
          <p className="header-description">
            Discover peace, reduce stress, and enhance your mental well-being. Choose from our carefully curated meditation practices tailored to your needs.
          </p>
        </section>

        {/* Category Navigation */}
        <div className="category-navigation">
          {Object.keys(meditationVideos).map((category) => (
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
      </div>

      {/* Active Category Section */}
      <section className="category-content">
        <div className="category-header">
          {categoryConfig[activeCategory].icon}
          <p className="category-description">{categoryConfig[activeCategory].description}</p>
          
        </div>

        <div className="video-grid">
          {meditationVideos[activeCategory].map((video) => (
            <div key={video.id} className="video-card">
              <VideoPlayer videoId={video.id} title={video.title} />
              <div className="video-details">
                <h3>{video.title}</h3>
                <p>{video.description}</p>
                <span>{video.duration}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Meditation;