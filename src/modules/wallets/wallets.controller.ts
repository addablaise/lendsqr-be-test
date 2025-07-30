import { Router, Request, Response, NextFunction } from 'express'
import { fundWallet, withdraw, transfer, getWallet } from './wallets.service'

const router = Router()

// details
router.get(
  '/',
  async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    try {
      const { amount, reference } = req.body
      const result = await getWallet(req.user.id)
      res.status(201).json(result)
    } catch (err) {
      next(err)
    }
  }
)

// fund
router.post(
  '/fund',
  async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    try {
      const { amount, note } = req.body
      const result = await fundWallet(req.user.id, Number(amount))
      res.status(201).json(result)
    } catch (err) {
      next(err)
    }
  }
)

// withdraw
router.post(
  '/withdraw',
  async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    try {
      const { amount, reference } = req.body
      const result = await withdraw(req.user.id, Number(amount))
      res.status(201).json(result)
    } catch (err) {
      next(err)
    }
  }
)

// transfer
router.post(
  '/transfer',
  async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    try {
      const { to_user_id, amount, note } = req.body
      const result = await transfer(req.user.id, to_user_id, Number(amount), note)
      res.status(201).json(result)
    } catch (err) {
      next(err)
    }
  }
)

export default router
