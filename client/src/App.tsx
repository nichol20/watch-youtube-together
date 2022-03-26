import React from 'react';
import { Route, Routes } from 'react-router-dom'

import { CreateRoom, Room } from './components';

import 'stream-chat-react/dist/css/index.css'
import './App.css';

function App() {
  return (
    <Routes>
      <Route path='/' element={<CreateRoom />} />
      <Route path='/rooms/:roomId' element={<Room />} />
    </Routes>
  );
}

export default App;
