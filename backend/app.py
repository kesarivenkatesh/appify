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
videos_collection = db["videos"]
activity_collection = db["user_activity"]  # New collection for tracking user activity

# Create unique index for username
users_collection.create_index("username", unique=True)

# Define the mood intensity mapping
MOOD_INTENSITY = {
    'excited': 5,
    'happy': 4,
    'content': 3,
    'neutral': 2,
    'tired': 1,
    'anxious': 0,
    'sad': -1,
    'angry': -2
}

# Video recommendation categories based on mood
MOOD_VIDEO_MAPPING = {
    'excited': ['motivation', 'comedy', 'dance', 'energy'],
    'happy': ['inspiration', 'motivation', 'celebration', 'comedy'],
    'content': ['mindfulness', 'wellbeing', 'inspiration', 'nature'],
    'neutral': ['educational', 'informative', 'wellbeing', 'inspiration'],
    'tired': ['relaxation', 'sleep', 'meditation', 'calming'],
    'anxious': ['mindfulness', 'calming', 'breathing', 'relaxation'],
    'sad': ['uplift', 'comfort', 'mindfulness', 'nature'],
    'angry': ['calming', 'emotional-control', 'emotional-release', 'mindfulness']
}

# Default video categories if mood not recognized
DEFAULT_CATEGORIES = ['wellbeing', 'mindfulness', 'self-care', 'positive']

def get_auth_user():
    """Get the currently authenticated user from session"""
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

@app.route("/register", methods=['POST'])
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
    
@app.route("/login", methods=['GET'])
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
        if hashed_password and ph.verify(hashed_password, password):
            # if matches, return cookie with set-cookie header
            session['user'] = username
            
            # Record login activity
            record_activity(username, 'login')
            
            response = make_response(jsonify({"message": "Login successful"}), 200)
            response.set_cookie('valid', 'true', httponly=False)
            return response
        else:
            return jsonify({"error": "Invalid credentials"}), 401
    else:
        return jsonify({"error": error_message}), 401
    
@app.route('/logout', methods=['GET'])
def logout():
    if 'user' in session:
        # Record logout activity
        record_activity(session['user'], 'logout')
    
    response = make_response(jsonify({"message": "Logout successful"}), 200)
    session.clear()
    response.delete_cookie('valid')
    return response

# Journal endpoints
@app.route('/journal', methods=['POST'])
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
    

@app.route('/journal', methods=['GET'])
def read_journals():
    if 'user' not in session:
        return jsonify({"message": "Not logged in"}), 403
    try:
        username = session['user']
        user_journals = list(journals_collection.find({"username": username}))
        user_journals = json.loads(json_util.dumps(user_journals))

        return jsonify(user_journals), 200
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

@app.route('/journal', methods=['PUT'])
def update_journal():
    if 'user' not in session:
        return jsonify({"message": "Not logged in"}), 403
    try:
        journal_data = request.get_json()
        oid = journal_data["_id"]["$oid"]
        journalId = ObjectId(oid)
        journal_data.pop("_id")
        journals_collection.update_one({"_id": journalId}, {"$set": journal_data})
        
        # Record journal update activity
        record_activity(session['user'], 'journal_update')
        
        return jsonify({"message": "update successful"}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to update journal entries: {str(e)}"}), 500

@app.route('/journal', methods=['DELETE'])
def delete_journal():
    if 'user' not in session:
        return jsonify({"message": "Not logged in"}), 403

    try:
        data = request.get_json()
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

@app.route('/moods', methods=['POST', 'OPTIONS'])
def log_mood():
    """Log a new mood for the current user with intensity value"""
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:3006")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
        response.headers.add("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
        response.headers.add("Access-Control-Allow-Credentials", "true")
        return response
        
    if 'user' not in session:
        return jsonify({"error": "Not logged in"}), 403
    
    try:
        mood_data = request.get_json()
        if not mood_data or 'mood' not in mood_data:
            return jsonify({"error": "Invalid mood data"}), 400
        
        # Print the received data for debugging
        print("Received mood data:", mood_data)
        
        # Add username and timestamp if not provided
        mood_data['username'] = session['user']
        if 'timestamp' not in mood_data:
            mood_data['timestamp'] = datetime.datetime.now()
        else:
            # Ensure timestamp is a datetime object if it's a string
            if isinstance(mood_data['timestamp'], str):
                mood_data['timestamp'] = datetime.datetime.fromisoformat(mood_data['timestamp'].replace('Z', '+00:00'))
        
        # Add intensity value based on mood if not provided
        if 'intensity' not in mood_data:
            mood_data['intensity'] = MOOD_INTENSITY.get(mood_data['mood'], 0)
        
        # Insert the mood entry
        result = moods_collection.insert_one(mood_data)
        
        # Record mood log activity
        record_activity(session['user'], 'mood_log')
        
        return jsonify({
            "message": "Mood logged successfully",
            "mood_id": str(result.inserted_id)
        }), 201
    
    except Exception as e:
        app.logger.error(f"Failed to log mood: {str(e)}")
        return jsonify({"error": f"Failed to log mood: {str(e)}"}), 500
    
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
            recent_ranks = [mood_ranks.get(mood, 0) for mood in mood_values[:3]]
            
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
        app.logger.error(f"Failed to calculate mood trend: {str(e)}")
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
        app.logger.error(f"Failed to retrieve last mood: {str(e)}")
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
        app.logger.error(f"Failed to calculate streak: {str(e)}")
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
        app.logger.error(f"Failed to retrieve last activity: {str(e)}")
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
                
                recent_ranks = [mood_ranks.get(mood, 0) for mood in mood_values[:3]]
                
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
        app.logger.error(f"Failed to retrieve dashboard stats: {str(e)}")
        return jsonify({"error": f"Failed to retrieve dashboard stats: {str(e)}"}), 500

# =========== VIDEO RECOMMENDATIONS API ENDPOINTS ===========

@app.route('/videos/recommendations', methods=['GET'])
def get_video_recommendations():
    """Get video recommendations based on user's mood"""
    if 'user' not in session:
        return jsonify({"error": "Not logged in"}), 403
    
    try:
        username = session['user']
        
        # Get mood parameter from query or use the user's latest mood
        mood = request.args.get('mood')
        if not mood:
            # Get the user's latest mood
            latest_mood = moods_collection.find_one(
                {"username": username},
                sort=[("timestamp", -1)]
            )
            mood = latest_mood.get('mood', 'neutral') if latest_mood else 'neutral'
        
        # Get recommended categories based on mood
        categories = MOOD_VIDEO_MAPPING.get(mood, DEFAULT_CATEGORIES)
        
        # Query videos matching the categories or mood tags
        videos = list(videos_collection.find({
            '$or': [
                {'categories': {'$in': categories}},
                {'mood_tags': {'$in': [mood]}}
            ],
            'active': True  # Only include active videos
        }).sort('rating', -1).limit(6))  # Get top 6 by rating
        
        # If no videos found for specific categories, get default recommendations
        if len(videos) == 0:
            videos = list(videos_collection.find({
                'categories': {'$in': DEFAULT_CATEGORIES},
                'active': True
            }).limit(6))
        
        # Format the videos for response
        formatted_videos = []
        for video in videos:
            formatted_videos.append({
                'id': str(video['_id']),
                'title': video['title'],
                'description': video['description'],
                'youtube_id': video['youtube_id'],  # YouTube video ID for embedding
                'thumbnail': video['thumbnail'],
                'duration': video['duration'],
                'categories': video['categories']
            })
        
        # Log this recommendation for analytics
        record_activity(username, 'video_recommendation')
        
        return jsonify({
            'videos': formatted_videos,
            'mood': mood
        }), 200
    
    except Exception as e:
        app.logger.error(f"Error getting video recommendations: {str(e)}")
        return jsonify({'error': 'Could not retrieve video recommendations'}), 500

@app.route('/videos/interaction', methods=['POST'])

def log_video_interaction():
    """Log user interaction with videos to improve recommendations"""
    if 'user' not in session:
        return jsonify({"error": "Not logged in"}), 403
    
    try:
        username = session['user']
        data = request.get_json()
        
        if not data or 'videoId' not in data or 'interactionType' not in data:
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Add to a new video_interactions collection
        interaction = {
            'username': username,
            'video_id': ObjectId(data['videoId']),
            'interaction_type': data['interactionType'],
            'timestamp': datetime.datetime.now(),
            'watched_duration': data.get('watchedDuration', 0),
            'device': data.get('device', request.user_agent.string)
        }
        
        # Create the collection if it doesn't exist
        if 'video_interactions' not in db.list_collection_names():
            db.create_collection('video_interactions')
            
        db.video_interactions.insert_one(interaction)
        
        # Update video stats
        if data['interactionType'] in ['view', 'complete', 'like']:
            update_fields = {}
            if data['interactionType'] == 'view':
                update_fields['view_count'] = 1
            elif data['interactionType'] == 'complete':
                update_fields['completion_count'] = 1
            elif data['interactionType'] == 'like':
                update_fields['like_count'] = 1
                
            videos_collection.update_one(
                {'_id': ObjectId(data['videoId'])},
                {'$inc': update_fields}
            )
        
        # Record video interaction activity
        activity_type = f"video_{data['interactionType']}"
        record_activity(username, activity_type)
        
        return jsonify({'success': True})
    
    except Exception as e:
        app.logger.error(f"Error logging video interaction: {str(e)}")
        return jsonify({'error': 'Could not log video interaction'}), 500

@app.route('/videos/popular', methods=['GET'])
def get_popular_videos():
    """Get popular videos across all categories"""
    if 'user' not in session:
        return jsonify({"error": "Not logged in"}), 403
    
    try:
        # Get limit parameter
        limit = int(request.args.get('limit', 6))
        
        # Query most popular videos based on view count
        videos = list(videos_collection.find({
            'active': True
        }).sort('view_count', -1).limit(limit))
        
        # Format the videos for response
        formatted_videos = []
        for video in videos:
            formatted_videos.append({
                'id': str(video['_id']),
                'title': video['title'],
                'description': video['description'],
                'youtube_id': video['youtube_id'],
                'thumbnail': video['thumbnail'],
                'duration': video['duration'],
                'view_count': video.get('view_count', 0),
                'categories': video['categories']
            })
        
        return jsonify({
            'videos': formatted_videos
        }), 200
    
    except Exception as e:
        app.logger.error(f"Error getting popular videos: {str(e)}")
        return jsonify({'error': 'Could not retrieve popular videos'}), 500

@app.route('/videos/by-mood/<mood>', methods=['GET'])
def get_videos_by_mood(mood):
    """Get videos specifically tagged for a particular mood"""
    if 'user' not in session:
        return jsonify({"error": "Not logged in"}), 403
    
    try:
        if not mood or mood not in MOOD_VIDEO_MAPPING:
            return jsonify({'error': 'Invalid mood parameter'}), 400
            
        # Get limit parameter
        limit = int(request.args.get('limit', 8))
        
        # Query videos directly tagged with this mood
        videos = list(videos_collection.find({
            '$or': [
                {'mood_tags': mood},
                {'categories': {'$in': MOOD_VIDEO_MAPPING.get(mood, [])}}
            ],
            'active': True
        }).sort('rating', -1).limit(limit))
        
        # Format the videos for response
        formatted_videos = []
        for video in videos:
            formatted_videos.append({
                'id': str(video['_id']),
                'title': video['title'],
                'description': video['description'],
                'youtube_id': video['youtube_id'],
                'thumbnail': video['thumbnail'],
                'duration': video['duration'],
                'categories': video['categories']
            })
        
        return jsonify({
            'videos': formatted_videos,
            'mood': mood
        }), 200
    
    except Exception as e:
        app.logger.error(f"Error getting videos by mood: {str(e)}")
        return jsonify({'error': 'Could not retrieve videos for this mood'}), 500
    
@app.route('/api/user/profile', methods=['GET'])
def get_user_profile():
    """Get the current user's profile information"""
    if 'user' not in session:
        return jsonify({"error": "Not logged in"}), 403
    
    try:
        username = session['user']
        
        # Get user from database (exclude password)
        user = users_collection.find_one(
            {"username": username},
            {"password": 0}  # Exclude password field
        )
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Convert to JSON
        user_data = json.loads(json_util.dumps(user))
        
        return jsonify(user_data), 200
    
    except Exception as e:
        app.logger.error(f"Error retrieving user profile: {str(e)}")
        return jsonify({"error": f"Failed to retrieve user profile: {str(e)}"}), 500

@app.route('/api/user/profile', methods=['PUT'])
def update_user_profile():
    """Update the current user's profile information"""
    if 'user' not in session:
        return jsonify({"error": "Not logged in"}), 403
    
    try:
        username = session['user']
        profile_data = request.get_json()
        
        if not profile_data:
            return jsonify({"error": "No data provided"}), 400
        
        # Fields that can be updated
        allowed_fields = ['email']
        
        # Filter out fields that shouldn't be updated
        update_data = {k: v for k, v in profile_data.items() if k in allowed_fields}
        
        if not update_data:
            return jsonify({"error": "No valid fields to update"}), 400
        
        # Add updated_at timestamp
        update_data['updated_at'] = datetime.datetime.now()
        
        # Update user
        result = users_collection.update_one(
            {"username": username},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            return jsonify({"warning": "No changes made"}), 200
        
        return jsonify({"message": "Profile updated successfully"}), 200
    
    except Exception as e:
        app.logger.error(f"Error updating user profile: {str(e)}")
        return jsonify({"error": f"Failed to update profile: {str(e)}"}), 500

@app.route('/api/user/change-password', methods=['PUT'])
def change_password():
    """Change the user's password"""
    if 'user' not in session:
        return jsonify({"error": "Not logged in"}), 403
    
    try:
        username = session['user']
        data = request.get_json()
        
        if not data or 'currentPassword' not in data or 'newPassword' not in data:
            return jsonify({"error": "Missing required fields"}), 400
        
        # Get user and check current password
        user = users_collection.find_one({"username": username})
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Verify current password
        ph = PasswordHasher()
        try:
            ph.verify(user['password'], data['currentPassword'])
        except:
            return jsonify({"error": "Current password is incorrect"}), 401
        
        # Hash new password
        hashed_password = ph.hash(data['newPassword'])
        
        # Update password
        result = users_collection.update_one(
            {"username": username},
            {
                "$set": {
                    "password": hashed_password,
                    "password_updated_at": datetime.datetime.now()
                }
            }
        )
        
        # Record password change activity
        record_activity(username, 'password_change')
        
        return jsonify({"message": "Password changed successfully"}), 200
    
    except Exception as e:
        app.logger.error(f"Error changing password: {str(e)}")
        return jsonify({"error": f"Failed to change password: {str(e)}"}), 500

@app.route('/api/user/profile', methods=['DELETE'])
def delete_user_account():
    """Delete the user's account and all associated data"""
    if 'user' not in session:
        return jsonify({"error": "Not logged in"}), 403
    
    try:
        username = session['user']
        
        # Delete user's data from collections
        journals_collection.delete_many({"username": username})
        moods_collection.delete_many({"username": username})
        activity_collection.delete_many({"username": username})
        
        # If video_interactions collection exists, delete from it too
        if 'video_interactions' in db.list_collection_names():
            db.video_interactions.delete_many({"username": username})
        
        # Finally delete the user
        users_collection.delete_one({"username": username})
        
        # Clear session
        session.clear()
        
        return jsonify({"message": "Account deleted successfully"}), 200
    
    except Exception as e:
        app.logger.error(f"Error deleting user account: {str(e)}")
        return jsonify({"error": f"Failed to delete account: {str(e)}"}), 500

@app.route('/api/user/activity-history', methods=['GET'])
def get_user_activity_history():
    """Get the user's activity history"""
    if 'user' not in session:
        return jsonify({"error": "Not logged in"}), 403
    
    try:
        username = session['user']
        
        # Get limit parameter (default 20)
        limit = int(request.args.get('limit', 20))
        
        # Get activity history
        activities = list(activity_collection.find(
            {"username": username}
        ).sort("timestamp", -1).limit(limit))
        
        # Convert to JSON
        activities = json.loads(json_util.dumps(activities))
        
        return jsonify(activities), 200
    
    except Exception as e:
        app.logger.error(f"Error retrieving activity history: {str(e)}")
        return jsonify({"error": f"Failed to retrieve activity history: {str(e)}"}), 500

@app.route('/api/user/watched-videos', methods=['GET'])
def get_watched_videos():
    """Get the user's watched videos"""
    if 'user' not in session:
        return jsonify({"error": "Not logged in"}), 403
    
    try:
        username = session['user']
        
        # Get limit parameter (default 10)
        limit = int(request.args.get('limit', 10))
        
        # Check if video_interactions collection exists
        if 'video_interactions' not in db.list_collection_names():
            return jsonify([]), 200
        
        # Get unique video IDs watched by the user
        pipeline = [
            {"$match": {"username": username, "interaction_type": "view"}},
            {"$sort": {"timestamp": -1}},
            {"$group": {
                "_id": "$video_id",
                "watchedAt": {"$first": "$timestamp"},
                "videoId": {"$first": "$video_id"}
            }},
            {"$limit": limit}
        ]
        
        watched_video_ids = list(db.video_interactions.aggregate(pipeline))
        
        # Get video details for these IDs
        watched_videos = []
        
        for item in watched_video_ids:
            video = videos_collection.find_one({"_id": item["videoId"]})
            
            if video:
                watched_videos.append({
                    "id": str(video["_id"]),
                    "title": video["title"],
                    "description": video["description"],
                    "thumbnail": video.get("thumbnail", ""),
                    "youtube_id": video.get("youtube_id", ""),
                    "watchedAt": item["watchedAt"]
                })
        
        # Convert to JSON
        watched_videos_json = json.loads(json_util.dumps(watched_videos))
        
        return jsonify(watched_videos_json), 200
    
    except Exception as e:
        app.logger.error(f"Error retrieving watched videos: {str(e)}")
        return jsonify({"error": f"Failed to retrieve watched videos: {str(e)}"}), 500

@app.route('/api/user/video-analytics', methods=['GET'])
def get_video_analytics():
    """Get analytics about user's video watching habits"""
    if 'user' not in session:
        return jsonify({"error": "Not logged in"}), 403
    
    try:
        username = session['user']
        
        # Check if video_interactions collection exists
        if 'video_interactions' not in db.list_collection_names():
            return jsonify({
                "totalWatched": 0,
                "completionRate": 0,
                "watchTimeByDay": [],
                "mostWatchedCategories": []
            }), 200
        
        # Get total videos watched
        total_watched = db.video_interactions.count_documents({
            "username": username, 
            "interaction_type": "view"
        })
        
        # Get completed videos count
        completed = db.video_interactions.count_documents({
            "username": username, 
            "interaction_type": "complete"
        })
        
        # Calculate completion rate
        completion_rate = (completed / total_watched * 100) if total_watched > 0 else 0
        
        # Get watch time by day (last 7 days)
        seven_days_ago = datetime.datetime.now() - datetime.timedelta(days=7)
        
        pipeline_by_day = [
            {
                "$match": {
                    "username": username,
                    "timestamp": {"$gte": seven_days_ago}
                }
            },
            {
                "$group": {
                    "_id": {
                        "year": {"$year": "$timestamp"},
                        "month": {"$month": "$timestamp"},
                        "day": {"$dayOfMonth": "$timestamp"}
                    },
                    "count": {"$sum": 1},
                    "watchTime": {"$sum": "$watched_duration"}
                }
            },
            {"$sort": {"_id.year": 1, "_id.month": 1, "_id.day": 1}}
        ]
        
        watch_time_by_day = list(db.video_interactions.aggregate(pipeline_by_day))
        
        # Format for response
        formatted_watch_time = []
        for day in watch_time_by_day:
            date_str = f"{day['_id']['year']}-{day['_id']['month']}-{day['_id']['day']}"
            formatted_watch_time.append({
                "date": date_str,
                "count": day["count"],
                "watchTime": day["watchTime"]
            })
        
        # Get most watched categories
        pipeline_categories = [
            {"$match": {"username": username}},
            {"$lookup": {
                "from": "videos",
                "localField": "video_id",
                "foreignField": "_id",
                "as": "video_info"
            }},
            {"$unwind": "$video_info"},
            {"$unwind": "$video_info.categories"},
            {"$group": {
                "_id": "$video_info.categories",
                "count": {"$sum": 1}
            }},
            {"$sort": {"count": -1}},
            {"$limit": 5}
        ]
        
        category_counts = list(db.video_interactions.aggregate(pipeline_categories))
        
        # Format for response
        most_watched_categories = []
        for category in category_counts:
            most_watched_categories.append({
                "category": category["_id"],
                "count": category["count"]
            })
        
        return jsonify({
            "totalWatched": total_watched,
            "completionRate": round(completion_rate, 1),
            "watchTimeByDay": formatted_watch_time,
            "mostWatchedCategories": most_watched_categories
        }), 200
    
    except Exception as e:
        app.logger.error(f"Error retrieving video analytics: {str(e)}")
        return jsonify({"error": f"Failed to retrieve video analytics: {str(e)}"}), 500
    
    # Add these new API endpoints to your Flask backend

# Add a new route for mood distribution statistics
@app.route('/moods/distribution', methods=['GET'])
def get_mood_distribution():
    """Get the distribution of moods over a time period"""
    if 'user' not in session:
        return jsonify({"error": "Not logged in"}), 403
    
    try:
        username = session['user']
        time_range = request.args.get('time_range', 'week')
        
        # Calculate date range based on time_range
        now = datetime.datetime.now()
        if time_range == 'week':
            start_date = now - datetime.timedelta(days=7)
        elif time_range == 'month':
            start_date = now - datetime.timedelta(days=30)
        elif time_range == 'year':
            start_date = now - datetime.timedelta(days=365)
        else:  # 'all'
            start_date = datetime.datetime(2000, 1, 1)  # Far back in time
        
        # Query moods within the date range
        moods = list(moods_collection.find({
            "username": username,
            "timestamp": {"$gte": start_date}
        }))
        
        # Count occurrences of each mood
        mood_counts = {}
        for mood in moods:
            mood_type = mood.get('mood')
            if mood_type in mood_counts:
                mood_counts[mood_type] += 1
            else:
                mood_counts[mood_type] = 1
        
        # Format the results
        distribution = []
        for mood, count in mood_counts.items():
            distribution.append({
                "mood": mood,
                "count": count
            })
        
        # Sort by count (descending)
        distribution.sort(key=lambda x: x["count"], reverse=True)
        
        return jsonify({
            "data": distribution,
            "time_range": time_range,
            "total": len(moods)
        }), 200
    
    except Exception as e:
        app.logger.error(f"Failed to get mood distribution: {str(e)}")
        return jsonify({"error": f"Failed to get mood distribution: {str(e)}"}), 500

# Add a new comprehensive mood analytics endpoint
@app.route('/moods/analytics', methods=['GET'])
def get_mood_analytics():
    """Get comprehensive mood analytics for visualizations"""
    if 'user' not in session:
        return jsonify({"error": "Not logged in"}), 403
    
    try:
        username = session['user']
        time_range = request.args.get('time_range', 'month')
        
        # Calculate date range
        now = datetime.datetime.now()
        if time_range == 'week':
            start_date = now - datetime.timedelta(days=7)
        elif time_range == 'month':
            start_date = now - datetime.timedelta(days=30)
        elif time_range == 'year':
            start_date = now - datetime.timedelta(days=365)
        else:  # 'all'
            start_date = datetime.datetime(2000, 1, 1)
        
        # Get all moods in date range
        moods = list(moods_collection.find({
            "username": username,
            "timestamp": {"$gte": start_date}
        }).sort("timestamp", 1))  # Sort by timestamp ascending
        
        # Format moods for response with proper date handling
        formatted_moods = []
        for mood in moods:
            # Format the timestamp for consistent use in frontend
            timestamp = mood.get('timestamp')
            if timestamp:
                # Format: YYYY-MM-DD
                date_str = timestamp.strftime('%Y-%m-%d')
                # Format: HH:MM:SS
                time_str = timestamp.strftime('%H:%M:%S')
            else:
                date_str = 'Unknown'
                time_str = 'Unknown'
            
            formatted_moods.append({
                "id": str(mood.get('_id')),
                "mood": mood.get('mood'),
                "intensity": mood.get('intensity'),
                "note": mood.get('note', ''),
                "date": date_str,
                "time": time_str,
                "timestamp": timestamp.isoformat() if timestamp else None
            })
        
        # Calculate mood summary statistics
        mood_counts = {}
        total_intensity = 0
        intensity_values = []
        
        for mood in formatted_moods:
            mood_type = mood.get('mood')
            intensity = mood.get('intensity', 0)
            
            # Update mood counts
            if mood_type in mood_counts:
                mood_counts[mood_type] += 1
            else:
                mood_counts[mood_type] = 1
            
            # Update intensity stats
            total_intensity += intensity
            intensity_values.append(intensity)
        
        # Calculate most common mood
        most_common_mood = max(mood_counts.items(), key=lambda x: x[1])[0] if mood_counts else 'neutral'
        
        # Calculate average intensity
        avg_intensity = total_intensity / len(formatted_moods) if formatted_moods else 0
        
        # Calculate mood variability (standard deviation)
        if len(intensity_values) > 1:
            mean = sum(intensity_values) / len(intensity_values)
            variance = sum((x - mean) ** 2 for x in intensity_values) / len(intensity_values)
            std_dev = variance ** 0.5
        else:
            std_dev = 0
        
        # Determine variability level
        if std_dev > 1.5:
            variability = 'high'
        elif std_dev > 0.7:
            variability = 'medium'
        else:
            variability = 'low'
        
        # Determine mood trend (improving, worsening, or stable)
        if len(formatted_moods) >= 3:
            # Split moods into first and second half
            half_point = len(formatted_moods) // 2
            first_half = formatted_moods[:half_point]
            second_half = formatted_moods[half_point:]
            
            # Calculate average intensity for each half
            first_half_avg = sum(m.get('intensity', 0) for m in first_half) / len(first_half) if first_half else 0
            second_half_avg = sum(m.get('intensity', 0) for m in second_half) / len(second_half) if second_half else 0
            
            # Determine trend
            if second_half_avg - first_half_avg > 0.5:
                trend = 'improving'
            elif first_half_avg - second_half_avg > 0.5:
                trend = 'worsening'
            else:
                trend = 'stable'
        else:
            trend = 'stable'
        
        # Format mood distribution
        distribution = []
        for mood_type, count in mood_counts.items():
            distribution.append({
                "mood": mood_type,
                "count": count
            })
        
        # Sort by count (descending)
        distribution.sort(key=lambda x: x["count"], reverse=True)
        
        # Create mood calendar data (grouped by date)
        calendar_data = {}
        for mood in formatted_moods:
            date = mood.get('date')
            if date not in calendar_data:
                calendar_data[date] = []
            calendar_data[date].append(mood)
        
        # Final response
        response = {
            "moods": formatted_moods,
            "summary": {
                "mostCommonMood": most_common_mood,
                "averageIntensity": round(avg_intensity, 2),
                "variability": variability,
                "trend": trend,
                "totalEntries": len(formatted_moods)
            },
            "distribution": distribution,
            "calendar": [{"date": date, "entries": entries} for date, entries in calendar_data.items()]
        }
        
        return jsonify(response), 200
    
    except Exception as e:
        app.logger.error(f"Failed to get mood analytics: {str(e)}")
        return jsonify({"error": f"Failed to get mood analytics: {str(e)}"}), 500
    
    # Add this endpoint to your Flask app after the other moods endpoints
@app.route('/moods', methods=['GET'])
def get_moods():
    """Get all mood entries for the current user"""
    if 'user' not in session:
        return jsonify({"error": "Not logged in"}), 403
    
    try:
        username = session['user']
        
        # Optional time_range query parameter
        time_range = request.args.get('time_range', 'all')
        
        # Calculate date range based on time_range
        now = datetime.datetime.now()
        if time_range == 'week':
            start_date = now - datetime.timedelta(days=7)
        elif time_range == 'month':
            start_date = now - datetime.timedelta(days=30)
        elif time_range == 'year':
            start_date = now - datetime.timedelta(days=365)
        else:  # 'all'
            start_date = datetime.datetime(2000, 1, 1)  # Far back in time
        
        # Query for moods in the date range
        query = {
            "username": username,
            "timestamp": {"$gte": start_date}
        }
        
        # Get all moods sorted by timestamp (newest first)
        moods = list(moods_collection.find(query).sort("timestamp", -1))
        
        # Convert MongoDB objects to JSON
        moods_json = json.loads(json_util.dumps(moods))
        
        return jsonify(moods_json), 200
    
    except Exception as e:
        app.logger.error(f"Failed to retrieve moods: {str(e)}")
        return jsonify({"error": f"Failed to retrieve moods: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(port=8000, debug=True)