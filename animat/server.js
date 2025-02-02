const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI="mongodb+srv://snakkala:HYDhyd12345@cluster0.9pplw.mongodb.net/", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// Define User Schema
const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
});

const User = mongoose.model("User", UserSchema);

// Login API
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });

    if (user) {
        res.json({ success: true, message: "Login Successful" });
    } else {
        res.status(401).json({ success: false, message: "Invalid Credentials" });
    }
});
app.get("/add-test-user", async (req, res) => {
    const testUser = new User({ username: "test", password: "1234" });
    await testUser.save();
    res.send("Test user added!");
});
// User Registration API
app.post("/register", async (req, res) => {
    const { username, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
        return res.status(400).json({ success: false, message: "Username already taken" });
    }

    // Save user to database
    const newUser = new User({ username, password });
    await newUser.save();

    res.json({ success: true, message: "Registration successful! You can now log in." });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
