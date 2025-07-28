import express from 'express'
import dotenv from 'dotenv'


dotenv.config()

const app = express()
app.use(express.json())

// Health check
app.get('/api/v1/health', (_, res) => {
  res.json({ status: 'OK', timestamp: new Date() })
})

export default app
