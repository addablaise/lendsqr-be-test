import { loginUser } from '../src/modules/auth/auth.service'
import db from '../src/db/knex'
import bcrypt from 'bcrypt'
import crypto from 'crypto'

// mock the Knex instance and node modules
jest.mock('../src/db/knex')
jest.mock('bcrypt')
jest.mock('crypto')

const mockDb: any = db

describe('loginUser', () => {
  const fakeUser = {
    id: 'user-1',
    email: 'blaise@example.com',
    password_hash: 'hashed-pwd',
  }

  // a simple builder stub with chainable where().first() and update()
  const builderStub = {
    where: jest.fn().mockReturnThis(),
    first: jest.fn(),
    update: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // every call to db('users') returns our builder stub
    mockDb.mockReturnValue(builderStub)
  })

  it('returns userWithoutPassword on valid credentials', async () => {
    // simulate finding the user
    builderStub.first.mockResolvedValue(fakeUser)
    // bcrypt.compare returns true
    (bcrypt.compare as jest.Mock).mockResolvedValue(true)
    // crypto.createHash().update().digest() returns a fixed token
    const digestMock = jest.fn().mockReturnValue('fixed-token')
    const updateMock = jest.fn().mockReturnValue({ digest: digestMock })
    ;(crypto.createHash as jest.Mock).mockReturnValue({
      update: jest.fn().mockReturnThis(),
      digest: jest.fn().mockReturnValue('fixed-token')
    })

    // simulate successful update
    builderStub.update.mockResolvedValue(1)

    const result = await loginUser('blaise@example.com', 'plain-pwd')

    // It should have fetched the user
    expect(builderStub.where).toHaveBeenCalledWith('email', 'blaise@example.com')
    expect(builderStub.first).toHaveBeenCalled()

    // It should have checked the password
    expect(bcrypt.compare).toHaveBeenCalledWith('plain-pwd', 'hashed-pwd')

    // It should have generated and persisted a token
    expect(crypto.createHash).toHaveBeenCalledWith('sha256')
    expect(builderStub.update).toHaveBeenCalledWith({ token: 'fixed-token' })

    // And returned the user object without the password_hash
    expect(result).toEqual({
      id: 'user-1',
      email: 'blaise@example.com'
      // note: password_hash is omitted
    })
  })

  it('returns null if no user found', async () => {
    builderStub.first.mockResolvedValue(undefined)

    const result = await loginUser('bob@example.com', 'any-pwd')
    expect(result).toBeNull()
    // should not attempt password check or update
    expect(bcrypt.compare).not.toHaveBeenCalled()
    expect(builderStub.update).not.toHaveBeenCalled()
  })

  it('returns null on password mismatch', async () => {
    builderStub.first.mockResolvedValue(fakeUser)
    (bcrypt.compare as jest.Mock).mockResolvedValue(false)

    const result = await loginUser('blaise@example.com', 'wrong-pwd')
    expect(result).toBeNull()
    expect(bcrypt.compare).toHaveBeenCalledWith('wrong-pwd', 'hashed-pwd')
    // should not generate token or update DB
    expect(crypto.createHash).not.toHaveBeenCalled()
    expect(builderStub.update).not.toHaveBeenCalled()
  })
})
