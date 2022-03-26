import React, { BaseSyntheticEvent } from 'react'
import { useMessageContext, MessageStatus, Avatar, MessageTimestamp, useChatContext } from 'stream-chat-react';

import './style.css'

const CustomMessage = () => {
  const { message } = useMessageContext();
  const { client } = useChatContext()
  const isCurrentUser = client.user?.id === message.user?.id
  const messageDateInMiliseconds = new Date(message.created_at!).getTime()
  const dateNowInMiliseconds = Date.now()
  const differenceInDays = Math.floor((dateNowInMiliseconds - messageDateInMiliseconds) / (1000 * 3600 * 24))

  const handleOnMouseOverAvatar = (e: BaseSyntheticEvent) => {
    const avatar: HTMLImageElement = e.target
    const showNameElementSpan: HTMLSpanElement = document.createElement('span')
    const showNameElementBox: HTMLDivElement = document.createElement('div')

    showNameElementSpan.innerHTML = message.user?.name ?? 'guest'
    showNameElementBox.classList.add('show-name-box')
    showNameElementBox.appendChild(showNameElementSpan)
    avatar.parentElement?.appendChild(showNameElementBox)

    avatar.onmouseout = () => showNameElementBox.remove()
  }

  return (
    <div className={`custom-message ${isCurrentUser ? 'current-user': ''}`}>
      <div className="message-box">
        <Avatar image={message.user?.image} onMouseOver={handleOnMouseOverAvatar}/>
        <p className="message">{message.text}</p>
      </div>
      <div className="timestamp-box">
        <span>
          {differenceInDays < 1 ? 'today' : 
            differenceInDays === 1 ? 'yesterday' : 
              `${differenceInDays} days ago` } at </span>
        <MessageTimestamp/>
      </div>
      <MessageStatus />
    </div>
  )
}

export default CustomMessage