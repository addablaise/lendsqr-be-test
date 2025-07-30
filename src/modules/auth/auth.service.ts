import crypto from 'crypto';
import bcrypt from 'bcrypt';
import db from '../../db/knex';

export async function loginUser(email: string, password: string){
  const user = await db('users').where('email', email).first();
  if (!user) return null;

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) return null;

  // token from userId + timestamp
  const raw = `${user.id}${Date.now()}`;
  const token = crypto
    .createHash('sha256')
    .update(raw)
    .digest('hex');

  // update user with new token
  await db('users')
    .where('id', user.id)
    .update({ token });

  // remove password hash from user
  const { password_hash, ...userWithoutPassword } = user;

  return userWithoutPassword;
}
