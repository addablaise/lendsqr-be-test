import { createUser } from '../src/modules/users/users.service'
import db from '../src/db/knex'
import * as blacklistService from '../src/modules/blacklist/blacklist.service'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import { v4 as uuidv4 } from 'uuid'

jest.mock('../src/db/knex')
jest.mock('../src/modules/blacklist/blacklist.service')
jest.mock('bcrypt')
jest.mock('crypto')
jest.mock('uuid')

const mockDb: any = db as unknown as jest.Mock

describe('createUser', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('creates user & wallet when not blacklisted and no existing user', async () => {
    // 1) No existing user
    const existingUserBuilder = {
      where: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      first: jest.fn().mockResolvedValue(undefined)
    }
    mockDb.mockReturnValueOnce(existingUserBuilder)

    // 2) Blacklist clear
    ;(blacklistService.checkBlacklist as jest.Mock).mockResolvedValue('CLEAR')

    // 3) Hash password
    ;(bcrypt.hash as jest.Mock).mockResolvedValue('pwdHash')

    // 4) UUIDs
    ;(uuidv4 as jest.Mock).mockReturnValueOnce('user-uuid').mockReturnValueOnce('wallet-uuid')

    // 5) Token generation
    (crypto.createHash as jest.Mock).mockReturnValue({
      update: jest.fn().mockReturnThis(),
      digest: jest.fn().mockReturnValue('token123')
    })

    // 6) Stub transaction
    const trx = {
      insert: jest.fn().mockResolvedValue(undefined),
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      first: jest.fn()
        .mockResolvedValueOnce({
          id: 'user-uuid',
          first_name: 'A',
          last_name: 'B',
          email: 'e',
          phone: 'p',
          token: 'token123',
          karma_blacklisted: false
        })
        .mockResolvedValueOnce({
          id: 'wallet-uuid',
          user_id: 'user-uuid',
          balance: 0,
          currency: 'GHS'
        })
    }
    mockDb.transaction = jest.fn((cb: any) => cb(trx))

    // Act
    const result = await createUser({
      first_name: 'A',
      last_name: 'B',
      email: 'e',
      phone: 'p',
      password: 'pwd'
    })

    // Assert
    expect(blacklistService.checkBlacklist).toHaveBeenCalledWith('e', 'p')
    expect(bcrypt.hash).toHaveBeenCalledWith('pwd', 10)
    expect(crypto.createHash).toHaveBeenCalledWith('sha256')
    expect(trx.insert).toHaveBeenCalledTimes(2)
    expect(result).toEqual({
      user: {
        id: 'user-uuid',
        first_name: 'A',
        last_name: 'B',
        email: 'e',
        phone: 'p',
        token: 'token123',
        karma_blacklisted: false
      },
      wallet: {
        id: 'wallet-uuid',
        user_id: 'user-uuid',
        balance: 0,
        currency: 'GHS'
      }
    })
  })

  it('throws 409 if a user with email or phone already exists', async () => {
    const existingUserBuilder = {
      where: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      first: jest.fn().mockResolvedValue({ id: 'existing-id' })
    }
    mockDb.mockReturnValueOnce(existingUserBuilder)

    await expect(
      createUser({
        first_name: 'X',
        last_name: 'Y',
        email: 'e',
        phone: 'p',
        password: 'pwd'
      })
    ).rejects.toMatchObject({
      statusCode: 409,
      message: 'User with this email or phone already exists'
    })
  })

  it('throws 422 when blacklisted', async () => {
    // no existing user
    const existingUserBuilder = {
      where: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      first: jest.fn().mockResolvedValue(undefined)
    }
    mockDb.mockReturnValueOnce(existingUserBuilder)
    // blacklist hit
    ;(blacklistService.checkBlacklist as jest.Mock).mockResolvedValue('BLACKLISTED')

    await expect(
      createUser({
        first_name: 'A',
        last_name: 'B',
        email: 'e',
        phone: 'p',
        password: 'pwd'
      })
    ).rejects.toMatchObject({ statusCode: 422, message: 'User is blacklisted' })
  })

  it('throws 502 when blacklist check errors', async () => {
    // no existing user
    const existingUserBuilder = {
      where: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      first: jest.fn().mockResolvedValue(undefined)
    }
    mockDb.mockReturnValueOnce(existingUserBuilder)
    // blacklist service error
    ;(blacklistService.checkBlacklist as jest.Mock).mockResolvedValue('ERROR')

    await expect(
      createUser({
        first_name: 'A',
        last_name: 'B',
        email: 'e',
        phone: 'p',
        password: 'pwd'
      })
    ).rejects.toMatchObject({ statusCode: 502, message: 'Blacklist check failed' })
  })
})
