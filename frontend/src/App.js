import { BrowserRouter, Route, Routes } from 'react-router';
import Login from './features/Login/Login.js';
import Register from './features/Register/Register.js';
import Dashboard from './features/Dashboard/Dashboard.js';
import Journal from './features/Dashboard/Journal/Journal.js';
import Music from './features/Dashboard/Music/Music.js';
import Home from './features/Home/Home.js';
import Header from './features/Home/Header.js';
import Motivation from './features/Dashboard/MotivationalContent/Motivation.js';
import Exercise from './features/Dashboard/Exercise/Exercise.js';
import Meditation from './features/Dashboard/Meditation/Meditation.js';
import MoodCheck from './features/Dashboard/MoodCheck/MoodCheck.js';
import UserProfile from './features/Dashboard/UserProfile/UserProfile.js';
import LaughOutLoud from './features/Dashboard/LaughOutLoud/LaughOutLoud.js';
import { AuthProvider } from './features/AuthContext/AuthContext.js';
import AppWrapper from './features/AppWrapper';
import MainLayout from './features/MainLayout'; // Import the new MainLayout component
import { EmojiAnimationProvider } from './features/EmojiAnimationContext';
import MoodAnalyticsPage from './features/Dashboard/MoodAnalytics/MoodAnalyticsPage.js';
import AboutUs from './features/Home/AboutUs.js';

function App() {
  return (
    <>
      <AuthProvider>
        <EmojiAnimationProvider>
          <AppWrapper>
            <BrowserRouter>
              <Routes>
                {/* Public routes with header */}
                <Route path="/about" element={<AboutUs />} />
                <Route path="/" element={
                  <>
                    <Header />
                    <Home />
                    
                  </>
                } />
                <Route path="/login" element={
                  <>
                    <Header />
                    <Login />
                  </>
                } />
                <Route path="/register" element={
                  <>
                    <Header />
                    <Register />
                  </>
                } />
                
                {/* Mood Check (Required after login before dashboard) */}
                <Route path="/moodcheck" element={<MoodCheck />} />
                
                {/* All protected dashboard routes wrapped in MainLayout */}
                <Route element={<MainLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/journal" element={<Journal />} />
                  <Route path="/music" element={<Music />} />
                  <Route path="/motivation" element={<Motivation />} />
                  <Route path="/meditation" element={<Meditation />} />
                  <Route path="/exercise" element={<Exercise />} />
                  <Route path="/laughoutloud" element={<LaughOutLoud />} />
                  <Route path="/mood-analytics" element={<MoodAnalyticsPage />} />
                  <Route path="/user-profile" element={<UserProfile />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </AppWrapper>
        </EmojiAnimationProvider>
      </AuthProvider>
    </>
  );
}

export default App;