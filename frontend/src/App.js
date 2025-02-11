import { BrowserRouter, Route, Routes } from 'react-router';
import Login from './features/Login/Login.js';
import Register from './features/Register/Register.js';


function App() {
  return (
      <>
        <BrowserRouter>
          <Routes>
            <Route index element={<Login />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
          </Routes>
        </BrowserRouter>
      </>

  );
}

export default App;
