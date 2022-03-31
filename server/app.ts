import express from 'express'
import http from 'http'
import cors from 'cors'
import 'dotenv/config'
import { Server } from 'socket.io'
import { StreamChat } from 'stream-chat'

import { rooms } from './server'

const api_key = process.env.STREAM_API_KEY
const api_secret = process.env.STREAM_API_SECRET
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

  rooms.push({ id: roomId, users: [] })
  console.log(rooms)
})

app.post('/signup', (req, res) => {
  const { userId } = req.body

  try {
    const serverClient = StreamChat.getInstance(api_key, api_secret)
    const token = serverClient.createToken(userId)
  
    res.status(200).json({ token })
    
  } catch (error) {
    res.status(500).json({ message: error })
  }
})

app.get('/rooms/:roomId', (req, res) => {
  const { roomId } = req.params

  const room = rooms.filter(room => room.id === roomId)[0]
  
  if(room) res.status(200).json(room)
  else res.status(404)
})

export { serverHttp, io }