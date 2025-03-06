import axios from 'axios';

function utf8_to_b64(str) {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(new TextEncoder().encode(str))));
}

class UserService {
    
  async getCurrentUser() {
    try {
      const response = await axios.get('/api/current-user', {
        withCredentials: true  // Crucial for sending cookies
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  async register(userData) {
    try {
      const response = await axios.post('/register', {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        confirm_password: userData.confirmPassword // Match backend field name
      }, {
        headers: {
          'Content-Type': 'application/json',
          
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Registration error:', error.response?.data);
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  }

    async login(username, password) {
      try {
        const response = await axios.get("/login",{
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic '+utf8_to_b64(username+":"+password)
          }
        });
        return response;
      } catch (error) {
        console.error("Registration failed:", error);
        if (error.response) {
          console.error("Response data:", error.response.data);
          console.error("Response status:", error.response.status);
          console.error("Response headers:", error.response.headers);
        } else if (error.request) {
          console.error("Request:", error.request);
        } else {
          console.error("Error message:", error.message);
        }
        throw error;
      }
    }

    async logout() {
      try {
        const response = await axios.get("/logout");
        return response;
      } catch(error) {
        console.error(error);
      }
    }
}

export default UserService;