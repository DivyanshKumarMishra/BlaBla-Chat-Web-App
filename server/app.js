require('dotenv').config()
const express = require('express')
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
const {basePath} = require('./utils')

const app = express()
const server = require('http').createServer(app)
const authRouter = require('./routes/authRouter')
const chatRouter = require('./routes/chatRouter')
const channelRouter = require('./routes/channelRouter')
const profileRouter = require('./routes/profileRouter')
const tokenVerification = require('./middlewares/token_verify')
const { setupCircuit } = require('./circuit')
const uri = process.env.MONGO_CONNECTION_STRING
const port = process.env.PORT || 3000
const host = process.env.HOST || 'localhost'
const origin = process.env.ORIGIN

app.use(cors({
  origin: origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
}))

app.use(express.static(path.join(basePath,  'public')))
app.use('/uploads/profiles', express.static(path.join(basePath,  'uploads/profiles')))
app.use('/uploads/files', express.static(path.join(basePath,  'uploads/files')))
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', authRouter)

app.use(tokenVerification)

app.use('/api/profile', profileRouter)
app.use('/api/chat', chatRouter)
app.use('/api/channel', channelRouter)

app.use((req, res, next) => {
  res.status(404).send({error: 'page not found'})
})

async function runServer(){
  try {
    const mongo = mongoose.connect(uri)
    if(mongo){
      server.listen(port, host, () => {
        console.log(`server started on port http://${host}:${port}`);
        setupCircuit(server);
      })
    }else{
      console.log(`error connecting to mongo db`);
    }
  } catch (error) {
    console.log(`something went wrong: ${error.message}`);
  }
}

runServer()