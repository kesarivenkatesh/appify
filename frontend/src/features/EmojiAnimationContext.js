// EmojiAnimationContext.js - For app-wide customization and theming
import React, { createContext, useState, useContext, useEffect } from 'react';

// Default emoji sets based on themes
const EMOJI_SETS = {
  default: ['😊', '😄', '😁', '😀', '😃', '🥰', '😇', '🤩', '💫', '✨', '🌈', '💖', '💕', '💗', '💙', '💜'],
  calm: ['😌', '😊', '🧘', '💆', '🌸', '🌿', '🦋', '🌼', '☁️', '💤', '🌙', '✨', '💫', '💙', '🪷', '🍃'],
  celebration: ['🎉', '🎊', '🎈', '🥳', '🎆', '🎇', '✨', '💫', '⭐', '🌟', '💖', '💕', '😄', '😁', '🤩', '🥰'],
  nature: ['🌸', '🌼', '🌺', '🌷', '🍃', '🌿', '🍀', '🌱', '🦋', '🐝', '🐞', '🌈', '☀️', '🌤️', '⛅', '🌦️'],
  cosmic: ['✨', '💫', '🌟', '⭐', '🌠', '🌌', '🪐', '🌙', '☄️', '🚀', '🛸', '👽', '👾', '🌈', '🔮', '💜']
};

// Create context
const EmojiAnimationContext = createContext();

export const EmojiAnimationProvider = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState('default');
  
  // Emoji set based on theme
  const [emojiSet, setEmojiSet] = useState(EMOJI_SETS.default);
  
  // Animation speed
  const [animationSpeed, setAnimationSpeed] = useState(1); // 1 = normal, < 1 is faster, > 1 is slower
  
  // Emoji size factor
  const [sizeMultiplier, setSizeMultiplier] = useState(1); // 1 = normal size
  
  // Emoji frequency
  const [frequency, setFrequency] = useState(1500); // milliseconds between ambient emojis
  
  // Ambient emojis enabled
  const [ambientEnabled, setAmbientEnabled] = useState(true);
  
  // Update emoji set when theme changes
  useEffect(() => {
    setEmojiSet(EMOJI_SETS[theme] || EMOJI_SETS.default);
  }, [theme]);
  
  // Context value
  const value = {
    theme,
    setTheme,
    emojiSet,
    setEmojiSet,
    animationSpeed,
    setAnimationSpeed,
    sizeMultiplier,
    setSizeMultiplier,
    frequency,
    setFrequency,
    ambientEnabled,
    setAmbientEnabled,
    
    // Predefined theme sets
    availableThemes: Object.keys(EMOJI_SETS),
    
    // Utility function to change all settings at once for a specific mood/feel
    applyTheme: (themeName) => {
      if (EMOJI_SETS[themeName]) {
        setTheme(themeName);
        
        // Different speeds and sizes for different themes
        switch (themeName) {
          case 'calm':
            setAnimationSpeed(1.3); // Slower for calm
            setSizeMultiplier(0.9); // Slightly smaller
            setFrequency(2000); // Less frequent
            break;
          case 'celebration':
            setAnimationSpeed(0.8); // Faster for celebration
            setSizeMultiplier(1.2); // Larger
            setFrequency(1000); // More frequent
            break;
          case 'nature':
            setAnimationSpeed(1.1); // Slightly slower
            setSizeMultiplier(1.0); // Normal size
            setFrequency(1800); // Moderate frequency
            break;
          case 'cosmic':
            setAnimationSpeed(1.0); // Normal speed
            setSizeMultiplier(1.1); // Slightly larger
            setFrequency(1600); // Moderate frequency
            break;
          default:
            setAnimationSpeed(1.0); // Reset to normal
            setSizeMultiplier(1.0); // Reset to normal
            setFrequency(1500); // Reset to normal
        }
      }
    }
  };
  
  return (
    <EmojiAnimationContext.Provider value={value}>
      {children}
    </EmojiAnimationContext.Provider>
  );
};

// Custom hook for using emoji animation context
export const useEmojiAnimation = () => {
  const context = useContext(EmojiAnimationContext);
  if (context === undefined) {
    throw new Error('useEmojiAnimation must be used within an EmojiAnimationProvider');
  }
  return context;
};

// Enhanced EmojiAnimation.js with context support
// Include this at the top of your EmojiAnimation.js file:
/*
import { useEmojiAnimation } from './EmojiAnimationContext';

const EmojiAnimation = ({ triggerExplosion = false, onExplosionComplete = () => {} }) => {
  // Get theme settings from context
  const { 
    emojiSet, 
    animationSpeed, 
    sizeMultiplier, 
    frequency,
    ambientEnabled 
  } = useEmojiAnimation();
  
  // ... Rest of component
  
  // Use context values:
  // 1. Use emojiSet instead of hardcoded emoji arrays
  // 2. Multiply animation durations by animationSpeed
  // 3. Multiply emoji sizes by sizeMultiplier
  // 4. Use frequency for the interval timing
  // 5. Check ambientEnabled before adding ambient emojis
}
*/

// Example Settings component that could be added to your app
export const EmojiSettings = () => {
  const { 
    theme, 
    availableThemes, 
    applyTheme, 
    animationSpeed, 
    setAnimationSpeed,
    sizeMultiplier,
    setSizeMultiplier,
    ambientEnabled, 
    setAmbientEnabled 
  } = useEmojiAnimation();
  
  return (
    <div className="emoji-settings p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-bold mb-3">Emoji Animation Settings</h3>
      
      <div className="form-group mb-3">
        <label className="block mb-1">Theme</label>
        <select 
          value={theme} 
          onChange={(e) => applyTheme(e.target.value)}
          className="w-full p-2 border rounded"
        >
          {availableThemes.map(theme => (
            <option key={theme} value={theme}>
              {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </option>
          ))}
        </select>
      </div>
      
      <div className="form-group mb-3">
        <label className="block mb-1">Animation Speed: {animationSpeed.toFixed(1)}x</label>
        <input 
          type="range" 
          min="0.5" 
          max="2" 
          step="0.1" 
          value={animationSpeed}
          onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>
      
      <div className="form-group mb-3">
        <label className="block mb-1">Emoji Size: {sizeMultiplier.toFixed(1)}x</label>
        <input 
          type="range" 
          min="0.5" 
          max="2" 
          step="0.1" 
          value={sizeMultiplier}
          onChange={(e) => setSizeMultiplier(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>
      
      <div className="form-group">
        <label className="flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            checked={ambientEnabled}
            onChange={(e) => setAmbientEnabled(e.target.checked)}
            className="mr-2"
          />
          Enable ambient emojis
        </label>
      </div>
    </div>
  );
};