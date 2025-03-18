import React, { useState } from 'react';
import { VideoPlayer } from '../VideoPlayer';

const allJokes = [
  { setup: "Why don't scientists trust atoms?", punchline: "Because they make up everything!" },
  { setup: "What did the grape say when it got stepped on?", punchline: "Nothing, it just let out a little wine!" },
  { setup: "Why did the scarecrow win an award?", punchline: "Because he was outstanding in his field!" },
  { setup: "What do you call a bear with no teeth?", punchline: "A gummy bear!" },
  { setup: "What do you call a fake noodle?", punchline: "An impasta!" },
  { setup: "Why did the cookie go to the doctor?", punchline: "Because it was feeling crumbly!" }
];

const allVideos = [
  { id: 'VB4CCHHYOqY', title: 'Best Funny Videos Compilation' },
  { id: 'DODLEX4zzLQ', title: 'Try Not To Laugh Challenge' },
  { id: 'i_gJ2huEmO8', title: 'Try Not To Laugh Challenge 1' },
  { id: 'eQqdkEU_bng', title: 'Try Not To Laugh Challenge 2' },
  { id: '4pVaDM_BwIA', title: 'Try Not To Laugh Challenge 3' },
  { id: '1AIXo0PXC-w', title: 'Try Not To Laugh Challenge 4' }
];

const LaughOutLoud = () => {
  const [currentJokeIndex, setCurrentJokeIndex] = useState(0);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [showPunchline, setShowPunchline] = useState(false);

  const getNextJoke = () => {
    setCurrentJokeIndex((prevIndex) => 
      prevIndex === allJokes.length - 1 ? 0 : prevIndex + 1
    );
    setShowPunchline(false);
  };

  const getNextVideo = () => {
    setCurrentVideoIndex((prevIndex) => 
      prevIndex === allVideos.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="space-y-8">
      <section className="bg-white rounded-lg shadow-md p-14">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Daily Jokes</h2>
          <button 
            onClick={getNextJoke}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
          >
            New Joke
          </button>
        </div>
        <div className="bg-yellow-50 p-6 rounded-lg">
          <p className="text-lg font-medium mb-4">{allJokes[currentJokeIndex].setup}</p>
          {!showPunchline ? (
            <button 
              onClick={() => setShowPunchline(true)}
              className="px-4 py-2 bg-yellow-400 text-yellow-900 rounded-lg hover:bg-yellow-500 transition-colors"
            >
              Reveal Punchline
            </button>
          ) : (
            <p className="text-lg text-yellow-600">{allJokes[currentJokeIndex].punchline}</p>
          )}
        </div>
      </section>

      <section className="bg-white rounded-lg shadow-md p-14">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Funny Videos</h2>
          <button 
            onClick={getNextVideo}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
          >
            Next Video
          </button>
        </div>
        <div className="w-3/4 h-1/4 mx-auto flex flex-col justify-center">
          <VideoPlayer 
            videoId={allVideos[currentVideoIndex].id} 
            title={allVideos[currentVideoIndex].title} 
          />
          <h3 className="mt-2 text-lg font-semibold">{allVideos[currentVideoIndex].title}</h3>
        </div>
      </section>
    </div>
  );
};

export default LaughOutLoud;