import { BrowserRouter, Route, Routes } from 'react-router';
import Login from './features/Login/Login.js';
import Register from './features/Register/Register.js';
import Dashboard from './features/Dashboard/Dashboard.js'
import Journal from './features/Dashboard/Journal/Journal.js';
import Music from './features/Dashboard/Music/Music.js';
import Home from './features/Home/Home.js';
import Header from './features/Home/Header.js';
import Motivation from './features/Dashboard/MotivationalContent/Motivation.js';
import Exercise from './features/Dashboard/Exercise/Exercise.js';
import Meditation from './features/Dashboard/Meditation/Meditation.js';
import { AuthProvider } from './features/AuthContext/AuthContext.js';
import MoodCheck from './features/Dashboard/MoodCheck/MoodCheck.js';
import LaughOutLoud from './features/Dashboard/LaughOutLoud/LaughOutLoud.js';
//import MoodBooster from './features/MoodEnhancer/MoodBooster.js';


function App() {
  
  return (
      <>
      <AuthProvider>
        <BrowserRouter>
          <Header />
            <Routes>
              <Route index element={<Home />} />
              <Route path='/' element={<Home />} />
              
              <Route path='/login' element={<Login />} />
              <Route path='/register' element={<Register />} />
              
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/journal" element={<Journal />} />

              <Route path="/music" element={<Music />} />

              <Route path="/motivation" element={<Motivation />} />
              <Route path="/meditation" element={<Meditation />} />
              <Route path="/exercise" element={<Exercise />} />
              <Route path="/moodcheck" element={<MoodCheck />} />
              <Route path="/laughoutloud" element={<LaughOutLoud />} />


            </Routes>
          </BrowserRouter>
      </AuthProvider>
      </>

  );
}

export default App;
