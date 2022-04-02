import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { api } from '../../api';

import './style.css'

const CreateRoom = () => {
  const navigate = useNavigate()
  const [ roomIdInserted, setRoomIdInserted ] = useState('')

  const handleCreateRoom = async () => {
    const roomId = uuidv4().slice(0, 6)

    navigate(`/rooms/${roomId}`)
    await api.post('/create-room', { roomId })
  }

  const handleJoinRoom = () => navigate(`/rooms/${roomIdInserted}`)

  return (
    <div className="create-room">
      <div className="container-create-room">
        <button onClick={handleCreateRoom}>Create a Room</button>
        <span>-------  or  -------</span>
        <div className="join-room">
          <input
           type="text" 
           placeholder='insert a room id' 
           onChange={e => setRoomIdInserted(e.target.value)}
           data-testid="input-to-insert-room-id"
          />
          <button onClick={handleJoinRoom} >Join a Room</button>
        </div>
      </div>
    </div>
  )
}

export default CreateRoom