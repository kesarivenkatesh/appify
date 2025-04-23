import axios from 'axios';

class VideoService {
  constructor() {
    this.axiosInstance = axios.create({
      baseURL: 'http://happify.kentcs.org:8000',
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
  /** 
   * Video service for retrieving video recommendations based on mood
   */

  async getRecommendedVideos(mood) {
    try {
      const response = await this.axiosInstance.get(`/videos/recommendations`, {
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
      const response = await this.axiosInstance.get(`/videos/by-mood/${mood}`, {
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
      const response = await this.axiosInstance.get(`/videos/popular`, {
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
      
      const response = await this.axiosInstance.post(`/videos/interaction`, payload, {
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
   /**
   * Get user's watched videos
   * @param {number} limit - Maximum number of videos to return
   * @returns {Promise} Promise with watched videos
   */
   async getWatchedVideos(limit = 10) {
    try {
      const response = await this.axiosInstance.get('/user/watched-videos', {
        params: { limit }
      });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching watched videos:', error);
      return [];
    }
  }
}

export default VideoService;

