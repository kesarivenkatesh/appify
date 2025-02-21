import { BrowserRouter, Route, Routes } from 'react-router';
import Login from './features/Login/Login.js';
import Register from './features/Register/Register.js';
import Home from './features/Home.js';
import Header from './features/Header.js';
import Journal from './features/journal.js';


function App() {
  return (
      <>
        <BrowserRouter>
        <Header/>
          <Routes>
            <Route index element={<Home />} />
            <Route path='/' element={<Home />}/>
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route path='/journal' element={<Journal />} />
          </Routes>
        </BrowserRouter>
      </>

  );
}

export default App;
