import React, { useState, useEffect } from "react";
import { VideoPlayer } from "../VideoPlayer";
import { 
  Zap, 
  Cloud, 
  Heart, 
  Droplet,
  Quote
} from 'lucide-react';
import "./Motivation.css";

// Motivational video categories
const motivationalVideos = {
  tedx: [
    { 
      id: "g-jwWYX7Jlo", 
      title: "Dream - Motivational TEDx Talk", 
      description: "Discover your dreams and pursue them with passion", 
      duration: "10 mins" 
    },
    { 
      id: "mgmVOuLgFB0", 
      title: "Your Time Is Now - TEDx Talk", 
      description: "Embrace opportunities and make the most of your time", 
      duration: "12 mins" 
    },
    {
      id: "X4nGU4DZUwE",
      title: "Powerful Motivational Speech - David Goggins", 
      description: "You Owe it to you", 
      duration: "19 mins" 
    }
  ],
  focus: [
    { 
      id: "cjhqjUOY_QQ", 
      title: "Focus Your Mind", 
      description: "Focus Motivational Speech", 
      duration: "9 mins" 
    },
    {
      id: "-jV1c1cm0sQ",
      title: "Stay Focus Video", 
      description: "Stay Focussed on your Goal", 
      duration: "3 mins" 
    },
    { 
      id: "ZOy0YgUDwDg", 
      title: "Never Give Up - Focus Video", 
      description: "Keep striving and never quit, even when challenges arise", 
      duration: "15 mins" 
    }
  ],
  timemanagement: [
    { 
      id: "-ESQmzDbnL8", 
      title: "Don't Waste Your Life", 
      description: "Powerful Motivational Speech", 
      duration: "8 mins" 
    },
    { 
      id: "Cho8ESO4PJE", 
      title: "Stop Wasting Time", 
      description: "The value of Time", 
      duration: "5 mins" 
    },
    { 
      id: "l6XK7GP4nOw", 
      title: "Do It Now", 
      description: "The Core Principles For Mastering Time Management - Brian Tracy", 
      duration: "15 mins" 
    }
  ],
  goals: [
    { 
      id: "ltbnzAVRZ9Xc", 
      title: "CHANGE YOUR LIFE - Denzel Washington Motivational Speech", 
      description: "Daily Morning Motivation", 
      duration: "10 mins" 
    },
    { 
      id: "68IcEa2BRC8", 
      title: "Never Give Up", 
      description: "NEVER GIVE UP - Best Motivational Speech", 
      duration: "10 mins" 
    },
    { 
      id: "NDLfh5rGsYQ", 
      title: "Think Like a Warrior and Win Like a Champion", 
      description: "Best Motivational Speech", 
      duration: "8 mins" 
    }
  ]
};

// Category configuration for styling and icons
const categoryConfig = {
  tedx: { 
    icon: <Zap className="category-icon text-red-500" />, 
    title: "TEDx Talks", 
    description: "Inspiring talks to spark ideas and change perspectives" 
  },
  focus: { 
    icon: <Cloud className="category-icon text-blue-500" />, 
    title: "Focus", 
    description: "Videos to enhance your concentration and persistence" 
  },
  timemanagement: { 
    icon: <Droplet className="category-icon text-teal-500" />, 
    title: "Time Management", 
    description: "Learn to make the most of your time effectively" 
  },
  goals: { 
    icon: <Heart className="category-icon text-purple-500" />, 
    title: "Goals", 
    description: "Motivational videos to help you set and achieve goals" 
  }
};

const Motivation = () => {
  const [activeCategory, setActiveCategory] = useState("tedx");
  const [quote, setQuote] = useState("");
  const [author, setAuthor] = useState("");

  useEffect(() => {
    fetchQuote();
  }, []);

  const fetchQuote = async () => {
    try {
      const response = await fetch("http://api.quotable.io/random");
      const data = await response.json();
      setQuote(data.content);
      setAuthor(data.author);
    } catch (error) {
      console.error("Error fetching quote:", error);
    }
  };

  return (
    <div className="motivation-container">
      {/* Sticky Header */}
      <div className="motivation-sticky-header">
        <section className="motivation-header">
          <h1 className="header-title">Motivation Sanctuary</h1>
          <p className="header-description">
            Fuel your mind with inspirational quotes and motivational videos to empower your growth and productivity.
          </p>

          {/* Quote Box */}
          <div className="quote-box">
            <div className="quote-icon">
              <Quote size={36} />
            </div>
            <p className="quote-text">{quote}</p>
            {author && <p className="quote-author">— {author}</p>}
            <button className="quote-button" onClick={fetchQuote}>
              New Quote
            </button>
          </div>

          {/* Category Navigation */}
          <div className="category-navigation">
            {Object.keys(motivationalVideos).map((category) => (
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
          <div>
            <h2 className="category-title">{categoryConfig[activeCategory].title}</h2>
            <p className="category-description">{categoryConfig[activeCategory].description}</p>
          </div>
        </div>

        <div className="video-grid">
          {motivationalVideos[activeCategory].map((video) => (
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

export default Motivation;