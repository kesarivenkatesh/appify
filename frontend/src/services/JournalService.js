import axios from 'axios';

class JournalService {
    /** 
     * journalDetails = {
        * id,
        * content,
        * mood,
        * tags,
        * date
     * }
    */
    
    async create(journalDetails) {
        try {
            const response = await axios.post("/journal", journalDetails, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response;
        } catch(error) {
            console.error("Journal create error: ", error);
            throw error;
        }
    }

    async read(journalId) {
        try {
            const response = await axios.get("/journal", {
                headers: {
                    'Content-Type': 'application/json'
                }
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
                }
            });
            return response;
        } catch(error) {
            console.error("Journal update error: ", error);
            throw error;
        }
    }

    async delete(journalDetails) {
        try {
            console.log("journal: ", journalDetails.title);
            const body = {"title": journalDetails.title}
            const response = await axios.delete("/journal", {
                headers: {
                    'Content-Type': 'application/json'
                },
                data: body
            });
            return response;
        } catch(error) {
            console.error("Journal delete error: ", error);
            throw error;
        }
    }
}

export default JournalService;