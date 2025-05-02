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
   * Get video recommendations based on a current mood
   * @param {string} mood - The current mood to get recommendations for
   * @returns {Promise} Promise with recommended videos
   */
  async getRecommendedVideos(mood = 'neutral') {
    try {
      const response = await this.axiosInstance.get('/videos/by-mood/' + mood);
      return response.data.videos || [];
    } catch (error) {
      console.error('Error fetching video recommendations:', error);
      
      // If the API endpoint fails, try the recommendations endpoint as fallback
      try {
        const fallbackResponse = await this.axiosInstance.get('/videos/recommendations', {
          params: { mood }
        });
        return fallbackResponse.data.videos || [];
      } catch (fallbackError) {
        console.error('Error fetching fallback recommendations:', fallbackError);
        return [];
      }
    }
  }
  
  /**
   * Get popular videos
   * @param {number} limit - Maximum number of videos to return
   * @returns {Promise} Promise with popular videos
   */
  async getPopularVideos(limit = 6) {
    try {
      const response = await this.axiosInstance.get('/videos/popular', {
        params: { limit }
      });
      return response.data.videos || [];
    } catch (error) {
      console.error('Error fetching popular videos:', error);
      return [];
    }
  }
  
  /**
   * Log a video interaction (view, like, complete, etc.)
   * @param {string} videoId - The ID of the video
   * @param {string} interactionType - The type of interaction (view, like, complete)
   * @param {number} watchedDuration - Duration watched in seconds (optional)
   * @returns {Promise} Promise indicating success/failure
   */
  async logVideoInteraction(videoId, interactionType, watchedDuration = 0) {
    try {
      const response = await this.axiosInstance.post('/videos/interaction', {
        videoId,
        interactionType,
        watchedDuration
      });
      return response.data;
    } catch (error) {
      console.error('Error logging video interaction:', error);
      return null;
    }
  }
}

export default VideoService;