import React, { useEffect, useState} from 'react'
import YouTube, { Options } from 'react-youtube';
import { io } from 'socket.io-client'

import './style.css'

const socket = io('http://localhost:4000')

interface VideoPlayerProps {
  roomId: string
}

const VideoPlayer = ({ roomId }:VideoPlayerProps) => {
  const [ YTPlayer, setYTPlayer ] = useState()
  const [ linkVideo, setLinkVideo ] = useState('') //user-entered link
  const [ videoId, setVideoId ] = useState('a5V6gdu5ih8')
  const [ currentTime, setCurrentTime ] = useState(0)
  const [ isSettingCurrentTime, setIsSettingCurrentTime ] = useState(false)
  const opts: Options = {
    height: '405',
    width: '720',
    host: 'https://www.youtube.com',
    playerVars: {
      autoplay: 0,
      rel: 0,
      origin: 'http://localhost:3000',
      enablejsapi: 1
    },
  }
  const YoutubePlayerController = {
    handleOnReady: (e: any) => {
      setYTPlayer(e.target)
      socket.on('pause_video', () => { if(e.target.getPlayerState() !== 2) e.target.pauseVideo() })
      socket.on('play_video', () => { if(e.target.getPlayerState() !== 1) e.target.playVideo() })
      socket.on('mute_video', () => { if(!e.target.isMuted()) e.target.mute() })
      socket.on('change_video', linkVideo => setLinkVideo(linkVideo))
    },
    
    handlePlay: (e: any) => {
      socket.emit('play_video', roomId)
      setCurrentTime(e.target.getCurrentTime())
    },
    
    handlePause: (e: any) => {
      socket.emit('pause_video', roomId)
    },

  }

  // useEffect(() => {
  //   if(YTPlayer && !isSettingCurrentTime) {
  //     setIsSettingCurrentTime(true)
  //     setTimeout(() => {
  //       //@ts-ignore
  //       setCurrentTime(YTPlayer.getCurrentTime())
  //       setIsSettingCurrentTime(false)
  //     }, 1500)
  //     socket.emit('video_current_time', ({ roomId, currentTime }))
  //   }
  // }, [currentTime, YTPlayer, roomId, isSettingCurrentTime])

  useEffect(() => {
    socket.emit('joined', roomId, (currentVideo: string, currentTime: number) => {
      if(currentVideo !== '') setLinkVideo(currentVideo)
      console.log(currentTime)
    })
  }, [ roomId ])
  
  useEffect(() => {
    if(linkVideo.includes('watch?v=')) {
      let [, videoId ] = linkVideo.split('watch?v=')

      if(videoId.includes('&')) {
        videoId = videoId.split('&')[0]
      }
      setVideoId(videoId)
      socket.emit('change_video', { roomId, linkVideo })
    }
  }, [ linkVideo, roomId ])

  return (
    <div className="container-video-player">
        <input className='search-bar' type="text" onChange={e => setLinkVideo(e.target.value)}/>

        <div className="video-player">
          <YouTube
           videoId={videoId}
           opts={opts}
           onReady={YoutubePlayerController.handleOnReady}
           onPause={YoutubePlayerController.handlePause}
           onPlay={YoutubePlayerController.handlePlay}
          />
        </div>
      </div>
  )
}

export default VideoPlayer