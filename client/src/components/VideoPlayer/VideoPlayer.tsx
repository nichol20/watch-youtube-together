import React, { useEffect, useState} from 'react'
import YouTube, { Options } from 'react-youtube';

import './style.css'
import searchIcon from '../../assets/search.svg'
import { Socket } from 'socket.io-client';

type YouTubePlayer = any
interface OnReadyEvent { target: YouTubePlayer }
interface OnPlayEvent { target: YouTubePlayer; data: number }
interface OnPauseEvent { target: YouTubePlayer; data: number }
interface OnPlaybackRateChangeEvent { target: YouTubePlayer; data: number }

interface User {
  id: string
}

interface VideoPlayerProps {
  roomId: string
  user: User
  socket: Socket
}

const VideoPlayer = ({ roomId, user, socket }:VideoPlayerProps) => {
  const [ YTPlayer, setYTPlayer ] = useState<YouTubePlayer>()
  const [ linkVideo, setLinkVideo ] = useState('') //user-entered link
  const videoId = localStorage.getItem('@videoId') ?? 'a5V6gdu5ih8'
  const [ isEmittingCurrentSettings, setIsEmittingCurrentSettings ] = useState(false)
  const opts: Options = {
    height: '405',
    width: '720',
    host: 'https://www.youtube.com',
    playerVars: {
      autoplay: 1,
      rel: 0,
      origin: 'http://localhost:3000',
      enablejsapi: 1
    },
  }
  const YoutubePlayerController = {
    handleOnReady: (e: OnReadyEvent) => {
      setYTPlayer(e.target)
      socket.on('pause_video', () => { if(e.target.getPlayerState() !== 2) e.target.pauseVideo() })
      socket.on('play_video', () => { if(e.target.getPlayerState() !== 1) e.target.playVideo() })
      socket.on('change_rate', rate => { if(e.target.getPlaybackRate() !== rate) e.target.setPlaybackRate(rate) })
      socket.on('change_video', videoIdFromServer => {
        localStorage.setItem('@videoId', videoIdFromServer)
        window.location.reload();
      })
      socket.on('sync_video', ({ time, volume, isMuted, rate }) => {
        if(isMuted) e.target.mute()
        else e.target.unMute()

        e.target.seekTo(time, true)
        e.target.setVolume(volume)
        e.target.setPlaybackRate(rate)
        e.target.playVideo()
      })
    },
    
    handlePlay: (e: OnPlayEvent) => {
      socket.emit('play_video', roomId)
    },
    
    handlePause: (e: OnPauseEvent) => {
      socket.emit('pause_video', roomId)
    },

    handleRateChange: (e: OnPlaybackRateChangeEvent) => {
      socket.emit('change_rate', { roomId, rate: e.data })
    },

    handleChangeVideo: () => {
      if(linkVideo.includes('watch?v=')) {
        let [, videoId ] = linkVideo.split('watch?v=')
  
        if(videoId.includes('&')) {
          videoId = videoId.split('&')[0]
        }
        localStorage.setItem('@videoId', videoId)
        socket.emit('change_video', { roomId, videoId })
      }
    },

    synchronize: () => {
      YTPlayer.pauseVideo()
      socket.emit('sync_video', {
        roomId, 
        time: YTPlayer.getCurrentTime(),
        volume: YTPlayer.getVolume(),
        isMuted: YTPlayer.isMuted(),  
        rate: YTPlayer.getPlaybackRate() 
      })
    },
    
  }

  useEffect(() => {
    if(YTPlayer && !isEmittingCurrentSettings) {
      setIsEmittingCurrentSettings(true)
      setTimeout(() => {
        setIsEmittingCurrentSettings(false)
      }, 1000)
      socket.emit('current_settings', ({ 
        roomId, 
        userId: user.id, 
        currentTime: YTPlayer.getCurrentTime(),
        currentVolume: YTPlayer.getVolume(),
        isMuted: YTPlayer.isMuted(), 
        currentRate: YTPlayer.getPlaybackRate() 
      }))
    }
  }, [YTPlayer, roomId, isEmittingCurrentSettings, user, socket])

  useEffect(() => {
    socket.emit('joined', { roomId , userId: user.id }, (currentVideo: string, currentTime: number, currentVolume: number, isMuted: boolean, currentRate: number) => {
      if(currentVideo !== '' && currentVideo !== videoId) {
        localStorage.setItem('@videoId', currentVideo)
        window.location.reload()
      }
      if(YTPlayer) {
        if(isMuted) YTPlayer.mute()
        else YTPlayer.unMute()
        
        YTPlayer.seekTo(currentTime, true)
        YTPlayer.setVolume(currentVolume)
        YTPlayer.setPlaybackRate(currentRate)
      }
    })
  }, [roomId, user, YTPlayer, videoId, socket])

  return (
    <div className="container-video-player">
      <div className="search-bar-box">
        <input
         className='search-bar' 
         type="text"
         placeholder="insert a youtube link" 
         onChange={e => setLinkVideo(e.target.value)}
        />
        <button onClick={YoutubePlayerController.handleChangeVideo}>
          <img src={searchIcon} alt="search" />
        </button>
      </div>

      <YouTube
        videoId={videoId}
        opts={opts}
        onReady={YoutubePlayerController.handleOnReady}
        onPause={YoutubePlayerController.handlePause}
        onPlay={YoutubePlayerController.handlePlay}
        onPlaybackRateChange={YoutubePlayerController.handleRateChange}
      />

      <button className='sync-button' onClick={YoutubePlayerController.synchronize} >Sync</button>
    </div>
  )
}

export default VideoPlayer