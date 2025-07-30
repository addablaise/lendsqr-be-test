// tests/users.service.test.ts
import { createUser } from '../src/modules/users/users.service'
import db from '../src/db/knex'
import * as blacklistService from '../src/modules/blacklist/blacklist.service'
import bcrypt from 'bcrypt'

// Cast db to any so we can assign .transaction
const mockDb: any = db

jest.mock('../src/modules/blacklist/blacklist.service')
jest.mock('bcrypt')

beforeEach(() => {
  jest.clearAllMocks()
})

describe('createUser', () => {
  it('creates user & wallet when not blacklisted', async () => {
    ;(blacklistService.checkBlacklist as jest.Mock).mockResolvedValue('CLEAR')
    ;(bcrypt.hash as jest.Mock).mockResolvedValue('hashedpwd')

    const fakeUser = {
      id: 'u1',
      first_name: 'A',
      last_name: 'B',
      email: 'e',
      phone: 'p',
      password_hash: 'hashedpwd',
      karma_blacklisted: false
    }
    const fakeWallet = { id: 'w1', user_id: 'u1', balance: 0, currency: 'USD' }

    // Prepare a fake trx object
    const trx = {
      insert: jest.fn().mockResolvedValue(undefined),
      where: jest.fn().mockReturnThis(),
      first: jest.fn()
        .mockResolvedValueOnce(fakeUser)    // first call returns user
        .mockResolvedValueOnce(fakeWallet)  // second call returns wallet
    }

    // Stub db.transaction to call our trx stub
    mockDb.transaction = jest.fn((cb: any) => cb(trx))

    const { user, wallet } = await createUser({
      first_name: 'A',
      last_name: 'B',
      email: 'e',
      phone: 'p',
      password: 'pwd'
    })

    expect(blacklistService.checkBlacklist).toHaveBeenCalledWith('e', 'p')
    expect(bcrypt.hash).toHaveBeenCalledWith('pwd', 10)
    expect(trx.insert).toHaveBeenCalledTimes(2)
    expect(user).toEqual(fakeUser)
    expect(wallet).toEqual(fakeWallet)
  })

  it('throws 422 when blacklisted', async () => {
    ;(blacklistService.checkBlacklist as jest.Mock).mockResolvedValue('BLACKLISTED')

    await expect(
      createUser({ first_name:'A', last_name:'B', email:'e', phone:'p', password:'x' })
    ).rejects.toMatchObject({ statusCode: 422, message: 'User is blacklisted' })
  })

  it('throws 502 when blacklist API errors', async () => {
    ;(blacklistService.checkBlacklist as jest.Mock).mockResolvedValue('ERROR')

    await expect(
      createUser({ first_name:'A', last_name:'B', email:'e', phone:'p', password:'x' })
    ).rejects.toMatchObject({ statusCode: 502, message: 'Blacklist check failed' })
  })
})
