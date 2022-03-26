import { serverHttp, io } from "./app";

const PORT = process.env.PORT || 4000

interface RoomsVideos {
  id: string
  currentVideo?: string
  curretTime?: number
}
type Rooms = RoomsVideos[]

export const rooms: Rooms = []

const RoomController = {
  getCurrentVideo: (roomId: string) => {
    const currentRoom = rooms.filter(room => room.id === roomId)
    return currentRoom[0]?.currentVideo ?? ''
  },

  setCurrentVideo: (roomId: string, linkVideo: string) => {
    rooms.filter((room, index) => {
      if(room.id === roomId) rooms[index] = { ...room, currentVideo: linkVideo }
    })
  },
  
  getCurrentTime: (roomId: string) => {
    const currentRoom = rooms.filter(room => room.id === roomId)
    return currentRoom[0]?.curretTime ?? 0
  },

  setCurrentTime: (roomId: string, currentTime: number) => {
    rooms.filter((room, index) => {
      if(room.id === roomId) rooms[index] = { ...room, curretTime: currentTime }
    })
    console.log(rooms)
  }
}


io.on('connection', socket => {
  socket.on('joined', (roomId, callback) => {
    socket.join(roomId)
    callback(RoomController.getCurrentVideo(roomId), RoomController.getCurrentTime(roomId))
  })
  socket.on('pause_video', roomId => io.to(roomId).emit('pause_video'))
  socket.on('play_video', roomId => io.to(roomId).emit('play_video'))
  socket.on('change_video', ({ roomId, linkVideo }) => {
    io.to(roomId).emit('change_video', linkVideo)
    RoomController.setCurrentVideo(roomId, linkVideo)
  })
  socket.on('video_current_time', ({ roomId, currentTime }) => RoomController.setCurrentTime(roomId, currentTime))
})

serverHttp.listen(PORT, () => console.log(`Server is running on port ${PORT}`))