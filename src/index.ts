import express from 'express'
import usersRoute from './routes/users.routes'
import databaseService from './services/database.services'

const app = express()
app.use(express.json())
const PORT = 3000

databaseService.connect()

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use('/users', usersRoute)

app.listen(PORT, () => {
  console.log(`Server đang chạy trên port ${PORT}`)
})
