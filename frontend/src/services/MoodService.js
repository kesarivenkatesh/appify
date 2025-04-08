// services/MoodService.js
import axios from 'axios';


class MoodService {
  

  // Log a new mood
  async logMood(moodData) {
    try {
      const response = await axios.post("/moods", moodData, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error logging mood:', error);
      throw error;
    }
  }

  // Get user's mood history
  async getMoodHistory() {
    try {
      const response = await axios.get("/moods", {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching mood history:', error);
      throw error;
    }
  }

  // Get user's mood trend
  async getMoodTrend() {
    try {
      const response = await axios.get(`/moods/trend`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching mood trend:', error);
      return { trend: 'neutral', description: 'Steady' }; // Default fallback
    }
  }
}

export default MoodService;