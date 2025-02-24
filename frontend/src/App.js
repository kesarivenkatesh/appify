import { BrowserRouter, Route, Routes } from 'react-router';
import Login from './features/Login/Login.js';
import Register from './features/Register/Register.js';
import Dashboard from './features/Dashboard/Dashboard.js'
import Journal from './features/Dashboard/Journal/Journal.js';


function App() {
  return (
      <>
        <BrowserRouter>
          <Routes>
            <Route index element={<Login />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/journal" element={<Journal />} />
          </Routes>
        </BrowserRouter>
      </>

  );
}

export default App;
