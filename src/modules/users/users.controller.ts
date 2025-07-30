import { Router, Request, Response, NextFunction } from 'express'
import { createUser } from './users.service'

const router = Router()

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { first_name, last_name, email, phone, password } = req.body
    if (!first_name || !last_name || !email || !phone || !password) {
      return res
        .status(400)
        .json({ error: { code: 'INVALID_INPUT', message: 'Missing fields' } })
    }
    const result = await createUser({ first_name, last_name, email, phone, password })
    res.status(201).json(result)
  } catch (err) {
    next(err)
  }
})

export default router
