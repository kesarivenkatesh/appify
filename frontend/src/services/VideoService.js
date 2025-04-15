import axios from 'axios';

class VideoService {
  /** 
   * Video service for retrieving video recommendations based on mood
   */

  async getRecommendedVideos(mood) {
    try {
      const response = await axios.get(`/videos/recommendations`, {
        params: { mood },
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data.videos || [];
    } catch (error) {
      console.error('Error in getRecommendedVideos:', error);
      return [];
    }
  }

  async getVideosByMood(mood) {
    try {
      const response = await axios.get(`/videos/by-mood/${mood}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data.videos || [];
    } catch (error) {
      console.error('Error in getVideosByMood:', error);
      return [];
    }
  }

  async getPopularVideos(limit = 6) {
    try {
      const response = await axios.get(`/videos/popular`, {
        params: { limit },
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data.videos || [];
    } catch (error) {
      console.error('Error in getPopularVideos:', error);
      return [];
    }
  }

  async logVideoInteraction(videoId, interactionType, extraData = {}) {
    try {
      const payload = {
        videoId,
        interactionType,
        timestamp: new Date().toISOString(),
        ...extraData
      };
      
      const response = await axios.post(`/videos/interaction`, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response;
    } catch (error) {
      console.error('Error in logVideoInteraction:', error);
      throw error;
    }
  }
}

export default VideoService;