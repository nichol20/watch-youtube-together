import React, { useEffect, useState } from 'react'
import { Chat, Channel, MessageList, MessageInput, Window, CustomStyles } from 'stream-chat-react';
import { StreamChat, Channel as ChannelType } from 'stream-chat';
import { CustomMessage } from '..'

import './style.css'

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

const CustomChat = () => {
  const client = StreamChat.getInstance("nx3pg5tb49wc")
  const [ channel, setChannel ] = useState<ChannelType>()
  
  useEffect(() => {
    const user = {
      id: 'jane',
      name: 'jane',
      image: 'https://www.akamai.com/site/im-demo/perceptual-standard.jpg?imbypass=true'
    }

    const init = async () => {
      await client.connectUser(user, client.devToken(user.id))

      const channel = client.channel('messaging', 'react-group', {
        image: 'https://www.akamai.com/site/im-demo/perceptual-standard.jpg?imhttps://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885__480.jpgbypass=true',
        name: 'React Group',
        members: [ user.id ]
      })

      await channel.watch()

      setChannel(channel)
    }

    init()
  }, [client])

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