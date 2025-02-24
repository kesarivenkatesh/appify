import axios from 'axios';

// Replace with your MongoDB backend URL
const API_URL = 'http://127.0.0.1:8000/user';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});



export const register = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/auth/register`, userData, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    } catch (error) {
        console.error("Error registering user:", error.response?.data || error.message);
        throw error;
    }
};

// Auth
export const login = (email, password) => 
  api.post('/auth/login', { email, password });

// export const register = (email, password, name) =>
//  api.post('/auth/register', { email, password, name });

// Mood
export const saveMoodEntry = (entry) =>
  api.post('/mood', entry);

export const getMoodEntries = (userId) =>
  api.get(`/mood/${userId}`);

// Journal
export const saveJournalEntry = (entry) =>
  api.post('/journal', entry);

export const getJournalEntries = (userId) =>
  api.get(`/journal/${userId}`);

export const updateJournalEntry = async (id, data) => {
    return await axios.put(`${API_URL}/journal/${id}`, data);
};

export const deleteJournalEntry = async (id) => {
    return await axios.delete(`${API_URL}/journal/${id}`);
};

export default api;