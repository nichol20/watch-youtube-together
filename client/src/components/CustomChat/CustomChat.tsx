import React, { useEffect, useState } from 'react'
import { Chat, Channel, MessageList, MessageInput, Window, CustomStyles } from 'stream-chat-react';
import { StreamChat, Channel as ChannelType } from 'stream-chat';
import { CustomMessage } from '..'
import { v4 as uuidv4 } from 'uuid';

import './style.css'
import { api } from '../../api';
import { Socket } from 'socket.io-client';

const darkModeTheme: CustomStyles = {
  '--bg-gradient-end': '#101214',
  '--bg-gradient-start': '#070a0d',
  '--black': '#ffffff',
  '--blue-alice': '#00193d',
  '--border': '#141924',
  '--button-background': '#ffffff',
  '--button-text': '#005fff',
  '--grey': '#7a7a7a',
  '--grey-gainsboro': '#2d2f2f',
  '--grey-whisper': '#1c1e22',
  '--modal-shadow': '#000000',
  '--overlay': '#00000066',
  '--overlay-dark': '#ffffffcc',
  '--shadow-icon': '#00000080',
  '--targetedMessageBackground': '#302d22',
  '--transparent': 'transparent',
  '--white': '#101418',
  '--white-smoke': '#13151b',
  '--white-snow': '#070a0d',
}

interface User {
  id: string
}

interface CustomChatProps {
  user: User
  roomId: string
  socket: Socket
}

const api_key = process.env.REACT_APP_STREAM_API_KEY

const CustomChat = ({ user, socket, roomId }: CustomChatProps) => {
  const client = StreamChat.getInstance(api_key!)
  const [ channel, setChannel ] = useState<ChannelType>()

  useEffect(() => { 
    const initChannel = async () => {
      const channelId = uuidv4()
      const response = await api.post('/signup', { userId: user.id })
      const { token } = response.data

      await client.connectUser({ id: user.id }, token)

      const channel = client.channel('messaging', channelId, {
        name: 'Watch Youtube Together',
        members: [ user.id ]
      })

      socket.emit('new_chat', { roomId, channelId })

      await channel.watch()

      setChannel(channel)
    }

    const joinChannel = async (channelIdFromServer: string) => {
      const response = await api.post('/signup', { userId: user.id })
      const { token } = response.data

      await client.connectUser({ id: user.id }, token)
      const channel = await client.getChannelById('messaging', channelIdFromServer, {
        name: 'Watch Youtube Together'
      })

      channel.addMembers([ user.id ])
      setChannel(channel)
    }
    
    const checkIfTheChannelAlreadyExist = async (channelIdFromServer: string) => {
      if(channelIdFromServer === '') initChannel()
      else joinChannel(channelIdFromServer)
    }

    socket.emit('joined_the_chat', { roomId }, (channelId: string) => {
      checkIfTheChannelAlreadyExist(channelId)
    })

  }, [client, roomId, socket, user])

  return (
    <div className="chat">
      <Chat client={client} customStyles={darkModeTheme}>
        <Channel channel={channel} Message={CustomMessage} >
          <Window>
            <MessageList disableDateSeparator />
            <MessageInput />
          </Window>
        </Channel>
      </Chat>
    </div>
  )
}

export default CustomChat