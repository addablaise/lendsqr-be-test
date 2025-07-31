import db from '../db/knex'
import { fundWallet, withdraw, transfer } from '../modules/wallets/wallets.service'
import { v4 as uuidv4 } from 'uuid'

jest.mock('../../src/db/knex')
jest.mock('uuid')

const mockDb: any = db

describe('wallets.service', () => {
  let builder: any
  let trx: any

  beforeEach(() => {
    jest.clearAllMocks()

    // builder stub mimicking Knex query builder
    builder = {
      where: jest.fn().mockReturnThis(),
      forUpdate: jest.fn().mockReturnThis(),
      first: jest.fn(),
      update: jest.fn().mockResolvedValue(1),
      insert: jest.fn().mockResolvedValue(undefined)
    }

    // trx is a function that returns builder
    trx = (table: string) => builder

    // mock db.transaction to call our trx function
    mockDb.transaction = jest.fn((cb: any) => cb(trx))
  })

  describe('fundWallet', () => {
    it('credits the wallet and records a transaction', async () => {
      builder.first.mockResolvedValue({ id: 'w1', user_id: 'u1', balance: 50, currency: 'GHS' })
      ;(uuidv4 as jest.Mock).mockReturnValue('ref-1')

      const result = await fundWallet('u1', 25)

      expect(builder.where).toHaveBeenCalledWith('user_id', 'u1')
      expect(builder.update).toHaveBeenCalledWith({ balance: 75 })
      expect(builder.insert).toHaveBeenCalledWith(expect.objectContaining({
        wallet_id: 'w1',
        type: 'FUND',
        amount: 25,
        reference: 'ref-1'
      }))
      expect(result.wallet.balance).toBe(75)
    })

    it('throws 404 if wallet not found', async () => {
      builder.first.mockResolvedValue(undefined)
      await expect(fundWallet('uX', 10))
        .rejects.toMatchObject({ statusCode: 404, message: 'Wallet not found' })
    })
  })

  describe('withdraw', () => {
    it('debits the wallet and records a transaction', async () => {
      builder.first.mockResolvedValue({ id: 'w2', user_id: 'u2', balance: 100, currency: 'GHS' })
      ;(uuidv4 as jest.Mock).mockReturnValue('ref-2')

      const result = await withdraw('u2', 40)

      expect(builder.update).toHaveBeenCalledWith({ balance: 60 })
      expect(builder.insert).toHaveBeenCalledWith(expect.objectContaining({
        wallet_id: 'w2',
        type: 'WITHDRAW',
        amount: 40,
        reference: 'ref-2'
      }))
      expect(result.wallet.balance).toBe(60)
    })

    it('throws 422 if insufficient funds', async () => {
      builder.first.mockResolvedValue({ id: 'w3', user_id: 'u3', balance: 5, currency: 'GHS' })
      await expect(withdraw('u3', 10))
        .rejects.toMatchObject({ statusCode: 422, message: 'Insufficient funds' })
    })
  })

  describe('transfer', () => {
    it('moves funds between wallets and records two transactions', async () => {
      builder.first
        .mockResolvedValueOnce({ id: 'w1', user_id: 'u1', balance: 200, currency: 'GHS' })
        .mockResolvedValueOnce({ id: 'w2', user_id: 'u2', balance: 50, currency: 'GHS' })

      ;(uuidv4 as jest.Mock)
        .mockReturnValueOnce('tx-debit')
        .mockReturnValueOnce('refX')
        .mockReturnValueOnce('tx-credit')

      const result = await transfer('u1', 'u2', 100, 'Transfer note')

      expect(builder.update).toHaveBeenCalledWith({ balance: 100 }) // 200 - 100
      expect(builder.update).toHaveBeenCalledWith({ balance: 150 }) // 50 + 100

      expect(builder.insert).toHaveBeenCalledWith(expect.objectContaining({
        id: 'tx-debit',
        wallet_id: 'w1',
        type: 'TRANSFER_DEBIT',
        reference: 'refX'
      }))
      expect(builder.insert).toHaveBeenCalledWith(expect.objectContaining({
        id: 'tx-credit',
        wallet_id: 'w2',
        type: 'TRANSFER_CREDIT',
        reference: 'refX'
      }))

      expect(result.wallet.balance).toBe(100)
    })

    it('throws 422 for insufficient funds', async () => {
      builder.first
        .mockResolvedValueOnce({ id: 'w1', user_id: 'u1', balance: 30, currency: 'GHS' })
        .mockResolvedValueOnce({ id: 'w2', user_id: 'u2', balance: 20, currency: 'GHS' })

      await expect(transfer('u1', 'u2', 50, 'Transfer note'))
        .rejects.toMatchObject({ statusCode: 422, message: 'Insufficient funds' })
    })

    it('throws 404 if wallets not found', async () => {
      builder.first.mockResolvedValueOnce(undefined)

      await expect(transfer('u1', 'u2', 10, 'Transfer note'))
        .rejects.toMatchObject({ statusCode: 404, message: 'Wallets not found' })
    })
  })
})
