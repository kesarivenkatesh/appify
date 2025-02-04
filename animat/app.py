from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from pymongo import MongoClient

app = Flask(__name__, static_folder="static")
CORS(app)  # Enable CORS for all routes

# MongoDB connection
client = MongoClient("mongodb+srv://happifyUser:GIThub12345@happify-cluster.edfsn.mongodb.net/")
db = client["happify-database"]  # Replace with your database name
users_collection = db["users"]  # Collection for users

# Serve HTML files
@app.route("/")
def index():
    return send_from_directory("static", "login.html")

@app.route("/register")
def register_page():
    return send_from_directory("static", "register.html")

# Serve static files (CSS, JS, images, etc.)
@app.route("/<path:filename>")
def static_files(filename):
    return send_from_directory("static", filename)

# User Registration API
@app.route("/api/register", methods=["POST"])
def register():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    # Check if username and password are provided
    if not username or not password:
        return jsonify({"success": False, "message": "Username and password are required."}), 400

    # Check if user already exists
    existing_user = users_collection.find_one({"username": username})
    if existing_user:
        return jsonify({"success": False, "message": "Username already taken"}), 400

    # Save new user to the database
    new_user = {"username": username, "password": password}
    users_collection.insert_one(new_user)

    return jsonify({"success": True, "message": "Registration successful! You can now log in."}), 201

# User Login API
@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    # Check if username and password are provided
    if not username or not password:
        return jsonify({"success": False, "message": "Please provide both username and password."}), 400

    # Find the user in the database
    user = users_collection.find_one({"username": username})
    if not user:
        return jsonify({"success": False, "message": "Invalid credentials"}), 400

    # Check if the password matches
    if user["password"] != password:
        return jsonify({"success": False, "message": "Invalid credentials"}), 400

    # Login successful
    return jsonify({"success": True, "message": "Login successful!"}), 200

# Start server
if __name__ == "__main__":
    app.run(debug=True, port=5000)