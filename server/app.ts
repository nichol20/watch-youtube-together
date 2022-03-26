import express from 'express'
import http from 'http'
import cors from 'cors'
import { Server } from 'socket.io'

import { rooms } from './server'

const app = express()

app.use(cors())
app.use(express.json())

const serverHttp = http.createServer(app)

const io = new Server(serverHttp, {
  cors: {
    origin: '*'
  }
})

app.post('/create-room', (req, res) => {
  const { roomId } = req.body
  
  if(rooms.filter(room => room.id === roomId)[0]) return res.status(409).json({ message: 'this room already exists'})

  rooms.push({ id: roomId })
  console.log(rooms)
})

app.get('/rooms/:roomId', (req, res) => {
  const { roomId } = req.params

  const room = rooms.filter(room => room.id === roomId)[0]
  
  if(room) {
    res.json(room)
  } else {
    res.status(404)
  }
})

export { serverHttp, io }