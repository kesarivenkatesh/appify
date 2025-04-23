import axios from 'axios';

class UserProfileService {
    constructor() {
        this.axiosInstance = axios.create({
          baseURL: 'http://happify.kentcs.org:8000',
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        });
    }

    async getProfile() {
        try {
            const response = await this.axiosInstance.get('/api/user/profile');
            return response.data;
        } catch (error) {
            console.error("Error fetching user profile:", error);
            throw error;
        }
    }

    async updateProfile(profileData) {
        try {
            const response = await this.axiosInstance.put('/api/user/profile', profileData);
            return response.data;
        } catch (error) {
            console.error("Error updating user profile:", error);
            throw error;
        }
    }

    async changePassword(passwordData) {
        try {
            const response = await this.axiosInstance.put('/api/user/change-password', passwordData);
            return response.data;
        } catch (error) {
            console.error("Error changing password:", error);
            throw error;
        }
    }

    async deleteAccount() {
        try {
            const response = await this.axiosInstance.delete('/api/user/profile');
            return response.data;
        } catch (error) {
            console.error("Error deleting account:", error);
            throw error;
        }
    }

    async getActivityHistory(limit = 20) {
        try {
            const response = await this.axiosInstance.get('/api/user/activity-history', {
                params: { limit }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching activity history:", error);
            throw error;
        }
    }

    async getWatchedVideos(limit = 10) {
        try {
            const response = await this.axiosInstance.get('/api/user/watched-videos', {
                params: { limit }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching watched videos:", error);
            throw error;
        }
    }

    async getMoodHistory(days = 30) {
        try {
            const response = await this.axiosInstance.get('/moods', {
                params: { days }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching mood history:", error);
            throw error;
        }
    }

    async getDashboardStats() {
        try {
            const response = await this.axiosInstance.get('/user/dashboard-stats');
            return response.data;
        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
            throw error;
        }
    }
}

export default UserProfileService;