import { Router, Request, Response, NextFunction } from 'express';
import { loginUser } from './auth.service';
import db from '../../db/knex';

const router = Router();

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'Missing credentials' } });
    }
    const user = await loginUser(email, password);
    if (!user) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid email or password' } });
    }
    const wallet = await db('wallets').where('user_id', user.id).first()

    res.json({ user, wallet });
  } catch (err) {
    next(err);
  }
});

export default router;
