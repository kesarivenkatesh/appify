// EmojiAnimation.js - Reusable component for emoji animations across all pages
import React, { useState, useEffect, useRef } from "react";

const EmojiAnimation = ({
  triggerExplosion = false,
  onExplosionComplete = () => {},
}) => {
  const [floating, setFloating] = useState([]);
  const [emojiExplosion, setEmojiExplosion] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const laughSoundRef = useRef(null);
  const calmSoundRef = useRef(null);

  // Sound initialization
  useEffect(() => {
    laughSoundRef.current = new Audio(
      "https://freesound.org/data/previews/457/457932_4166055-lq.mp3"
    );
    laughSoundRef.current.volume = 0.3;

    calmSoundRef.current = new Audio(
      "https://freesound.org/data/previews/364/364666_5963515-lq.mp3"
    );
    calmSoundRef.current.volume = 0.2;
    calmSoundRef.current.loop = true;
  }, []);

  // Watch for external explosion trigger
  useEffect(() => {
    if (triggerExplosion) {
      triggerEmojiExplosion();
    }
  }, [triggerExplosion]);

  // Play sound function with safety checks
  const playSound = (soundRef) => {
    if (soundEnabled && soundRef.current) {
      soundRef.current.currentTime = 0;
      try {
        soundRef.current
          .play()
          .catch((e) => console.log("Audio play prevented:", e));
      } catch (error) {
        console.log("Audio error:", error);
      }
    }
  };

  // Stop sound function with safety checks
  const stopSound = (soundRef) => {
    if (soundRef.current) {
      try {
        soundRef.current.pause();
        soundRef.current.currentTime = 0;
      } catch (error) {
        console.log("Audio error:", error);
      }
    }
  };

  // Create floating emoji effect with clear, highly visible emojis
  const addFloatingEmoji = (isExplosion = false) => {
    // Large, colorful emojis that stand out clearly
    const happyEmojis = [
      "😊",
      "😄",
      "😁",
      "😀",
      "😃",
      "🥰",
      "😇",
      "🤩",
      "🌟",
      "⭐",
      "✨",
      "💫",
      "🌈",
      "💖",
      "💕",
      "💓",
      "💗",
      "💛",
      "💚",
      "💙",
      "💜",
    ];
    const emoji = happyEmojis[Math.floor(Math.random() * happyEmojis.length)];

    // Position differently based on explosion or normal floating
    const left = isExplosion
      ? 10 + Math.random() * 80 // More concentrated for explosion
      : 5 + Math.random() * 90; // Full width coverage

    // Random starting position from bottom of screen
    const bottom = isExplosion
      ? -20 + Math.random() * 10 // Slightly below viewport for explosion
      : -10 + Math.random() * 5; // Just below viewport for regular

    // MUCH larger sizes for ultra visibility
    const size = isExplosion
      ? 3 + Math.random() * 2 // Huge for explosion (3-5rem)
      : 2 + Math.random() * 1.5; // Large for normal (2-3.5rem)

    // Random rotation for more dynamic appearance
    const rotation = Math.random() * 360;

    const id = Date.now() + Math.random();

    setFloating((prev) => [
      ...prev,
      {
        id,
        emoji,
        left,
        bottom,
        size,
        rotation,
        isExplosion,
      },
    ]);

    // Remove emoji after animation completes
    setTimeout(
      () => {
        setFloating((prev) => prev.filter((item) => item.id !== id));
      },
      isExplosion ? 4000 : 7000
    );
  };

  // Create emoji explosion effect - enhanced for maximum visibility
  const triggerEmojiExplosion = () => {
    setEmojiExplosion(true);
    playSound(laughSoundRef);

    // Create a large number of emoji animations in multiple waves
    // First wave - immediate burst
    for (let i = 0; i < 40; i++) {
      setTimeout(() => {
        addFloatingEmoji(true);
      }, i * 20); // Very fast staggering
    }

    // Second wave
    setTimeout(() => {
      for (let i = 0; i < 30; i++) {
        setTimeout(() => {
          addFloatingEmoji(true);
        }, i * 30);
      }
    }, 800);

    // Third wave for sustained effect
    setTimeout(() => {
      for (let i = 0; i < 25; i++) {
        setTimeout(() => {
          addFloatingEmoji(true);
        }, i * 40);
      }
    }, 1600);

    // Clear the explosion effect after animation completes
    setTimeout(() => {
      setEmojiExplosion(false);
      onExplosionComplete(); // Notify parent the explosion is complete
    }, 5000);
  };

  // Toggle ambient sound
  const toggleAmbientSound = () => {
    setSoundEnabled((prev) => {
      if (!prev) {
        playSound(calmSoundRef);
      } else {
        stopSound(calmSoundRef);
      }
      return !prev;
    });
  };

  // Periodically add floating emojis for ambient effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (!emojiExplosion) {
        addFloatingEmoji(false);
      }
    }, 1500); // More frequent

    return () => clearInterval(interval);
  }, [emojiExplosion]);

  return (
    <>
      {/* Highly visible emoji animations container */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
        {/* Emoji Burst Animation Overlay */}
        {emojiExplosion && (
          <div className="emoji-burst-overlay absolute inset-0 z-5" />
        )}

        {/* Floating Emojis with ultra-clear visibility */}
        {floating.map((item) => (
          <div
            key={item.id}
            className={`absolute ${
              item.isExplosion
                ? "animate-explosion-vertical"
                : "animate-float-vertical"
            }`}
            style={{
              left: `${item.left}%`,
              bottom: `${item.bottom}%`,
              fontSize: `${item.size}rem`,
              transform: `rotate(${item.rotation}deg)`,
              animationDuration: item.isExplosion
                ? `${2 + Math.random() * 1.5}s`
                : `${6 + Math.random() * 4}s`,
              opacity: 1, // Full opacity for maximum visibility
              zIndex: 15,
              willChange: "transform, opacity", // Performance optimization
            }}
          >
            {item.emoji}
          </div>
        ))}
      </div>

      {/* Sound Controls */}
      <div className="absolute top-4 right-24 z-30 flex gap-3">
        <button
          className={`p-2 rounded-full transition-all ${
            soundEnabled ? "bg-purple-200" : "bg-gray-100"
          }`}
          onClick={toggleAmbientSound}
        >
          {soundEnabled ? "🔊" : "🔈"}
        </button>
        <button
          className="p-2 rounded-full bg-purple-100 hover:bg-purple-200 transition-all"
          onClick={triggerEmojiExplosion}
        >
          😄
        </button>
      </div>

      <style jsx>{`
        /* Animation for clear bottom-to-top movement */
        @keyframes float-vertical {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 1;
            transform: translateY(-10vh) scale(1);
          }
          90% {
            opacity: 1;
            transform: translateY(-90vh) scale(1);
          }
          100% {
            transform: translateY(-100vh) scale(1);
            opacity: 0;
          }
        }

        /* Animation for explosive bottom-to-top movement */
        @keyframes explosion-vertical {
          0% {
            transform: translateY(0) scale(0.5);
            opacity: 0;
          }
          15% {
            transform: translateY(-15vh) scale(1.2);
            opacity: 1;
          }
          85% {
            opacity: 1;
            transform: translateY(-85vh) scale(1);
          }
          100% {
            transform: translateY(-100vh) scale(0.8);
            opacity: 0;
          }
        }

        @keyframes burst-overlay {
          0% {
            background-color: rgba(255, 255, 255, 0);
          }
          10% {
            background-color: rgba(255, 255, 255, 0.3);
          }
          100% {
            background-color: rgba(255, 255, 255, 0);
          }
        }

        .animate-float-vertical {
          animation: float-vertical 7s ease-out forwards;
        }

        .animate-explosion-vertical {
          animation: explosion-vertical 4s ease-out forwards;
        }

        .emoji-burst-overlay {
          animation: burst-overlay 2s ease-out forwards;
        }
        // Add to your component or CSS
        @media (max-width: 768px) {
          .emoji-controls {
            top: auto;
            bottom: 1rem;
            right: 1rem;
          }

          /* Adjust emoji sizes for mobile */
          .emoji-animation {
            font-size: 0.8em; /* Reduce base size on mobile */
          }
        }
      `}</style>
    </>
  );
};

export default EmojiAnimation;
