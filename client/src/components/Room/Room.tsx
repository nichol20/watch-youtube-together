import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { VideoPlayer, CustomChat } from '..'
import { api } from '../../api'
import copyIcon from '../../assets/copy-outline.svg'

import './style.css'

const Room = () => {
  const { roomId } = useParams()
  const [ roomExists, setRoomExits ] = useState(false)

  const copyRoomIdToClipboard = () => {
    navigator.clipboard.writeText(roomId!)
  }

  useEffect(() => {
    const getRoom = async () => {
      const room = await api.get(`/rooms/${roomId}`)

      if(room) setRoomExits(true)
    }

    getRoom()
  }, [roomId])

  if(!roomExists) return (<h1 style={{ "color": "#fff" }}>Loading ...</h1>)

  return (
    <div className="room">
      <div className="left-side-box-room">
        <div className="room-id-box">
          <span>{roomId}</span>
          <button onClick={copyRoomIdToClipboard}>
            <img src={copyIcon} alt="copy" />
          </button>
        </div>
        <VideoPlayer roomId={roomId!} />
      </div>
      {/* <CustomChat /> */}
    </div>
  )
}

export default Room