import { Laugh } from "lucide-react";
import { useState, useEffect } from 'react';

const Header = () => {
    const [emojiIndex, setEmojiIndex] = useState(0);
    
    // Array of calming and happy emojis to rotate through
    const emojis = ['😊', '😌', '🥰', '😇', '🧘', '✨', '🌿', '💆', '🌸', '🌼', '🌞', '🌠', '💙', '☁️', '🦋'];
    
    // Change emoji every 3 seconds for a more relaxing pace
    useEffect(() => {
        const interval = setInterval(() => {
            setEmojiIndex((prevIndex) => (prevIndex + 1) % emojis.length);
        }, 3000);
        
        return () => clearInterval(interval);
    }, [emojis.length]);

    const handleLogin = () => {
        window.location.href = '/login';
    };

    const handleLogout = async () => {
        try {
            // Replace this with your actual logout logic
            // await new UserService().logout();
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    // Simplified isLoggedIn check - replace with your auth state logic
    const isLoggedIn = false;

    return (
        <div className="header fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm p-4 shadow-sm flex items-center justify-between">
            <div className="logo-container flex items-center gap-3">
                <div className="logo-circle bg-gradient-to-br from-pink-400 to-pink-500 rounded-full w-12 h-12 flex items-center justify-center shadow-md">
                    <Laugh size={28} className="text-white animate-gentle-pulse" />
                </div>
                <div className="flex items-center">
                    <h1 className="text-3xl font-bold rainbow-text italic">Happify</h1>
                    <span className="ml-2 text-2xl animate-gentle-pulse">{emojis[emojiIndex]}</span>
                </div>
            </div>
            
            <div className="flex items-center gap-3">
                <div className="flex">
                    <span className="text-xl animate-gentle-bounce delay-100">😊</span>
                    <span className="text-xl animate-gentle-float delay-200">🌸</span>
                    <span className="text-xl animate-gentle-pulse delay-300">✨</span>
                    <span className="text-xl animate-gentle-bounce delay-400">💙</span>
                </div>
                
                {isLoggedIn ? (
                    <button 
                        type="button" 
                        className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                ) : (
                    <button 
                        type="button" 
                        className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                        onClick={handleLogin}
                    >
                        Login
                    </button>
                )}
            </div>
            
            <style jsx>{`
                /* Rainbow animation for text */
                @keyframes rainbow-shift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                
                .rainbow-text {
                    background: linear-gradient(to right, #7C3AED, #EC4899, #F59E0B, #10B981, #3B82F6, #8B5CF6);
                    background-size: 400% 400%;
                    -webkit-background-clip: text;
                    background-clip: text;
                    color: transparent;
                    animation: rainbow-shift 10s ease infinite;
                }
                
                /* Animation keyframes */
                @keyframes gentle-float {
                    0% { transform: translateY(0); opacity: 0.9; }
                    50% { transform: translateY(-10px); opacity: 1; }
                    100% { transform: translateY(0); opacity: 0.9; }
                }
                
                @keyframes gentle-pulse {
                    0% { opacity: 0.8; }
                    50% { opacity: 1; }
                    100% { opacity: 0.8; }
                }
                
                @keyframes gentle-bounce {
                    0% { transform: translateY(0); }
                    50% { transform: translateY(-6px); }
                    100% { transform: translateY(0); }
                }
                
                /* Animation classes */
                .animate-gentle-float {
                    animation: gentle-float 3s ease-in-out infinite;
                }
                
                .animate-gentle-pulse {
                    animation: gentle-pulse 3s ease-in-out infinite;
                }
                
                .animate-gentle-bounce {
                    animation: gentle-bounce 3s ease-in-out infinite;
                }
                
                /* Animation delays */
                .delay-100 { animation-delay: 0.1s; }
                .delay-200 { animation-delay: 0.2s; }
                .delay-300 { animation-delay: 0.3s; }
                .delay-400 { animation-delay: 0.4s; }
            `}</style>
        </div>
    );
};

export default Header;