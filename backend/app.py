import datetime
from flask import Flask, request, session, jsonify, make_response
from pymongo import MongoClient
from flask_cors import CORS
import os
from dotenv import load_dotenv
from argon2 import PasswordHasher
from bson import ObjectId, json_util
import json
from pymongo.errors import DuplicateKeyError
import base64
from bson.json_util import dumps

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", os.urandom(24))
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SECURE"] = True  # In production
CORS(app, resources={r"/*": {"origins": "http://localhost:3006"}})

load_dotenv()
connection = MongoClient(os.getenv("CONNECTION_STRING"))
db = connection["appifydb"]
users_collection = db["users"]
journals_collection = db["journals"]

music_collection = db["music"]
# Create unique index for username
users_collection.create_index("username", unique=True)

def get_auth_user():
    return session.get('user')

# Add endpoint to retrieve calming music
@app.route('/music', methods=['GET'])
def get_music():
    try:
        music_list = list(music_collection.find({"genre": "calming"}))  # Filter by genre "calming"
        music_list = json.loads(dumps(music_list))  # Convert MongoDB result to JSON format
        return jsonify({"music": music_list}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve music: {str(e)}"}), 500


@app.route('/api/current-user', methods=['GET'])
def current_user():
    if 'user' not in session:
        return jsonify({"error": "Unauthorized"}), 401
        
    return jsonify({
        "username": session['user'],
        "email": session.get('email')  # Add other session data if needed
    })

# get username and password from header
def get_username_password_from_request():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return None, "Authorization header missing"

    try:
        auth_type, encoded_creds = auth_header.split(None, 1)  # Split "Basic ..."
        if auth_type.lower() != 'basic':
            return None, "Invalid authorization type"

        decoded_creds = base64.b64decode(encoded_creds).decode('utf-8')
        username, password = decoded_creds.split(":", 1)  # Split username:password
        return {"username": username, "password": password}, None
    except (ValueError, base64.binascii.Error):
        return None, "Invalid authorization header"

@app.post("/register")
def insert_user():
    try:
        # Get and validate JSON data
        user_data = request.get_json()
        if not user_data or not isinstance(user_data, dict):
            return jsonify({"error": "Invalid request format"}), 400

        # Validate required fields
        required_fields = ['username', 'email', 'password', 'confirm_password']
        missing = [field for field in required_fields if field not in user_data]
        if missing:
            return jsonify({
                "error": "Missing required fields",
                "missing": missing
            }), 400

        # Check password match
        if user_data['password'] != user_data['confirm_password']:
            return jsonify({"error": "Passwords do not match"}), 400

        # Check existing user
        if users_collection.find_one({"username": user_data['username']}):
            return jsonify({"error": "Username already exists"}), 409

        # Hash password
        ph = PasswordHasher()
        hashed_password = ph.hash(user_data['password'])

        # Create user document
        new_user = {
            "username": user_data['username'],
            "email": user_data['email'],
            "password": hashed_password,
            "created_at": datetime.datetime.now()
        }

        # Insert user
        result = users_collection.insert_one(new_user)
        
        return jsonify({
            "message": "Registration successful",
            "user_id": str(result.inserted_id)
        }), 201

    except Exception as e:
        app.logger.error(f"Registration error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
    
@app.get("/login")
def get_user():
    if 'user' in session:
        return jsonify({"message": "Already logged in"}), 406
    creds, error_message = get_username_password_from_request()

    if creds:
        username = creds.get("username")
        password = creds.get("password")
        hashed_password = None
        # check the password with hashed password in database
        user = users_collection.find_one({"username": username})

        if user:
            hashed_password = user.get("password")
        else:
            return jsonify({"error": "Invalid username"}), 401
        
        ph = PasswordHasher()
        if hashed_password and ph.verify(hashed_password, password.encode('utf-8')):
            # if matches, return cookie with set-cookie header
            session['user']=username
            response = make_response(jsonify({"message": "Login successful"}), 200)
            response.set_cookie('valid', 'true', httponly=False)
            return response
        else:
            return jsonify({"error": error_message}), 401
    else:
        return jsonify({"error": error_message}), 401
    
@app.route('/logout')
def logout():
    response = make_response(jsonify({"message": "Logout successful"}), 200)
    session.clear()
    response.delete_cookie('valid')
    return response

# Journal endpoints
@app.post('/journal')
def create_journal():
    if 'user' not in session:
        return jsonify({"message": "Not logged in"}), 403
    try:
        journal_data = request.get_json()
        journal_data["username"] = session['user']
        journals_collection.insert_one(journal_data)
        return jsonify({"message": "Journal entry created successfully"}), 201
    except Exception as e:
        return jsonify({"error": f"Failed to create journal entry: {str(e)}"}), 500
    

@app.get('/journal')
def read_journals():
    if 'user' not in session:
        return jsonify({"message": "Not logged in"}), 403
    try:
        username = session['user']
        user_journals = list(journals_collection.find({"username": username}))
        # print(user_journals)
        user_journals = json.loads(json_util.dumps(user_journals))
        # print(user_journals)

        return user_journals, 200
    except Exception as e:
        return jsonify({"error": f"Failed to read journal entries: {str(e)}"}), 500

@app.route('/journal/count', methods=['GET'])
def journal_count():
    if 'user' not in session:
        return jsonify({"message": "Not logged in"}), 403
    try:
        username = session['user']
        count = journals_collection.count_documents({'username': username})
        return jsonify({'count': count})
    except Exception as e:
        return jsonify({"error": f"Failed to get the count of journal entries: {str(e)}"}), 500

@app.put('/journal')
def update_journal():
    if 'user' not in session:
        return jsonify({"message": "Not logged in"}), 403
    try:
        journal_data = request.get_json()
        print(journal_data)
        oid = journal_data["_id"]["$oid"]
        journalId = ObjectId(oid)
        journal_data.pop("_id")
        print(journal_data)
        journals_collection.update_one({"_id": journalId}, {"$set": journal_data})

        return jsonify({"message": "update successful"}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to update journal entries: {str(e)}"}), 500

@app.delete('/journal')
def delete_journal():
    if 'user' not in session:
        return jsonify({"message": "Not logged in"}), 403

    try:
        data = request.get_json()
        print(data)
        oid = data.get('_id').get('$oid')

        if not oid:
            return jsonify({"error": "Journal id is required"}), 400

        result = journals_collection.delete_one({"_id": ObjectId(oid)})

        if result.deleted_count == 1:
            return jsonify({"message": "Journal entry deleted successfully"}), 200
        else:
            return jsonify({"error": "Journal entry not found or you do not have permission to delete it"}), 404
    except Exception as e:
        return jsonify({"error": f"Failed to delete journal entry: {str(e)}"}), 500


if __name__ == "__main__":
    app.run(port=8000, debug=True)