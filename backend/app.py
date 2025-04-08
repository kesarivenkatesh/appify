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
from collections import Counter

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
moods_collection = db["moods"]  # Collection for mood tracking
music_collection = db["music"]
activity_collection = db["user_activity"]  # New collection for tracking user activity

# Create unique index for username
users_collection.create_index("username", unique=True)

def get_auth_user():
    return session.get('user')

# Helper function to record user activity
def record_activity(username, activity_type):
    """
    Record a user activity to track engagement
    activity_type: string - 'journal', 'mood', 'login', etc.
    """
    try:
        activity_collection.insert_one({
            "username": username,
            "activity_type": activity_type,
            "timestamp": datetime.datetime.now()
        })
    except Exception as e:
        app.logger.error(f"Failed to record activity: {str(e)}")
        # Don't throw error to avoid disrupting main functionality

# Helper function to calculate user streak
def calculate_streak(username):
    """
    Calculate the current streak for a user
    Returns the number of consecutive days with activity
    """
    try:
        today = datetime.datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        
        # Get all user activities
        all_activities = list(activity_collection.find({
            "username": username
        }).sort("timestamp", -1))
        
        if not all_activities:
            return 0
            
        # Group activities by day
        activity_days = {}
        for activity in all_activities:
            day = activity['timestamp'].replace(hour=0, minute=0, second=0, microsecond=0)
            activity_days[day] = True
            
        # Sort days in descending order
        days = sorted(activity_days.keys(), reverse=True)
        
        # Check if user has activity today
        if not days or (today - days[0]).days > 0:
            # If no activity today, check if there was activity yesterday
            yesterday = today - datetime.timedelta(days=1)
            if not days or (yesterday - days[0]).days > 0:
                # No activity yesterday either, streak is 0
                return 0
        
        # Count consecutive days
        streak = 1  # Start with 1 for the most recent day with activity
        for i in range(len(days) - 1):
            if (days[i] - days[i+1]).days == 1:
                # Days are consecutive
                streak += 1
            else:
                # Found a gap
                break
                
        return streak
        
    except Exception as e:
        app.logger.error(f"Failed to calculate streak: {str(e)}")
        return 0

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
            session['user'] = username
            
            # Record login activity
            record_activity(username, 'login')
            
            response = make_response(jsonify({"message": "Login successful"}), 200)
            response.set_cookie('valid', 'true', httponly=False)
            return response
        else:
            return jsonify({"error": error_message}), 401
    else:
        return jsonify({"error": error_message}), 401
    
@app.route('/logout')
def logout():
    if 'user' in session:
        # Record logout activity
        record_activity(session['user'], 'logout')
    
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
        
        # Record journal activity
        record_activity(session['user'], 'journal')
        
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
        
        # Record journal update activity
        record_activity(session['user'], 'journal_update')
        
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
            # Record journal deletion activity
            record_activity(session['user'], 'journal_delete')
            
            return jsonify({"message": "Journal entry deleted successfully"}), 200
        else:
            return jsonify({"error": "Journal entry not found or you do not have permission to delete it"}), 404
    except Exception as e:
        return jsonify({"error": f"Failed to delete journal entry: {str(e)}"}), 500

# =========== MOOD TRACKING API ENDPOINTS ===========

@app.route('/moods', methods=['POST'])
def log_mood():
    """Log a new mood for the current user"""
    if 'user' not in session:
        return jsonify({"error": "Not logged in"}), 403
    
    try:
        mood_data = request.get_json()
        if not mood_data or 'mood' not in mood_data:
            return jsonify({"error": "Invalid mood data"}), 400
        
        # Add username and timestamp if not provided
        mood_data['username'] = session['user']
        if 'timestamp' not in mood_data:
            mood_data['timestamp'] = datetime.datetime.now().isoformat()
        else:
            # Ensure timestamp is a datetime object if it's a string
            if isinstance(mood_data['timestamp'], str):
                mood_data['timestamp'] = datetime.datetime.fromisoformat(mood_data['timestamp'])
        
        # Insert the mood entry
        result = moods_collection.insert_one(mood_data)
        
        # Record mood log activity
        record_activity(session['user'], 'mood_log')
        
        return jsonify({
            "message": "Mood logged successfully",
            "mood_id": str(result.inserted_id)
        }), 201
    
    except Exception as e:
        return jsonify({"error": f"Failed to log mood: {str(e)}"}), 500

@app.route('/moods', methods=['GET'])
def get_mood_history():
    """Get mood history for the current user"""
    if 'user' not in session:
        return jsonify({"error": "Not logged in"}), 403
    
    try:
        username = session['user']
        
        # Optional date range filtering
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        query = {"username": username}
        
        if start_date:
            query["timestamp"] = {"$gte": datetime.datetime.fromisoformat(start_date)}
        
        if end_date:
            if "timestamp" not in query:
                query["timestamp"] = {}
            query["timestamp"]["$lte"] = datetime.datetime.fromisoformat(end_date)
        
        # Get mood history, sorted by timestamp descending (newest first)
        mood_history = list(moods_collection.find(query).sort("timestamp", -1))
        
        # Convert to JSON
        mood_history = json.loads(json_util.dumps(mood_history))
        
        return jsonify(mood_history), 200
    
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve mood history: {str(e)}"}), 500

@app.route('/moods/trend', methods=['GET'])
def get_mood_trend():
    """Calculate and return the user's mood trend"""
    if 'user' not in session:
        return jsonify({"error": "Not logged in"}), 403
    
    try:
        username = session['user']
        
        # Get the past 7 days of moods
        seven_days_ago = datetime.datetime.now() - datetime.timedelta(days=7)
        
        recent_moods = list(moods_collection.find({
            "username": username,
            "timestamp": {"$gte": seven_days_ago}
        }).sort("timestamp", -1))
        
        # Default response if no moods are found
        if not recent_moods:
            return jsonify({
                "trend": "neutral",
                "description": "No recent mood data"
            }), 200
        
        # Extract the mood values
        mood_values = [mood.get('mood') for mood in recent_moods]
        
        # Calculate the most common mood
        most_common_mood = Counter(mood_values).most_common(1)[0][0]
        
        # Check if there's a trend (improving or declining)
        if len(mood_values) >= 3:
            # Simple algorithm to determine trend
            # Define mood ranks from negative to positive
            mood_ranks = {
                'sad': -2,
                'tired': -1,
                'neutral': 0,
                'energetic': 1,
                'happy': 2
            }
            
            # Get the ranks of the last 3 moods
            recent_ranks = [mood_ranks.get(mood, 3) for mood in mood_values[:3]]
            
            # Check if consistently improving
            if recent_ranks[0] > recent_ranks[1] > recent_ranks[2]:
                trend = "improving"
                description = "Your mood is improving"
            # Check if consistently declining
            elif recent_ranks[0] < recent_ranks[1] < recent_ranks[2]:
                trend = "sad"  # Using "sad" as the trend identifier for declining
                description = "Your mood is declining"
            # Check if fluctuating significantly
            elif max(recent_ranks) - min(recent_ranks) >= 3:
                trend = "fluctuating"
                description = "Your mood has been fluctuating"
            else:
                # Default to the most common mood
                trend = most_common_mood
                description = f"Your mood has been mostly {most_common_mood}"
        else:
            trend = most_common_mood
            description = f"Your recent mood: {most_common_mood}"
        
        return jsonify({
            "trend": trend,
            "description": description,
            "mostCommonMood": most_common_mood,
            "recentMoods": mood_values[:5]  # Include the 5 most recent moods
        }), 200
    
    except Exception as e:
        return jsonify({"error": f"Failed to calculate mood trend: {str(e)}"}), 500

@app.route('/moods/last', methods=['GET'])
def get_last_mood():
    """Get the user's most recent mood"""
    if 'user' not in session:
        return jsonify({"error": "Not logged in"}), 403
    
    try:
        username = session['user']
        
        # Get the most recent mood
        last_mood = moods_collection.find_one(
            {"username": username},
            sort=[("timestamp", -1)]
        )
        
        if not last_mood:
            return jsonify({
                "mood": "neutral",
                "timestamp": None
            }), 200
        
        # Convert to JSON
        last_mood = json.loads(json_util.dumps(last_mood))
        
        return jsonify(last_mood), 200
    
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve last mood: {str(e)}"}), 500

# =========== USER ACTIVITY & STREAK API ENDPOINTS ===========

@app.route('/user/streak', methods=['GET'])
def get_user_streak():
    """Get the current user's streak (consecutive days of activity)"""
    if 'user' not in session:
        return jsonify({"error": "Not logged in"}), 403
    
    try:
        username = session['user']
        streak = calculate_streak(username)
        
        return jsonify({
            "streak": streak,
            "unit": "days"
        }), 200
    
    except Exception as e:
        return jsonify({"error": f"Failed to calculate streak: {str(e)}"}), 500

@app.route('/user/last-activity', methods=['GET'])
def get_last_activity():
    """Get the user's last activity time and type"""
    if 'user' not in session:
        return jsonify({"error": "Not logged in"}), 403
    
    try:
        username = session['user']
        
        # Get the most recent activity
        last_activity = activity_collection.find_one(
            {"username": username},
            sort=[("timestamp", -1)]
        )
        
        if not last_activity:
            return jsonify({
                "lastActivity": None,
                "relativeTime": "No activity yet",
                "activityType": None
            }), 200
        
        # Format the timestamp for relative time display
        now = datetime.datetime.now()
        activity_time = last_activity['timestamp']
        time_diff = now - activity_time
        
        # Create a human-readable relative time
        if time_diff.days > 0:
            relative_time = f"{time_diff.days} days ago"
        elif time_diff.seconds >= 3600:
            hours = time_diff.seconds // 3600
            relative_time = f"{hours} hour{'s' if hours > 1 else ''} ago"
        elif time_diff.seconds >= 60:
            minutes = time_diff.seconds // 60
            relative_time = f"{minutes} minute{'s' if minutes > 1 else ''} ago"
        else:
            relative_time = "just now"
        
        # Convert to JSON
        activity_data = {
            "lastActivity": json.loads(json_util.dumps(activity_time)),
            "relativeTime": relative_time,
            "activityType": last_activity['activity_type']
        }
        
        return jsonify(activity_data), 200
    
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve last activity: {str(e)}"}), 500

@app.route('/user/dashboard-stats', methods=['GET'])
def get_dashboard_stats():
    """Get combined dashboard statistics for the current user"""
    if 'user' not in session:
        return jsonify({"error": "Not logged in"}), 403
    
    try:
        username = session['user']
        
        # Get journal count
        journal_count = journals_collection.count_documents({'username': username})
        
        # Get streak
        streak = calculate_streak(username)
        
        # Get last activity
        last_activity = activity_collection.find_one(
            {"username": username},
            sort=[("timestamp", -1)]
        )
        
        # Format relative time for last activity
        relative_time = "No activity yet"
        if last_activity:
            now = datetime.datetime.now()
            activity_time = last_activity['timestamp']
            time_diff = now - activity_time
            
            if time_diff.days > 0:
                relative_time = f"{time_diff.days} days ago"
            elif time_diff.seconds >= 3600:
                hours = time_diff.seconds // 3600
                relative_time = f"{hours} hour{'s' if hours > 1 else ''} ago"
            elif time_diff.seconds >= 60:
                minutes = time_diff.seconds // 60
                relative_time = f"{minutes} minute{'s' if minutes > 1 else ''} ago"
            else:
                relative_time = "just now"
        
        # Get mood trend
        seven_days_ago = datetime.datetime.now() - datetime.timedelta(days=7)
        recent_moods = list(moods_collection.find({
            "username": username,
            "timestamp": {"$gte": seven_days_ago}
        }).sort("timestamp", -1))
        
        mood_trend = {
            "trend": "neutral",
            "description": "No recent mood data"
        }
        
        if recent_moods:
            mood_values = [mood.get('mood') for mood in recent_moods]
            most_common_mood = Counter(mood_values).most_common(1)[0][0]
            
            if len(mood_values) >= 3:
                mood_ranks = {
                    'sad': -2,
                    'tired': -1,
                    'neutral': 0,
                    'energetic': 1,
                    'happy': 2
                }
                
                recent_ranks = [mood_ranks.get(mood, 3) for mood in mood_values[:3]]
                
                if recent_ranks[0] > recent_ranks[1] > recent_ranks[2]:
                    mood_trend["trend"] = "improving"
                    mood_trend["description"] = "Your mood is improving"
                elif recent_ranks[0] < recent_ranks[1] < recent_ranks[2]:
                    mood_trend["trend"] = "sad"
                    mood_trend["description"] = "Your mood is declining"
                elif max(recent_ranks) - min(recent_ranks) >= 3:
                    mood_trend["trend"] = "fluctuating"
                    mood_trend["description"] = "Your mood has been fluctuating"
                else:
                    mood_trend["trend"] = most_common_mood
                    mood_trend["description"] = f"Your mood has been mostly {most_common_mood}"
            else:
                mood_trend["trend"] = most_common_mood
                mood_trend["description"] = f"Your recent mood: {most_common_mood}"
        
        # Combine all stats
        dashboard_stats = {
            "journalCount": journal_count,
            "streak": streak,
            "lastActivity": relative_time,
            "moodTrend": mood_trend
        }
        
        return jsonify(dashboard_stats), 200
    
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve dashboard stats: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(port=8000, debug=True)