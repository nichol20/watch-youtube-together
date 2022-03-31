import { serverHttp, io } from "./app";

const PORT = process.env.PORT || 4000

interface User {
  id: string
  socketId: string
  currentTime?: number
  currentRate?: number
  currentVolume?: number
  isMuted?: boolean
}

interface RoomsVideos {
  id: string
  channelId?: string
  currentVideo?: string
  users: User[]
}
type Rooms = RoomsVideos[]

export const rooms: Rooms = []

const RoomController = {
  insertUserInRoom: (roomId: string, userId: string, socketId: string) => {
    rooms.forEach((room, indexRoom) => {
      if(room.id === roomId) {
        const user = room.users.filter(user => user.id === userId)
        if(!user[0]) rooms[indexRoom].users.push({ id: userId, socketId: socketId })
      }
    })
  },

  getCurrentVideo: (roomId: string) => {
    const currentRoom = rooms.filter(room => room.id === roomId)
    return currentRoom[0]?.currentVideo ?? ''
  },

  setCurrentVideo: (roomId: string, videoId: string) => {
    rooms.forEach((room, index) => {
      if(room.id === roomId) rooms[index] = { ...room, currentVideo: videoId }
    })
  },
  
  getCurrentTime: (roomId: string) => {
    const currentRoom = rooms.filter(room => room.id === roomId)
    //get currentTime from penultimate user (the last one is the current user)
    const currentTime = currentRoom[0]?.users.slice(-2)[0]?.currentTime ?? 0
    return currentTime
  },

  setCurrentTime: (roomId: string, userId: string , currentTime: number) => {
    rooms.forEach((room, indexRoom) => {
      if(room.id === roomId) {
        room.users.forEach((user, indexUser) => {
          if(user.id === userId) {
            rooms[indexRoom].users[indexUser] = { ...user, currentTime: currentTime }
          }
        })
      }
    })
  },

  getCurrentVolume: (roomId: string) => {
    const currentRoom = rooms.filter(room => room.id === roomId)
    //get currentVolume from penultimate user (the last one is the current user)
    const currentVolume = currentRoom[0]?.users.slice(-2)[0]?.currentVolume ?? 100 //100 = max volume
    return currentVolume
  },

  setCurrentVolume: (roomId: string, userId: string, currentVolume: number) => {
    rooms.forEach((room, indexRoom) => {
      if(room.id === roomId) {
        room.users.forEach((user, indexUser) => {
          if(user.id === userId) {
            rooms[indexRoom].users[indexUser] = { ...user, currentVolume: currentVolume }
          }
        })
      }
    })
  },

  getIsMuted: (roomId: string) => {
    const currentRoom = rooms.filter(room => room.id === roomId)
    //get isMuted from penultimate user (the last one is the current user)
    const isMuted = currentRoom[0]?.users.slice(-2)[0]?.isMuted ?? false
    return isMuted
  },

  setIsMuted: (roomId: string, userId: string, isMuted: boolean) => {
    rooms.forEach((room, indexRoom) => {
      if(room.id === roomId) {
        room.users.forEach((user, indexUser) => {
          if(user.id === userId) {
            rooms[indexRoom].users[indexUser] = { ...user, isMuted: isMuted }
          }
        })
      }
    })
  },

  getCurrentRate: (roomId: string) => {
    const currentRoom = rooms.filter(room => room.id === roomId)
    //get currentRate from penultimate user (the last one is the current user)
    const currentRate = currentRoom[0]?.users.slice(-2)[0]?.currentRate ?? 1 // 1 = normal
    return currentRate
  },

  setCurrentRate: (roomId: string, userId: string, currentRate: number) => {
    rooms.forEach((room, indexRoom) => {
      if(room.id === roomId) {
        room.users.forEach((user, indexUser) => {
          if(user.id === userId) {
            rooms[indexRoom].users[indexUser] = { ...user, currentRate: currentRate }
          }
        })
      }
    })
  },

  getCurrentChannel: (roomId: string) => {
    const currentRoom = rooms.filter(room => room.id === roomId)
    return currentRoom[0]?.channelId ?? ''
  },

  setCurrentChannel: (roomId: string, channelId: string) => {
    rooms.forEach((room, index) => {
      if(room.id === roomId) rooms[index] = { ...room, channelId: channelId }
    })
  },

  deleteUser: (socketId: string) => {
    rooms.forEach((room, indexRoom) => {
      if(room.users.length === 0) rooms.splice(indexRoom, 1)

      room?.users?.forEach((user, indexUser) => {
        if(user.socketId === socketId ) {
          rooms[indexRoom].users.splice(indexUser, 1)
        }
      })
    })
  }
}

io.on('connection', socket => {
  //VideoPlayer
  socket.on('joined', ({ roomId, userId }, callback) => {
    socket.join(roomId)
    RoomController.insertUserInRoom(roomId, userId, socket.id )
    callback(
      RoomController.getCurrentVideo(roomId),
      RoomController.getCurrentTime(roomId),
      RoomController.getCurrentVolume(roomId),
      RoomController.getIsMuted(roomId),
      RoomController.getCurrentRate(roomId)
    )
    console.log(rooms)
  })
  socket.on('play_video', roomId => io.to(roomId).emit('play_video'))
  socket.on('pause_video', roomId => io.to(roomId).emit('pause_video'))
  socket.on('change_rate', ({ roomId, rate }) => io.to(roomId).emit('change_rate', rate))
  socket.on('change_video', ({ roomId, videoId }) => {
    io.to(roomId).emit('change_video', videoId)
    RoomController.setCurrentVideo(roomId, videoId)
  })
  socket.on('current_settings', ({ roomId, userId, currentTime, currentVolume, isMuted, currentRate }) => {
    RoomController.setCurrentTime(roomId, userId, currentTime)
    RoomController.setCurrentVolume(roomId, userId, currentVolume)
    RoomController.setIsMuted(roomId, userId, isMuted)
    RoomController.setCurrentRate(roomId, userId, currentRate)
  })
  socket.on('sync_video', ({ roomId, time, volume, isMuted, rate }) => {
    io.to(roomId).emit('sync_video', { time, volume, isMuted, rate })
  })

  //Chat
  socket.on('joined_the_chat', ({ roomId }, callback) => {
    callback(RoomController.getCurrentChannel(roomId))
  })
  socket.on('new_chat', ({ roomId, channelId }) => {
    RoomController.setCurrentChannel(roomId, channelId)
  })

  //Disconnect
  socket.on('disconnect', () => RoomController.deleteUser(socket.id))
})

serverHttp.listen(PORT, () => console.log(`Server is running on port ${PORT}`))