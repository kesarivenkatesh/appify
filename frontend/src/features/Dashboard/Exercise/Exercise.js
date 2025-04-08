import React, { useState } from 'react';
import { VideoPlayer } from '../VideoPlayer';

const exerciseVideos = [
  { 
    id: 'ml6cT4AZdqI', 
    title: '30-Minute Full Body Workout', 
    category: 'Cardio'
  },
  { 
    id: 'sTANio_2E0Q', 
    title: 'Beginner Yoga Flow', 
    category: 'Yoga'
  },
  { 
    id: 'RSxBqqYRTNY', 
    title: 'Strength Training Workout for Beginners', 
    category: 'Strength Training'
  },
  { 
    id: 'vxdlB3SnkGQ', 
    title: 'Dynamic Movement Mobility Routine at Home', 
    category: 'Movements'
  },
  { 
    id: 'dj03_VDetdw', 
    title: 'Cardio Workout for Beginners', 
    category: 'Cardio'
  },
  { 
    id: 'OWGXhg50EHI', 
    title: 'Cardio Workout for Beginners', 
    category: 'Cardio'
  },
  { 
    id: 'Eml2xnoLpYE', 
    title: '25 minute Full Body Yoga', 
    category: 'Yoga'
  },
  { 
    id: '2IcWJobNDck', 
    title: 'Morning Mobility Yoga', 
    category: 'Yoga'
  },
  { 
    id: 'xb0vui7Ny8A', 
    title: 'Improve functional Strength with these Exercises', 
    category: 'Strength Training'
  },
  {
    id:'GcZJhNi2yOM',
    title: 'Best Exercises for Runners | Strength Training',
    category: 'Strength Training'
  },
  { 
    id: 'kqaNUjTR70A', 
    title: 'Fast 20 minute Walk for Fatloss', 
    category: 'Movements'
  },
  { 
    id: '4bGXW8vuZvM', 
    title: 'Power Walk at Home', 
    category: 'Movements'
  }
];

const Exercise = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Get unique categories
  const categories = ['All', ...new Set(exerciseVideos.map(video => video.category))];

  // Filter videos based on selected category
  const filteredVideos = selectedCategory === 'All' 
    ? exerciseVideos 
    : exerciseVideos.filter(video => video.category === selectedCategory);

  return (
    <div className="container mx-auto px-4 space-y-8">
      {/* Sticky Header */}
      <section className="bg-white rounded-lg shadow-md p-14 sticky top-0 z-10">
        <h2 className="text-3xl font-bold">Daily Exercise</h2>
        <p className="text-gray-700 text-lg">
          Choose from our collection of exercise and yoga videos to stay active and healthy. Remember to warm up before starting any exercise routine.
        </p>

        {/* Category Buttons */}
        <div className="flex flex-wrap gap-4 mt-4">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-5 py-2 rounded-full transition-all ${
                selectedCategory === category 
                  ? 'bg-blue-600 text-white font-semibold' 
                  : 'bg-gray-300 text-gray-800 hover:bg-gray-400'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* Exercise Videos */}
      <section className="bg-white rounded-lg shadow-md p-14">
        <h2 className="text-3xl font-bold mb-6">Workout Videos</h2>

        {/* Video Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredVideos.map((video) => (
            <div 
              key={video.id} 
              className="bg-white rounded-lg shadow-md overflow-hidden hover:scale-105 transition-transform"
            >
              <VideoPlayer videoId={video.id} title={video.title} />
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{video.title}</h3>
                <span className="text-sm text-gray-600 bg-gray-200 px-3 py-1 rounded-full inline-block">
                  {video.category}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* No Videos Message */}
        {filteredVideos.length === 0 && (
          <p className="text-center text-gray-500 mt-6 text-lg">
            No videos found in this category.
          </p>
        )}
      </section>
    </div>
  );
};

export default Exercise;
