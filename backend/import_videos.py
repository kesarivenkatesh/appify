"""
YouTube Video Import Script for MongoDB

This script imports sample YouTube videos into MongoDB for the mental health app.
Each video is tagged with categories and mood tags to enable mood-based recommendations.
"""

import datetime
import pymongo
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Connect to MongoDB
connection_string = os.getenv("CONNECTION_STRING")
client = pymongo.MongoClient(connection_string)
db = client["appifydb"]
videos_collection = db["videos"]

# Sample videos data with YouTube IDs
sample_videos = [
    # Happy/Positive Mood Videos
    {
        "title": "5-Minute Dance Party to Boost Your Mood",
        "description": "A quick dance workout that will instantly lift your spirits and energy levels.",
        "youtube_id": "UfcAVejslrU",
        "thumbnail": "https://img.youtube.com/vi/UfcAVejslrU/hqdefault.jpg",
        "duration": "5:30",
        "categories": ["motivation", "comedy", "dance", "energy"],
        "tags": ["quick", "beginner", "fun"],
        "mood_tags": ["happy", "energetic", "excited"],
        "view_count": 2845,
        "like_count": 213,
        "completion_count": 1924,
        "rating": 4.9,
        "published_date": datetime.datetime.now(),
        "active": True,
        "creator": {
            "name": "Happy Moves",
            "channel_id": "UC123456789"
        }
    },
    {
        "title": "The Science of Happiness - Quick Summary",
        "description": "Learn about the research behind happiness and practical ways to increase your joy.",
        "youtube_id": "GXy__kBVq1M",
        "thumbnail": "https://img.youtube.com/vi/GXy__kBVq1M/hqdefault.jpg",
        "duration": "8:45",
        "categories": ["inspiration", "educational", "wellbeing", "motivation"],
        "tags": ["science", "psychology", "tips"],
        "mood_tags": ["happy", "content", "neutral"],
        "view_count": 3267,
        "like_count": 278,
        "completion_count": 2103,
        "rating": 4.7,
        "published_date": datetime.datetime.now(),
        "active": True,
        "creator": {
            "name": "Mind Science",
            "channel_id": "UC123456790"
        }
    },
    {
        "title": "3 Gratitude Practices That Take Just 2 Minutes",
        "description": "Simple gratitude exercises that you can do anywhere to boost your mood and outlook.",
        "youtube_id": "WzRazFcu4Ms",
        "thumbnail": "https://img.youtube.com/vi/WzRazFcu4Ms/hqdefault.jpg",
        "duration": "6:20",
        "categories": ["inspiration", "motivation", "wellbeing", "mindfulness"],
        "tags": ["gratitude", "quick", "daily"],
        "mood_tags": ["happy", "content", "excited"],
        "view_count": 1898,
        "like_count": 167,
        "completion_count": 1245,
        "rating": 4.8,
        "published_date": datetime.datetime.now(),
        "active": True,
        "creator": {
            "name": "Grateful Living",
            "channel_id": "UC123456791"
        }
    },
    
    # Sad/Down Mood Videos
    {
        "title": "Gentle Yoga for Emotional Healing",
        "description": "A compassionate yoga sequence designed to help process difficult emotions.",
        "youtube_id": "Nw2oBIrQGLo",
        "thumbnail": "https://img.youtube.com/vi/Nw2oBIrQGLo/hqdefault.jpg",
        "duration": "15:30",
        "categories": ["uplift", "comfort", "mindfulness", "yoga"],
        "tags": ["gentle", "healing", "emotions"],
        "mood_tags": ["sad", "tired"],
        "view_count": 2456,
        "like_count": 203,
        "completion_count": 1678,
        "rating": 4.9,
        "published_date": datetime.datetime.now(),
        "active": True,
        "creator": {
            "name": "Healing Yoga",
            "channel_id": "UC123456792"
        }
    },
    {
        "title": "Nature Sounds - Peaceful Forest Stream",
        "description": "Immerse yourself in the calming sounds of a forest stream to ease your mind.",
        "youtube_id": "qRKhxMGO1iE",
        "thumbnail": "https://img.youtube.com/vi/qRKhxMGO1iE/hqdefault.jpg",
        "duration": "20:00",
        "categories": ["nature", "relaxation", "calming", "comfort"],
        "tags": ["nature", "sounds", "meditation"],
        "mood_tags": ["sad", "anxious", "tired"],
        "view_count": 3876,
        "like_count": 312,
        "completion_count": 2345,
        "rating": 4.8,
        "published_date": datetime.datetime.now(),
        "active": True,
        "creator": {
            "name": "Nature Therapy",
            "channel_id": "UC123456793"
        }
    },
    {
        "title": "Understanding Your Emotions - A Guide",
        "description": "Learn how to recognize, accept and process difficult emotions in a healthy way.",
        "youtube_id": "tEmt1Znux58",
        "thumbnail": "https://img.youtube.com/vi/tEmt1Znux58/hqdefault.jpg",
        "duration": "12:15",
        "categories": ["uplift", "educational", "mindfulness", "self-care"],
        "tags": ["emotions", "psychology", "healing"],
        "mood_tags": ["sad"],
        "view_count": 2234,
        "like_count": 187,
        "completion_count": 1543,
        "rating": 4.7,
        "published_date": datetime.datetime.now(),
        "active": True,
        "creator": {
            "name": "Emotional Wellness",
            "channel_id": "UC123456794"
        }
    },
    
    # Tired/Low Energy Mood Videos
    {
        "title": "5-Minute Energy Boost Meditation",
        "description": "A quick meditation to restore your energy and focus when you're feeling tired.",
        "youtube_id": "inpok4MKVLM",
        "thumbnail": "https://img.youtube.com/vi/inpok4MKVLM/hqdefault.jpg",
        "duration": "5:45",
        "categories": ["meditation", "energy", "mindfulness", "relaxation"],
        "tags": ["quick", "energizing", "focus"],
        "mood_tags": ["tired", "neutral"],
        "view_count": 1987,
        "like_count": 165,
        "completion_count": 1456,
        "rating": 4.6,
        "published_date": datetime.datetime.now(),
        "active": True,
        "creator": {
            "name": "Energy Mind",
            "channel_id": "UC123456795"
        }
    },
    {
        "title": "Gentle Morning Stretch Routine",
        "description": "Wake up your body and mind with this gentle morning stretch sequence.",
        "youtube_id": "BBAyRBTfsOU",
        "thumbnail": "https://img.youtube.com/vi/BBAyRBTfsOU/hqdefault.jpg",
        "duration": "8:30",
        "categories": ["workout", "relaxation", "energy", "self-care"],
        "tags": ["morning", "stretch", "gentle"],
        "mood_tags": ["tired", "energetic"],
        "view_count": 2543,
        "like_count": 198,
        "completion_count": 1876,
        "rating": 4.8,
        "published_date": datetime.datetime.now(),
        "active": True,
        "creator": {
            "name": "Morning Wellness",
            "channel_id": "UC123456796"
        }
    },
    {
        "title": "Sleep Meditation - Deep Relaxation",
        "description": "A calming meditation to help you fall into a deep, rejuvenating sleep.",
        "youtube_id": "N4qabPO9X5o",
        "thumbnail": "https://img.youtube.com/vi/N4qabPO9X5o/hqdefault.jpg",
        "duration": "25:00",
        "categories": ["sleep", "meditation", "relaxation", "calming"],
        "tags": ["sleep", "evening", "relaxation"],
        "mood_tags": ["tired", "anxious"],
        "view_count": 4532,
        "like_count": 387,
        "completion_count": 2876,
        "rating": 4.9,
        "published_date": datetime.datetime.now(),
        "active": True,
        "creator": {
            "name": "Sleep Well",
            "channel_id": "UC123456797"
        }
    },
    
    # Anxious/Stressed Mood Videos
    {
        "title": "Quick Anxiety Relief Breathing Technique",
        "description": "Learn this powerful breathing technique to quickly reduce anxiety anywhere.",
        "youtube_id": "acUZdGd_3Gw",
        "thumbnail": "https://img.youtube.com/vi/acUZdGd_3Gw/hqdefault.jpg",
        "duration": "4:15",
        "categories": ["mindfulness", "relaxation", "calming", "self-care"],
        "tags": ["anxiety", "breathing", "quick"],
        "mood_tags": ["anxious", "tired"],
        "view_count": 3254,
        "like_count": 276,
        "completion_count": 2432,
        "rating": 4.8,
        "published_date": datetime.datetime.now(),
        "active": True,
        "creator": {
            "name": "Calm Mind",
            "channel_id": "UC123456798"
        }
    },
    {
        "title": "Gentle Yoga for Stress Release",
        "description": "A slow, mindful yoga practice to release tension and calm your nervous system.",
        "youtube_id": "Jpps6345HDM",
        "thumbnail": "https://img.youtube.com/vi/Jpps6345HDM/hqdefault.jpg",
        "duration": "18:30",
        "categories": ["yoga", "relaxation", "mindfulness", "calming"],
        "tags": ["stress", "gentle", "tension"],
        "mood_tags": ["anxious", "tired"],
        "view_count": 2765,
        "like_count": 234,
        "completion_count": 1987,
        "rating": 4.7,
        "published_date": datetime.datetime.now(),
        "active": True,
        "creator": {
            "name": "Yoga Calm",
            "channel_id": "UC123456799"
        }
    },
    {
        "title": "3-Minute Grounding Exercise for Anxiety",
        "description": "A quick and effective grounding technique to bring you back to the present moment.",
        "youtube_id": "MHvsKxjvyWU",
        "thumbnail": "https://img.youtube.com/vi/MHvsKxjvyWU/hqdefault.jpg",
        "duration": "3:45",
        "categories": ["mindfulness", "calming", "self-care", "relaxation"],
        "tags": ["anxiety", "grounding", "quick"],
        "mood_tags": ["anxious"],
        "view_count": 2432,
        "like_count": 213,
        "completion_count": 1876,
        "rating": 4.6,
        "published_date": datetime.datetime.now(),
        "active": True,
        "creator": {
            "name": "Present Mind",
            "channel_id": "UC123456800"
        }
    },
    
    # Angry Mood Videos
    {
        "title": "5-Minute Anger Management Techniques",
        "description": "Quick and effective techniques to manage anger and regain emotional control.",
        "youtube_id": "s4dMCkoqj8A",
        "thumbnail": "https://img.youtube.com/vi/s4dMCkoqj8A/hqdefault.jpg",
        "duration": "5:15",
        "categories": ["mindfulness", "calming", "self-care", "emotional-control"],
        "tags": ["anger", "management", "quick"],
        "mood_tags": ["angry"],
        "view_count": 1876,
        "like_count": 163,
        "completion_count": 1432,
        "rating": 4.5,
        "published_date": datetime.datetime.now(),
        "active": True,
        "creator": {
            "name": "Emotional Balance",
            "channel_id": "UC123456801"
        }
    },
    {
        "title": "Calming Visualization for Releasing Anger",
        "description": "A guided visualization to help you release anger and find emotional peace.",
        "youtube_id": "CL6xyBeBHOw",
        "thumbnail": "https://img.youtube.com/vi/CL6xyBeBHOw/hqdefault.jpg",
        "duration": "10:20",
        "categories": ["meditation", "visualization", "calming", "emotional-release"],
        "tags": ["anger", "release", "peace"],
        "mood_tags": ["angry", "anxious"],
        "view_count": 1543,
        "like_count": 132,
        "completion_count": 1256,
        "rating": 4.6,
        "published_date": datetime.datetime.now(),
        "active": True,
        "creator": {
            "name": "Mind Visualize",
            "channel_id": "UC123456802"
        }
    },
    
    # Content/Calm Mood Videos
    {
        "title": "Sunset Beach Meditation",
        "description": "A peaceful meditation set to the sounds of gentle waves at sunset.",
        "youtube_id": "8GV9v7jnMcE",
        "thumbnail": "https://img.youtube.com/vi/8GV9v7jnMcE/hqdefault.jpg",
        "duration": "12:20",
        "categories": ["meditation", "nature", "calming", "relaxation"],
        "tags": ["beach", "sunset", "waves"],
        "mood_tags": ["content", "neutral"],
        "view_count": 2143,
        "like_count": 178,
        "completion_count": 1756,
        "rating": 4.7,
        "published_date": datetime.datetime.now(),
        "active": True,
        "creator": {
            "name": "Peace Meditations",
            "channel_id": "UC123456803"
        }
    },
    {
        "title": "Mindful Walking Practice in Nature",
        "description": "Learn how to practice mindfulness while walking in natural surroundings.",
        "youtube_id": "HRuqe26F8SU",
        "thumbnail": "https://img.youtube.com/vi/HRuqe26F8SU/hqdefault.jpg",
        "duration": "8:50",
        "categories": ["mindfulness", "nature", "wellbeing", "self-care"],
        "tags": ["walking", "mindfulness", "nature"],
        "mood_tags": ["content", "neutral", "happy"],
        "view_count": 1765,
        "like_count": 143,
        "completion_count": 1432,
        "rating": 4.6,
        "published_date": datetime.datetime.now(),
        "active": True,
        "creator": {
            "name": "Nature Mindfulness",
            "channel_id": "UC123456804"
        }
    }
]

def import_videos():
    """Import sample videos into MongoDB"""
    
    # Check if videos already exist
    existing_count = videos_collection.count_documents({})
    
    if existing_count > 0:
        print(f"Found {existing_count} videos already in database.")
        proceed = input("Do you want to proceed with import? This will not create duplicates. (y/n): ")
        if proceed.lower() != 'y':
            print("Import cancelled.")
            return
    
    # Import videos
    imported_count = 0
    for video in sample_videos:
        # Check for existing video with same YouTube ID
        existing = videos_collection.find_one({"youtube_id": video["youtube_id"]})
        if existing:
            print(f"Video already exists: {video['title']}")
            continue
        
        # Insert the video
        try:
            videos_collection.insert_one(video)
            imported_count += 1
            print(f"Imported: {video['title']}")
        except Exception as e:
            print(f"Error importing {video['title']}: {str(e)}")
    
    print(f"\nSuccessfully imported {imported_count} new videos.")
    
    # Create indexes for better performance
    videos_collection.create_index([("categories", 1)])
    videos_collection.create_index([("mood_tags", 1)])
    videos_collection.create_index([("view_count", -1)])
    videos_collection.create_index([("rating", -1)])
    videos_collection.create_index([("youtube_id", 1)], unique=True)
    
    print("Created indexes for optimized queries.")

if __name__ == "__main__":
    print("YouTube Video Import Script for Mental Health App")
    print("================================================")
    import_videos()