import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcrypt';
import crypto from 'crypto';

import db from '../../db/knex'
import { checkBlacklist } from '../blacklist/blacklist.service'

export interface CreateUserDto {
  first_name: string
  last_name: string
  email: string
  phone: string
  password: string;
}

export async function createUser(dto: CreateUserDto) {
  const { first_name, last_name, email, phone, password } = dto
  // check email and phone already exist
  const existingUser = await db('users')
    .where({ email })
    .orWhere({ phone })
    .first()
  if (existingUser) {
    const e = new Error('User with this email or phone already exists')
    ;(e as any).statusCode = 409
    throw e
  }
  const status = await checkBlacklist(email, phone)

  if (status === 'BLACKLISTED') {
    const e = new Error('User is blacklisted')
    ;(e as any).statusCode = 422
    throw e
  }
  if (status === 'ERROR') {
    const e = new Error('Blacklist check failed')
    ;(e as any).statusCode = 502
    throw e
  }

  const password_hash = await bcrypt.hash(password, 10);
  const raw = `${email}${Date.now()}`;
    const token = crypto
      .createHash('sha256')
      .update(raw)
      .digest('hex');

  return await db.transaction(async trx => {
    const userId = uuidv4()
    await trx('users').insert({
      id: userId,
      first_name,
      last_name,
      email,
      phone,
      token,
      password_hash,
      karma_blacklisted: false
    })

    const walletId = uuidv4()
    await trx('wallets').insert({
      id: walletId,
      user_id: userId,
      balance: 0,
      currency: 'GHS'
    })

    const user = await trx('users')
    .select('id', 'first_name', 'last_name', 'email', 'phone', 'token', 'karma_blacklisted')
    .where('id', userId).first()
    const wallet = await trx('wallets').where('id', walletId).first()
    return { user, wallet }
  })
}
