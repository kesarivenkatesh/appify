from flask import Flask, request, session, jsonify
from pymongo import MongoClient
import base64
from flask_cors import CORS
import os
from dotenv import load_dotenv
from argon2 import PasswordHasher
from bson import ObjectId, json_util
import json

app = Flask(__name__)
app.secret_key = os.urandom(24)
CORS(app, origins="http://localhost:3006")

load_dotenv()
connection = MongoClient(os.getenv("CONNECTION_STRING"))
db = connection["appifydb"]  # Replace with your database name
users_collection = db["users"]
journals_collection = db["journals"]


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
    if 'user' in session:
        return jsonify({"message": "Already logged in"}), 406
    creds, error_message = get_username_password_from_request()

    if creds:
        username = creds.get("username")
        password = creds.get("password")
        user_data = request.get_json()
        firstname = user_data.get('firstname')
        lastname = user_data.get('lastname')
        # basic checks
        if not username or not password or not firstname or not lastname:
            return jsonify({"error": "Missing required fields"}), 400
        # check if username already exists
        if users_collection.find_one({"username": username}):
            return jsonify({"error": "Username already exists"}), 400
        # if not hash password by argon2
        ph = PasswordHasher()
        hashed_password = ph.hash(password.encode('utf-8'))
        # add details to database
        try:
            users_collection.insert_one({
                "username": username,
                "password": hashed_password,
                "firstname": firstname,
                "lastname": lastname
            })
        # else error
        except Exception as e:
            return jsonify({"error": f"Database error: {str(e)}"}), 500
        return jsonify({"message": "User registered successfully"}), 201
    else:
        return jsonify({"error": error_message}), 401

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
            return jsonify({"message": "Login successful"}), 200
        else:
            return jsonify({"error": error_message}), 401
    else:
        return jsonify({"error": error_message}), 401

@app.route('/logout')
def logout():
	session.pop('user', None)
	return jsonify({"message": "Logout successful"}), 200

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


if __name__=="__main__":
    app.run(port=8000, debug=True)
