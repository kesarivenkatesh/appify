from flask import Flask, request, jsonify, Blueprint
from flask_pymongo import PyMongo
from flask_cors import CORS
import bcrypt
import jwt
import datetime
from functools import wraps
import os
from dotenv import load_dotenv
from bson.objectid import ObjectId
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
import logging
from logging.handlers import RotatingFileHandler
import time

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3007"}})


# Configure logging
if not os.path.exists('logs'):
    os.makedirs('logs')

file_handler = RotatingFileHandler('logs/app.log', maxBytes=10240, backupCount=10)
file_handler.setFormatter(logging.Formatter(
    '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
))
file_handler.setLevel(logging.INFO)
app.logger.addHandler(file_handler)
app.logger.setLevel(logging.INFO)
app.logger.info('API startup')

# MongoDB connection
try:
    client = MongoClient(
    os.getenv("MONGO_URI"),
    tls=True,
    tlsAllowInvalidCertificates=True  # This disables certificate validation
)

    client.admin.command('ismaster')  # Verify connection
    mongo = PyMongo(app, uri=os.getenv("MONGO_URI"))
except Exception as e:
    app.logger.error(f"Fatal error: Could not connect to MongoDB: {e}")
    raise

app.config["SECRET_KEY"] = os.getenv("ACCESS_TOKEN_SECRET")
if not app.config["SECRET_KEY"]:
    raise ValueError("No SECRET_KEY set in environment")

# Token authentication decorator
def authenticate_token(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if token:
            token = token.split(" ")[1] if " " in token else None

        if not token:
            return jsonify({"error": "Token is missing"}), 401

        try:
            data = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
            current_user = mongo.db.users.find_one({"_id": ObjectId(data["userId"])});
            if not current_user:
                raise jwt.InvalidTokenError("User not found")
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401
        except Exception as e:
            app.logger.error(f"Token authentication error: {e}")
            return jsonify({"error": "Authentication failed"}), 401

        return f(current_user, *args, **kwargs)
    return decorated

# Authentication Routes
auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.json
    name, email, password = data.get('name'), data.get('email'), data.get('password')

    if not all([name, email, password]):
        return jsonify({"message": "All fields are required!"}), 400
    
    if mongo.db.users.find_one({"email": email}):
        return jsonify({"message": "User already exists!"}), 400

    hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    mongo.db.users.insert_one({"name": name, "email": email, "password": hashed_pw})
    return jsonify({"message": "User created successfully!"}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    email, password = data.get('email'), data.get('password')
    user = mongo.db.users.find_one({"email": email})
    
    if not user or not bcrypt.checkpw(password.encode('utf-8'), user['password']):
        return jsonify({"error": "Invalid credentials!"}), 400
    
    token = jwt.encode({"userId": str(user['_id']), "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)}, app.config["SECRET_KEY"], algorithm="HS256")
    return jsonify({"message": "Login successful!", "token": token, "user_id": str(user['_id'])}), 200

# Journal Routes
journal_bp = Blueprint('journal', __name__)

@journal_bp.route('/journals', methods=['GET'])
@authenticate_token
def get_journals(current_user):
    journals = list(mongo.db.journals.find({"user_id": str(current_user['_id'])}))
    return jsonify([{ "id": str(journal['_id']), "title": journal['title'], "content": journal['content'] } for journal in journals])

@journal_bp.route('/journals', methods=['POST'])
@authenticate_token
def create_journal(current_user):
    data = request.json
    if not all([data.get('title'), data.get('content')]):
        return jsonify({"message": "Title and content are required!"}), 400
    
    journal_id = mongo.db.journals.insert_one({
        "user_id": str(current_user['_id']),
        "title": data['title'],
        "content": data['content'],
        "created_at": datetime.datetime.utcnow()
    }).inserted_id
    
    return jsonify({"message": "Journal created successfully!", "journal_id": str(journal_id)}), 201

@journal_bp.route('/journals/<journal_id>', methods=['DELETE'])
@authenticate_token
def delete_journal(current_user, journal_id):
    journal = mongo.db.journals.find_one({"_id": ObjectId(journal_id), "user_id": str(current_user['_id'])})
    if not journal:
        return jsonify({"message": "Journal not found or unauthorized"}), 404
    
    mongo.db.journals.delete_one({"_id": ObjectId(journal_id)})
    return jsonify({"message": "Journal deleted successfully!"}), 200

# Register Blueprints
app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(journal_bp, url_prefix='/api')

@app.route('/')
def home():
    return jsonify({"message": "API running", "status": "running", "version": "2.0"})

if __name__ == '__main__':
    port = int(os.getenv("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=os.getenv("FLASK_DEBUG", "False").lower() == "true")