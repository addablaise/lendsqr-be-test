import { Request, Response, NextFunction } from 'express';
import db from '../db/knex';

export default async function authMiddleware(req: Request & { user?: any }, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'No token provided' } });
  }
  const userId = auth.replace('Bearer ', '').trim();
  const user = await db('users').where('id', userId).first();
  if (!user) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid token' } });
  }
  req.user = user;
  next();
}
