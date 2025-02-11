from flask import Flask, request, session, jsonify
from pymongo import MongoClient
import base64
from flask_cors import CORS
import os
from dotenv import load_dotenv


app = Flask(__name__)
CORS(app, origins="http://localhost:3000")

load_dotenv()
connection = MongoClient(os.getenv("CONNECTION_STRING"))

@app.post("/register")
def insert_user():
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
    
    creds, error_message = get_username_password_from_request()

    if creds:
        username = creds.get("username")
        password = creds.get("password")
        # check if username already exists
        # push to database
        return jsonify({"message": "User registered successfully"}), 201
    else:
        return jsonify({"error": error_message}), 401



@app.post("/login")
def get_user():
    pass

if __name__=="__main__":
    app.run(port=8004, debug=True)
