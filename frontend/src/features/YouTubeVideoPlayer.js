import React, { useState } from 'react';
import PropTypes from 'prop-types';
import VideoService from '../services/VideoService';
import { X } from 'lucide-react';

/**
 * YouTube Video Player component
 * @param {Object} props Component props
 * @param {string} props.videoId YouTube video ID
 * @param {string} props.videoTitle Video title
 * @param {string} props.dbVideoId MongoDB video ID for tracking
 * @param {Function} props.onClose Function to call when closing the video
 */
const YouTubeVideoPlayer = ({ videoId, videoTitle, dbVideoId, onClose }) => {
  const [hasStarted, setHasStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Handle iframe load
  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  // Log video view when first started
  const handleVideoStarted = async () => {
    if (!hasStarted && dbVideoId) {
      setHasStarted(true);
      try {
        const videoService = new VideoService();
        await videoService.logVideoInteraction(dbVideoId, 'view', { videoTitle });
      } catch (error) {
        console.error('Error logging video view:', error);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="relative w-full max-w-4xl">
        {/* Close button */}
        <button
          className="absolute -top-10 right-0 p-2 text-white hover:text-gray-300 focus:outline-none"
          onClick={onClose}
        >
          <X size={24} />
        </button>

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="spinner"></div>
          </div>
        )}

        {/* YouTube iframe */}
        <div className="relative pb-[56.25%] h-0">
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
            title={videoTitle || 'YouTube video player'}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={handleIframeLoad}
            onPlay={handleVideoStarted}
          ></iframe>
        </div>
      </div>
    </div>
  );
};

YouTubeVideoPlayer.propTypes = {
  videoId: PropTypes.string.isRequired,
  videoTitle: PropTypes.string,
  dbVideoId: PropTypes.string,
  onClose: PropTypes.func.isRequired
};

export default YouTubeVideoPlayer;