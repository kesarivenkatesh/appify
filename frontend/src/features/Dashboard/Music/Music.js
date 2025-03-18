import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Music.css';

const Music = () => {
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/music')
      .then(response => {
        setSongs(response.data.music);
      })
      .catch(error => console.error('Error fetching songs:', error));
  }, []);

  const playSong = (song) => {
    setCurrentSong(song);
    setIsPlaying(true);
  };

  const stopSong = () => {
    setIsPlaying(false);
  };

  const getYouTubeId = (url) => {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match && match[1] ? match[1] : null;
  };

  return (
    <div className="music-container">
      <h1 className="page-title">Calming Music</h1>
      <div className="song-list">
        {songs.map(song => (
          <div key={song._id} className="song-item" onClick={() => playSong(song)}>
            <h2>{song.title}</h2>
            <p>{song.artist}</p>
          </div>
        ))}
      </div>

      {currentSong && isPlaying && (
        <div className="player">
          <h2>Now Playing: {currentSong.title} by {currentSong.artist}</h2>
          
          {/* Embed YouTube Video with title */}
          <iframe
            width="560"
            height="315"
            title={`Video of ${currentSong.title}`}
            src={`https://www.youtube.com/embed/${getYouTubeId(currentSong.url)}`}
            frameBorder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>

          <button onClick={stopSong}>Stop</button>
        </div>
      )}
    </div>
  );
};

export default Music;
