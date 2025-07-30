import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import authRouter from './modules/auth/auth.controller';
import authMiddleware from './middlewares/auth.middleware';
import userRouter from './modules/users/users.controller';

const app = express()

app.use(helmet())
app.use(express.json())
app.use(morgan('dev'))

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/register', userRouter);
app.use('/api/v1', authMiddleware);
// app.use('/api/v1/users', userRouter);

// centralized error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err)
  const status = err.statusCode || 500
  const code = err.code || 'INTERNAL_ERROR'
  res.status(status).json({ error: { code, message: err.message } })
})

export default app
