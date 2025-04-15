import React, { useState, useEffect, useContext } from 'react';
import { 
  Smile, Frown, Meh, Zap, Battery, 
  Coffee, Cloud, Angry, HeartHandshake
} from 'lucide-react';
import MoodService from '../../../services/MoodService';
import { useNavigate } from 'react-router';
//import { AuthContext} from '../../AuthContext/AuthContext';
import { triggerEmojiExplosion } from '../../AppWrapper';

// Expanded mood options with intensity values
const moodOptions = [
  { value: 'excited', label: 'Excited', icon: <Coffee className="w-8 h-8" />, color: 'bg-yellow-100 text-yellow-600', intensity: 5 },
  { value: 'happy', label: 'Happy', icon: <Smile className="w-8 h-8" />, color: 'bg-green-100 text-green-600', intensity: 4 },
  { value: 'content', label: 'Content', icon: <HeartHandshake className="w-8 h-8" />, color: 'bg-indigo-100 text-indigo-600', intensity: 3 },
  { value: 'neutral', label: 'Neutral', icon: <Meh className="w-8 h-8" />, color: 'bg-gray-100 text-gray-600', intensity: 2 },
  { value: 'tired', label: 'Tired', icon: <Battery className="w-8 h-8" />, color: 'bg-purple-100 text-purple-600', intensity: 1 },
  { value: 'anxious', label: 'Anxious', icon: <Cloud className="w-8 h-8" />, color: 'bg-orange-100 text-orange-600', intensity: 0 },
  { value: 'sad', label: 'Sad', icon: <Frown className="w-8 h-8" />, color: 'bg-blue-100 text-blue-600', intensity: -1 },
  { value: 'angry', label: 'Angry', icon: <Angry className="w-8 h-8" />, color: 'bg-red-100 text-red-600', intensity: -2 },
];

const MoodCheck = () => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState('');
  const [isLogging, setIsLogging] = useState(false);
  const [logSuccess, setLogSuccess] = useState(false);
  const navigate = useNavigate();
  

  
  

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
    
    // Trigger emoji explosion for positive moods
    if (['excited', 'happy', 'content'].includes(mood)) {
      triggerEmojiExplosion();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedMood) return;
    
    setIsLogging(true);
    
    try {
      // Get the intensity value from the selected mood
      const selectedMoodObj = moodOptions.find(m => m.value === selectedMood);
      const intensity = selectedMoodObj ? selectedMoodObj.intensity : 0;
      
      // Log the mood to the backend
      const moodService = new MoodService();
      await moodService.logMood({
        mood: selectedMood,
        intensity: intensity,
        note: note.trim(),
        timestamp: new Date().toISOString()
      });
      
      setLogSuccess(true);
      
      // Automatically navigate to dashboard after short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
      
    } catch (error) {
      console.error('Failed to log mood:', error);
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="space-y-8">
        <section className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-8 text-indigo-800">How are you feeling today?</h1>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {moodOptions.map((mood) => (
                <button
                  key={mood.value}
                  type="button"
                  onClick={() => handleMoodSelect(mood.value)}
                  className={`${
                    mood.color
                  } p-6 rounded-xl flex flex-col items-center justify-center space-y-3 transition-all hover:shadow-md ${
                    selectedMood === mood.value ? 'ring-2 ring-offset-2 ring-indigo-500 transform scale-105' : ''
                  } ${isLogging ? 'opacity-70 cursor-not-allowed' : ''}`}
                  disabled={isLogging}
                >
                  {mood.icon}
                  <span className="font-medium">{mood.label}</span>
                </button>
              ))}
            </div>
            
            <div className="mb-6">
              <label htmlFor="mood-note" className="block text-sm font-medium text-gray-700 mb-2">
                Add a note (optional):
              </label>
              <textarea
                id="mood-note"
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="How are you feeling? What's on your mind?"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={isLogging || !selectedMood}
              ></textarea>
            </div>
            
            <div className="flex justify-center">
              <button
                type="submit"
                className={`px-6 py-3 rounded-lg font-medium text-white shadow-md ${
                  !selectedMood || isLogging
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                } transition-colors`}
                disabled={!selectedMood || isLogging}
              >
                {isLogging ? 'Logging...' : 'Continue to Dashboard'}
              </button>
            </div>
          </form>
        </section>

        {logSuccess && (
          <div className="fixed inset-x-0 bottom-10 mx-auto w-max">
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md">
              <p className="font-medium">Mood logged successfully! Redirecting to dashboard...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodCheck;