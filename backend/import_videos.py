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
        "title": "4 Minutes To Start Your Day Right! MORNING MOTIVATION and Positivity!",
        "description": "4 Minutes to start your day right with some good Morning Motivation and Positivity.",
        "youtube_id": "HgiiY9TLtX8",
        "thumbnail": "https://img.youtube.com/vi/UfcAVejslrU/hqdefault.jpg",
        "duration": "4:44",
        "categories": ["motivation", "comedy", "positive", "energy"],
        "tags": ["quick", "beginner", "fun"],
        "mood_tags": ["happy", "energetic", "excited"],
        "view_count": 2845,
        "like_count": 213,
        "completion_count": 1924,
        "rating": 4.9,
        "published_date": datetime.datetime.now(),
        "active": True,
        "creator": {
            "name": "",
            "channel_id": ""
        }
    },
    {
        "title": "Happiness",
        "description": "Happiness",        
        "youtube_id": "e9dZQelULDk",
        "thumbnail": "https://img.youtube.com/vi/e9dZQelULDk/hqdefault.jpg",
        "duration": "4:16",
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
        "title": "THE CHOICE (Short Animated Movie)",
        "description": "This is a short animated film, about how your small everyday life choices can ultimately shape your life",
        "youtube_id": "_HEnohs6yYw",
        "thumbnail": "https://img.youtube.com/vi/_HEnohs6yYw/hqdefault.jpg",
        "duration": "3:28 ",
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
        "title": "Overcomer Animated Short",
        "description": "Overcomer Animated Short",
        "youtube_id": "V6ui161NyTg",
        "thumbnail": "https://img.youtube.com/vi/V6ui161NyTg/hqdefault.jpg",
        "duration": "5:56",
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
        "title": "Who are you?",
        "description": "This is the story of a writer who, after having great success with his first book" ,         
        "youtube_id": "GWGbOjlJDkU",
        "thumbnail": "https://img.youtube.com/vi/GWGbOjlJDkU/hqdefault.jpg",
        "duration": "13:28",
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
        "title": "The Mindset That Changed Life Immediately",
        "description": "A video that can easily change the mindset and life",
        "youtube_id": "Vp-TVkqaCrQ",
        "thumbnail": "https://img.youtube.com/vi/Vp-TVkqaCrQ/hqdefault.jpg",
        "duration": "3:41",
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
        "title": "Feeling Tired",
        "description": "feeling tired quotes",
        "youtube_id": "3tDlK9ylS2w",
        "thumbnail": "https://img.youtube.com/vi/3tDlK9ylS2w/hqdefault.jpg",
        "duration": "10",
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
        "title": "The 5 Types of Tiredness",
        "description": "The 5 Types of Tiredness",
        "youtube_id": "foWbC4m9Do0",
        "thumbnail": "https://img.youtube.com/vi/foWbC4m9Do0/hqdefault.jpg",
        "duration": "4:33",
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
        "title": "How to get feel less tired",
        "description": "How to get feel less tired",
        "youtube_id": "srgUvSsfOXc",
        "thumbnail": "https://img.youtube.com/vi/srgUvSsfOXc/hqdefault.jpg",
        "duration": "30sec",
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
        "title": "How stress affects your brain",
        "description": "How stress affects your brain",
        "youtube_id": "WuyPuH9ojCE",
        "thumbnail": "https://img.youtube.com/vi/WuyPuH9ojCE/hqdefault.jpg",
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
        "title": "How to calm your Anxiety",
        "description": "A Video on How to calm your anxiety and stress",
        "youtube_id": "FpiWSFcL3-c",
        "thumbnail": "https://img.youtube.com/vi/FpiWSFcL3-c/hqdefault.jpg",
        "duration": "7:19",
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
        "title": "What Is Depression? ",
        "description": "Depression Causes And Symptoms",      
          "youtube_id": "0hxFR6tezAc",
        "thumbnail": "https://img.youtube.com/0hxFR6tezAc/hqdefault.jpg",
        "duration": "6:23",
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
        "youtube_id": "Po4O-2Tk_o",
        "thumbnail": "https://img.youtube.com/vi/Po4O-2Tk_o/hqdefault.jpg",
        "duration": "32:00",
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
        "title": "why do we get angry",
        "description": "why do we get angry",
        "youtube_id": "clwt7iXF1Mg&t=8s",
        "thumbnail": "https://img.youtube.com/vi/clwt7iXF1Mg&t=8s/hqdefault.jpg",
        "duration": "5:59",
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
        "title": "Empty Your Mind",
        "description": "a powerful zen story for your life",
        "youtube_id": "GNDO2G6YySA",
        "thumbnail": "https://img.youtube.com/vi/GNDO2G6YySA/hqdefault.jpg",
        "duration": "4:37",
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
        "title": "How You Can Achieve ANYTHING",
        "description": "Zen Motivational Story",
        "youtube_id": "3ZxFe1Z5LYs",
        "thumbnail": "https://img.youtube.com/vi/3ZxFe1Z5LYs/hqdefault.jpg",
        "duration": "2:49",
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
    },
    {
        "title": "A JOY STORY",
        "description": "A JOY STORY",
        "youtube_id": "iR-JFks6uI0",
        "thumbnail": "https://img.youtube.com/vi/iR-JFks6uI0/hqdefault.jpg",
        "duration": "4:03",
        "title": "Switching to peacefool mood",
        "description": "Switching to peacefool mood",
        "youtube_id": "HS7XZDtnv-U",
        "thumbnail": "https://img.youtube.com/vi/HS7XZDtnv-U/hqdefault.jpg",
        "duration": "15",
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