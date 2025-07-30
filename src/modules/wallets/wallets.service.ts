import { Knex } from 'knex'
import { v4 as uuidv4 } from 'uuid'
import db from '../../db/knex'
import { randomBytes } from 'crypto'

export interface Wallet {
  id: string
  user_id: string
  balance: number
  currency: string
}

export interface WalletTransaction {
  id: string
  wallet_id: string
  type: 'FUND' | 'WITHDRAW' | 'TRANSFER_DEBIT' | 'TRANSFER_CREDIT'
  amount: number
  balance_before: number
  balance_after: number
  note?: string
  reference: string
  metadata?: any
  created_at?: string
}

export interface FundResult {
  wallet: Wallet
  transaction: WalletTransaction
}


export async function getWallet(userId: string): Promise<Wallet> {
  const wallet = await db<Wallet>('wallets')
    .where('user_id', userId)
    .first()
  if (!wallet) {
    const err = new Error('Wallet not found')
    ;(err as any).statusCode = 404
    throw err
  }
  return wallet
}

export async function fundWallet(
  userId: string,
  amount: number,
): Promise<FundResult> {
  return await db.transaction(async trx => {
    const wallet = await trx<Wallet>('wallets')
      .where('user_id', userId)
      .forUpdate()
      .first()
    if (!wallet) {
      const err = new Error('Wallet not found')
      ;(err as any).statusCode = 404
      throw err
    }

    const before = Number(wallet.balance)
    const after = before + amount

    await trx('wallets').where('id', wallet.id).update({ balance: after })

    const tx: WalletTransaction = {
      id: uuidv4(),
      wallet_id: wallet.id,
      type: 'FUND',
      amount,
      balance_before: before,
      balance_after: after,
      reference: 'FND_' + randomBytes(10).toString('hex'),
      metadata: null,
    }
    await trx('wallet_transactions').insert(tx)

    return { wallet: { ...wallet, balance: after }, transaction: tx }
  })
}

export interface WithdrawResult extends FundResult {}

export async function withdraw(
  userId: string,
  amount: number,
): Promise<WithdrawResult> {
  return await db.transaction(async trx => {
    const wallet = await trx<Wallet>('wallets')
      .where('user_id', userId)
      .forUpdate()
      .first()
    if (!wallet) {
      const err = new Error('Wallet not found')
      ;(err as any).statusCode = 404
      throw err
    }

    const before = Number(wallet.balance)
    if (before < amount) {
      const err = new Error('Insufficient funds')
      ;(err as any).statusCode = 422
      throw err
    }
    const after = before - amount

    await trx('wallets').where('id', wallet.id).update({ balance: after })

    const tx: WalletTransaction = {
      id: uuidv4(),
      wallet_id: wallet.id,
      type: 'WITHDRAW',
      amount,
      balance_before: before,
      balance_after: after,
      reference: 'WTDR_' + randomBytes(10).toString('hex'),
      metadata: null,
    }
    await trx('wallet_transactions').insert(tx)

    return { wallet: { ...wallet, balance: after }, transaction: tx }
  })
}

export interface TransferResult {
  wallet: Wallet
}

export async function transfer(
  fromUserId: string,
  toUserId: string,
  amount: number,
  note: string
): Promise<TransferResult> {
  return await db.transaction(async trx => {
    // load both wallets and lock by id order to avoid deadlock
    const w1 = await trx<Wallet>('wallets')
      .where('user_id', fromUserId)
      .forUpdate()
      .first()
    const w2 = await trx<Wallet>('wallets')
      .where('user_id', toUserId)
      .forUpdate()
      .first()

    if (!w1 || !w2) {
      const err = new Error('Wallets not found')
      ;(err as any).statusCode = 404
      throw err
    }
    if (Number(w1.balance) < amount) {
      const err = new Error('Insufficient funds')
      ;(err as any).statusCode = 422
      throw err
    }

    const fromBefore = Number(w1.balance)
    const fromAfter = fromBefore - amount
    const toBefore = Number(w2.balance)
    const toAfter = toBefore + amount

    await trx('wallets').where('id', w1.id).update({ balance: fromAfter })
    await trx('wallets').where('id', w2.id).update({ balance: toAfter })


    // debit transaction
    await trx('wallet_transactions').insert({
      id: uuidv4(),
      wallet_id: w1.id,
      type: 'TRANSFER_DEBIT',
      amount,
      balance_before: fromBefore,
      balance_after: fromAfter,
      note,
      reference: 'TRNS_' + randomBytes(10).toString('hex'),
      metadata: { to: w2.id },
    })

    // credit transaction
    await trx('wallet_transactions').insert({
      id: uuidv4(),
      wallet_id: w2.id,
      type: 'TRANSFER_CREDIT',
      amount,
      balance_before: toBefore,
      balance_after: toAfter,
      note,
      reference: 'TRNS_' + randomBytes(10).toString('hex'),
      metadata: { from: w1.id },
    })

    return {
      wallet: { ...w1, balance: fromAfter },
    }

  })
}
