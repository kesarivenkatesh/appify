import axios from 'axios';

class DashboardService {
  async getDashboardStats() {
    try {
      const response = await axios.get('/user/dashboard-stats', {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }
}

export default DashboardService;