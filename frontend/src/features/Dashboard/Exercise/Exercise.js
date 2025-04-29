import React, { useState } from 'react';
import { VideoPlayer } from '../VideoPlayer';
import { Dumbbell } from 'lucide-react';
import './Exercise.css';

const exerciseVideos = [
  { 
    id: 'ml6cT4AZdqI', 
    title: '30-Minute Full Body Workout', 
    category: 'Cardio',
    description: 'Complete full-body workout',
    duration: '30 mins'
  },
  { 
    id: 'sTANio_2E0Q', 
    title: 'Beginner Yoga Flow', 
    category: 'Yoga',
    description: 'Gentle yoga for beginners',
    duration: '15 mins'
  },
  { 
    id: 'RSxBqqYRTNY', 
    title: 'Strength Training Workout for Beginners', 
    category: 'Strength Training',
    description: 'Build strength with basic moves',
    duration: '20 mins'
  },
  { 
    id: 'vxdlB3SnkGQ', 
    title: 'Dynamic Movement Mobility Routine at Home', 
    category: 'Movements',
    description: 'Improve flexibility and mobility',
    duration: '15 mins'
  },
  { 
    id: 'dj03_VDetdw', 
    title: 'Cardio Workout for Beginners', 
    category: 'Cardio',
    description: 'Easy cardio to get started',
    duration: '20 mins'
  },
  { 
    id: 'OWGXhg50EHI', 
    title: 'High Intensity Cardio Workout', 
    category: 'Cardio',
    description: 'Burn calories with high intensity',
    duration: '25 mins'
  },
  { 
    id: 'Eml2xnoLpYE', 
    title: '25 minute Full Body Yoga', 
    category: 'Yoga',
    description: 'Energizing full-body stretch',
    duration: '25 mins'
  },
  { 
    id: '2IcWJobNDck', 
    title: 'Morning Mobility Yoga', 
    category: 'Yoga',
    description: 'Start your day with gentle movement',
    duration: '15 mins'
  },
  { 
    id: 'xb0vui7Ny8A', 
    title: 'Improve Functional Strength with these Exercises', 
    category: 'Strength Training',
    description: 'Build everyday functional strength',
    duration: '30 mins'
  },
  {
    id:'GcZJhNi2yOM',
    title: 'Best Exercises for Runners | Strength Training',
    category: 'Strength Training',
    description: 'Support your running with strength',
    duration: '20 mins'
  },
  { 
    id: 'kqaNUjTR70A', 
    title: 'Fast 20 minute Walk for Fat Loss', 
    category: 'Movements',
    description: 'Walking workout for fat burning',
    duration: '20 mins'
  },
  { 
    id: '4bGXW8vuZvM', 
    title: 'Power Walk at Home', 
    category: 'Movements',
    description: 'Indoor walking with intensity',
    duration: '30 mins'
  }
];

// Category configuration with descriptions and icons
const categoryConfig = {
  'All': {
    title: 'All Workouts',
    description: 'Explore our complete collection of exercise videos',
    icon: <Dumbbell className="category-icon text-green-500" />
  },
  'Cardio': {
    title: 'Cardio',
    description: 'Get your heart pumping with these energizing workouts',
    icon: <Dumbbell className="category-icon text-red-500" />
  },
  'Yoga': {
    title: 'Yoga',
    description: 'Improve flexibility, balance, and mental clarity',
    icon: <Dumbbell className="category-icon text-purple-500" />
  },
  'Strength Training': {
    title: 'Strength Training',
    description: 'Build muscle and increase your overall strength',
    icon: <Dumbbell className="category-icon text-blue-500" />
  },
  'Movements': {
    title: 'Movement Routines',
    description: 'Enhance mobility and functional movement patterns',
    icon: <Dumbbell className="category-icon text-teal-500" />
  }
};

const Exercise = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Get unique categories
  const categories = ['All', ...new Set(exerciseVideos.map(video => video.category))];

  // Filter videos based on selected category
  const filteredVideos = selectedCategory === 'All' 
    ? exerciseVideos 
    : exerciseVideos.filter(video => video.category === selectedCategory);

  return (
    <div className="exercise-container">
      {/* Sticky Header */}
      <div className="exercise-sticky-header">
        <section className="exercise-header">
          <h1 className="header-title">Daily Exercise</h1>
          <p className="header-description">
            Choose from our collection of exercise and yoga videos to stay active and healthy. 
            Regular physical activity boosts your mood and energy while improving overall health.
          </p>

          {/* Category Navigation */}
          <div className="category-navigation">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`category-button ${selectedCategory === category ? 'active' : ''}`}
              >
                {categoryConfig[category].icon}
                <span>{category}</span>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Active Category Content */}
      <section className="category-content">
        <div className="category-header">
          {categoryConfig[selectedCategory].icon}
            <p className="category-description">{categoryConfig[selectedCategory].description}</p>
         
        </div>

        {/* Video Grid */}
        <div className="video-grid">
          {filteredVideos.map((video) => (
            <div 
              key={video.id} 
              className="video-card"
            >
              <VideoPlayer videoId={video.id} title={video.title} />
              <div className="video-details">
                <h3>{video.title}</h3>
                <p>{video.description}</p>
                <div className="video-meta">
                  <span className="video-duration">{video.duration}</span>
                  <span className="video-category">{video.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Videos Message */}
        {filteredVideos.length === 0 && (
          <p className="no-videos-message">
            No videos found in this category.
          </p>
        )}
      </section>
    </div>
  );
};

export default Exercise;