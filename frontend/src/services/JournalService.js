import axios from 'axios';

class JournalService {
  /**
   * Fetch journal entries with optional time range filtering
   * This method correctly processes the response from your backend API
   */
  async getJournalEntries(params = {}) {
    try {
      // Get all journal entries
      const response = await axios.get("/journal", {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });

      // Get entries from response
      let entries = response.data || [];
      
      // Ensure entries is an array
      if (!Array.isArray(entries)) {
        console.warn('Journal entries response is not an array:', entries);
        entries = [];
      }
      
      // Apply time range filtering if specified
      if (params.timeRange) {
        entries = this.filterEntriesByTimeRange(entries, params.timeRange);
      }
      
      // Normalize entry format to ensure consistency
      const normalizedEntries = entries.map(entry => this.normalizeJournalEntry(entry));
      
      return { data: normalizedEntries };
    } catch (error) {
      console.error("Error fetching journal entries:", error);
      // Return empty array on error instead of throwing
      return { data: [] };
    }
  }
  
  /**
   * Normalize journal entry structure to handle different possible formats
   */
  normalizeJournalEntry(entry) {
    // Create a normalized copy of the entry
    const normalized = { ...entry };
    
    // Ensure date is in a consistent format
    if (entry.date) {
      // Keep the original date format but ensure it's accessible
      normalized.date = entry.date;
    } else if (entry.timestamp) {
      // Use timestamp as fallback
      normalized.date = {
        $date: typeof entry.timestamp === 'string' ? entry.timestamp : entry.timestamp
      };
    } else {
      // Last resort: current date
      normalized.date = {
        $date: new Date().toISOString()
      };
    }
    
    // Ensure mood is set
    if (!entry.mood && entry.emotions && entry.emotions.primary) {
      normalized.mood = entry.emotions.primary;
    } else if (!entry.mood) {
      normalized.mood = 'neutral';
    }
    
    // Ensure content is a string
    if (!entry.content) {
      normalized.content = '';
    }
    
    // Ensure tags is an array
    if (!entry.tags || !Array.isArray(entry.tags)) {
      normalized.tags = [];
    }
    
    return normalized;
  }
  
  /**
   * Filter journal entries by time range
   */
  filterEntriesByTimeRange(entries, timeRange) {
    const now = new Date();
    
    return entries.filter(entry => {
      // Handle different date formats
      let entryDate;
      if (entry.date && entry.date.$date) {
        entryDate = new Date(entry.date.$date);
      } else if (typeof entry.date === 'string') {
        entryDate = new Date(entry.date);
      } else if (entry.timestamp) {
        entryDate = new Date(entry.timestamp);
      } else {
        // Skip entries with no valid date
        return false;
      }
      
      // Skip invalid dates
      if (isNaN(entryDate.getTime())) {
        return false;
      }
      
      switch(timeRange) {
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return entryDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          return entryDate >= monthAgo;
        case 'year':
          const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          return entryDate >= yearAgo;
        default:
          return true; // 'all' time range
      }
    });
  }
  
  // Rest of your existing methods
  async getJournalCount() {
    try {
      const response = await axios.get('/journal/count', {
        withCredentials: true
      });
      return response.data.count;
    } catch (error) {
      console.error('Error fetching user journals count:', error);
      return 0; // Return 0 instead of null
    }
  }
  
  async create(journalDetails) {
    try {
      const response = await axios.post("/journal", journalDetails, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      return response;
    } catch(error) {
      console.error("Journal create error: ", error);
      throw error;
    }
  }
  
  async read() {
    try {
      const response = await axios.get("/journal", {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      return response;
    } catch(error) {
      console.error("Journal read error: ", error);
      throw error;
    }
  }
  
  async update(journalDetails) {
    try {
      const response = await axios.put("/journal", journalDetails, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      return response;
    } catch(error) {
      console.error("Journal update error: ", error);
      throw error;
    }
  }
  
  async delete(journalDetails) {
    try {
      const body = {"_id": journalDetails._id};
      const response = await axios.delete("/journal", {
        headers: {
          'Content-Type': 'application/json'
        },
        data: body,
        withCredentials: true
      });
      return response;
    } catch(error) {
      console.error("Journal delete error: ", error);
      throw error;
    }
  }
}

export default JournalService;