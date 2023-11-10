import express, { NextFunction, Request, Response } from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import mediasRouter from './routes/medias.routes'
import { initFolder } from './utils/files'

import { config } from 'dotenv'
import { UPLOAD_DIR, UPLOAD_VIDEO_DIR } from './constants/dir'
import staticRouter from './routes/static.routes'
import { UPLOAD_IMAGE_DIR } from './constants/dir' //import không xài xóa đi cũng đc
import { MongoClient } from 'mongodb'
config()

const app = express()
app.use(express.json())
const PORT = 4000

databaseService.connect().then(() => {
  databaseService.indexUsers()
})

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use('/users', usersRouter)
// localhost:3000/users/login
app.use('/medias', mediasRouter)
// app.use('/static', express.static(UPLOAD_DIR))
app.use('/static', staticRouter)
// app.use('/static/video', express.static(UPLOAD_VIDEO_DIR))
app.use(defaultErrorHandler)

app.listen(PORT, () => {
  console.log(`Server đang chạy trên port ${PORT}`)
})
