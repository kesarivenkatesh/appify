import React, { useState } from 'react';
import { Smile, Frown, Meh, Zap, Battery } from 'lucide-react';

const moodOptions = [
  { value: 'happy', label: 'Happy', icon: <Smile className="w-8 h-8" />, color: 'bg-green-100 text-green-600' },
  { value: 'sad', label: 'Sad', icon: <Frown className="w-8 h-8" />, color: 'bg-blue-100 text-blue-600' },
  { value: 'neutral', label: 'Neutral', icon: <Meh className="w-8 h-8" />, color: 'bg-gray-100 text-gray-600' },
  { value: 'energetic', label: 'Energetic', icon: <Zap className="w-8 h-8" />, color: 'bg-yellow-100 text-yellow-600' },
  { value: 'tired', label: 'Tired', icon: <Battery className="w-8 h-8" />, color: 'bg-purple-100 text-purple-600' },
];

const MoodCheck = () => {
  const [selectedMood, setSelectedMood] = useState(null);

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
  };

  return (
    <div className="space-y-10">
      <section className="bg-white rounded-lg shadow-md p-14">
        <h2 className="text-2xl font-bold mb-4">How are you feeling today?</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {moodOptions.map((mood) => (
            <button
              key={mood.value}
              onClick={() => handleMoodSelect(mood.value)}
              className={`${
                mood.color
              } p-4 rounded-lg flex flex-col items-center justify-center space-y-2 transition-all ${
                selectedMood === mood.value ? 'ring-2 ring-offset-2 ring-purple-500' : ''
              }`}
            >
              {mood.icon}
              <span className="font-medium">{mood.label}</span>
            </button>
          ))}
        </div>
      </section>

      {selectedMood && (
        <section className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4">Mood Logged!</h3>
          <p className="text-gray-600">
            Thanks for sharing how you're feeling. Here are some recommendations based on your mood:
          </p>
          <ul className="mt-4 space-y-2">
            {selectedMood === 'sad' && (
              <>
                <li>• Visit the "Motivation" page for uplifting content</li>
                <li>• Check out the "Laugh Out Loud" section to lift your spirits</li>
              </>
            )}
            {selectedMood === 'tired' && (
              <>
                <li>• Try a quick meditation session to refresh your mind</li>
                <li>• Consider some light exercise to boost your energy</li>
              </>
            )}
            {selectedMood === 'energetic' && (
              <>
                <li>• Channel your energy into a workout session</li>
                <li>• Share your positive vibes in the "Laugh Out Loud" section</li>
              </>
            )}
            {selectedMood === 'happy' && (
              <>
                <li>• Spread the joy in the "Laugh Out Loud" section</li>
                <li>• Keep the positive momentum with some exercise</li>
              </>
            )}
            {selectedMood === 'neutral' && (
              <>
                <li>• Browse through motivational quotes to get inspired</li>
                <li>• Try a meditation session to enhance your mood</li>
              </>
            )}
          </ul>
        </section>
      )}
    </div>
  );
};

export default MoodCheck;
