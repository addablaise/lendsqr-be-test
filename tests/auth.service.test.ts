import { validateUser } from '../src/modules/auth/auth.service'
import db from '../src/db/knex'
import bcrypt from 'bcrypt'

jest.mock('../src/db/knex')
jest.mock('bcrypt')

const mockDb = db as unknown as jest.Mock

beforeEach(() => {
  jest.clearAllMocks()
})

describe('validateUser', () => {
  it('returns user when credentials are valid', async () => {
    const fakeUser = { id:'u1', email:'e', password_hash:'h' }
    // db('users').where(...).first() => fakeUser
    mockDb.mockReturnValue({
      where: jest.fn().mockReturnThis(),
      first: jest.fn().mockResolvedValue(fakeUser)
    })
    ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

    const result = await validateUser('e','pass')
    expect(result).toEqual(fakeUser)
    expect(bcrypt.compare).toHaveBeenCalledWith('pass','h')
  })

  it('returns null when user not found', async () => {
    mockDb.mockReturnValue({
      where: jest.fn().mockReturnThis(),
      first: jest.fn().mockResolvedValue(undefined)
    })
    const result = await validateUser('no@user','x')
    expect(result).toBeNull()
  })

  it('returns null on password mismatch', async () => {
    const fakeUser = { id:'u1', email:'e', password_hash:'h' }
    mockDb.mockReturnValue({
      where: jest.fn().mockReturnThis(),
      first: jest.fn().mockResolvedValue(fakeUser)
    })
    ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

    const result = await validateUser('e','wrong')
    expect(result).toBeNull()
  })
})
