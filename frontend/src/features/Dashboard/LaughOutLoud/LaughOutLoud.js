import React, { useState } from "react";
import { VideoPlayer } from "../VideoPlayer";
import { 
  Smile, 
  Cat, 
  Film, 
} from 'lucide-react';
import "./LaughOutLoud.css";

// Funny video categories
const funnyVideos = {
  animation: [
    { id: "_gJ2huEmO8", title: "Funny Animation Compilation", description: "Hilarious animated clips to brighten your day", duration: "1 min" },
    { id: "eQqdkEU_bng", title: "Cartoon Laughs", description: "Side-splitting cartoons for all ages", duration: "1 min" },
    { id: "jNb-wvzw1bk", title:"Cartoon Funny Compilation", description:"Why Mum!", duration:"1 min"},
    { id: "qe3lzbs47UY", title: "Funny Animation Compilation", description: "Hilarious animated clips to brighten your day", duration: "1 min" },
    { id: "V1RsvhU7MiA", title: "Cartoon Laughs", description: "Side-splitting cartoons for all ages", duration: "1 min" },
    { id: "5BjMwac6PZ0", title:"Cartoon Funny Compilation", description:"Why Mum!", duration:"1 min"}
  ],
  animals: [
    { id: "Po098TRdOn4", title: "Funny Animal Videos", description: "Watch animals being unexpectedly funny", duration: "1 min" },
    { id: "psw2oBWCCbs", title: "Cute and Hilarious Pets", description: "Adorable and mischievous pet moments", duration: "1 min" },
    { id: "B-iu0883-Iw", title: "Funny Animal Videos", description: "Watch animals being unexpectedly funny", duration: "1 min" },
    { id: "NU44H49f7I8", title: "Cute and Hilarious Pets", description: "Adorable and mischievous pet moments", duration: "1 min" },
    { id: "PAORQoMvSdY", title: "Funny Animal Videos", description: "Watch animals being unexpectedly funny", duration: "1 min" },
    { id: "z6EchXyieos", title: "Cute and Hilarious Pets", description: "Adorable and mischievous pet moments", duration: "1 min" },
  ],
  emojis: [
    { id: "uT8wT34BrIs", title: "Emoji Faces in Real Life", description: "Laugh with emoji-inspired antics", duration: "1 min" },
    { id: "r0bqGUydUZc", title: "Funny Emoji Videos Compilation", description: "Emoji humor guaranteed to crack you up", duration: "2 mins" },
    { id: "bb2M-8Rrmjs", title: "Emoji Faces in Real Life", description: "Laugh with emoji-inspired antics", duration: "1 min" },
    { id: "t4T6iQl_Gvc", title: "Funny Emoji Videos Compilation", description: "Emoji humor guaranteed to crack you up", duration: "2 mins" },
    { id: "505qgfV9KtY", title: "Emoji Faces in Real Life", description: "Laugh with emoji-inspired antics", duration: "1 min" },
    { id: "GeB95EreenQ", title: "Funny Emoji Videos Compilation", description: "Emoji humor guaranteed to crack you up", duration: "2 mins" },
  ],
};

// Category configuration for styling and icons
const categoryConfig = {
  animation: { 
    icon: <Film className="category-icon text-yellow-500" />, 
    title: "Funny Animation Videos", 
    description: "Enjoy the best animated humor" 
  },
  animals: { 
    icon: <Cat className="category-icon text-green-500" />, 
    title: "Funny Animal Videos", 
    description: "Hilarious moments with animals" 
  },
  emojis: { 
    icon: <Smile className="category-icon text-blue-500" />, 
    title: "Funny Emoji Videos", 
    description: "Creative and laughable emoji moments" 
  }
};

const LaughOutLoud = () => {
  const [activeCategory, setActiveCategory] = useState("animation");

  return (
    <div className="laugh-container">
      {/* Sticky Header */}
      <div className="laugh-sticky-header">
        <section className="laugh-header">
          <h1 className="header-title">Laugh Out Loud</h1>
          <p className="header-description">
            Explore hilarious jokes and funny videos across various categories to lift your mood and brighten your day.
          </p>

          {/* Category Navigation */}
          <div className="category-navigation">
            {Object.keys(funnyVideos).map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`category-button ${activeCategory === category ? "active" : ""}`}
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
          {funnyVideos[activeCategory].map((video) => (
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

export default LaughOutLoud;