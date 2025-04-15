import axios from 'axios';

class UserProfileService {
    async getProfile() {
        try {
            const response = await axios.get('/api/user/profile', {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching user profile:", error);
            throw error;
        }
    }

    async updateProfile(profileData) {
        try {
            const response = await axios.put('/api/user/profile', profileData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error updating user profile:", error);
            throw error;
        }
    }

    async changePassword(passwordData) {
        try {
            const response = await axios.put('/api/user/change-password', passwordData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error changing password:", error);
            throw error;
        }
    }

    async deleteAccount() {
        try {
            const response = await axios.delete('/api/user/profile', {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error deleting account:", error);
            throw error;
        }
    }

    async getActivityHistory(limit = 20) {
        try {
            const response = await axios.get('/api/user/activity-history', {
                params: { limit },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching activity history:", error);
            throw error;
        }
    }

    async getWatchedVideos(limit = 10) {
        try {
            const response = await axios.get('/api/user/watched-videos', {
                params: { limit },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching watched videos:", error);
            throw error;
        }
    }

    async getMoodHistory(days = 30) {
        try {
            const response = await axios.get('/moods', {
                params: { days },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching mood history:", error);
            throw error;
        }
    }

    async getDashboardStats() {
        try {
            const response = await axios.get('/user/dashboard-stats', {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
            throw error;
        }
    }
}

export default UserProfileService;