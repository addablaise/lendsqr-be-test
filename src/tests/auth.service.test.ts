import { loginUser } from '../modules/auth/auth.service'
import db from '../db/knex'
import bcrypt from 'bcrypt'
import crypto from 'crypto'

jest.mock('../../src/db/knex')
jest.mock('bcrypt')
jest.mock('crypto')

const mockDb: any = db

describe('loginUser', () => {
  const fakeUser = {
    id: 'user-1',
    email: 'alice@example.com',
    password_hash: 'hashed-pwd'
  }
  const builderStub: any = {
    where: jest.fn().mockReturnThis(),
    first: jest.fn(),
    update: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockDb.mockReturnValue(builderStub)
  })

  it('returns userId and token on valid credentials', async () => {
    builderStub.where.mockReturnThis()
    builderStub.first.mockResolvedValue(fakeUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    (crypto.createHash as jest.Mock).mockReturnValue({
      update: jest.fn().mockReturnThis(),
      digest: jest.fn().mockReturnValue('fixed-token')
    });

    builderStub.update.mockResolvedValue(1);

    const result = await loginUser('alice@example.com', 'plain-pwd');

    expect(builderStub.where).toHaveBeenCalledWith('email', 'alice@example.com');
    expect(builderStub.first).toHaveBeenCalled();
    expect(bcrypt.compare).toHaveBeenCalledWith('plain-pwd', 'hashed-pwd');
    expect(crypto.createHash).toHaveBeenCalledWith('sha256');
    expect(builderStub.update).toHaveBeenCalledWith({ token: 'fixed-token' });
    expect(result).toEqual({ userId: 'user-1', token: 'fixed-token' });
  });

  it('returns null if no user found', async () => {
    builderStub.first.mockResolvedValue(undefined);

    const result = await loginUser('bob@example.com', 'any-pwd');
    expect(result).toBeNull();
    expect(bcrypt.compare).not.toHaveBeenCalled();
    expect(builderStub.update).not.toHaveBeenCalled();
  });

  it('returns null on password mismatch', async () => {
    builderStub.first.mockResolvedValue(fakeUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const result = await loginUser('alice@example.com', 'wrong-pwd');
    expect(result).toBeNull();
    expect(bcrypt.compare).toHaveBeenCalledWith('wrong-pwd', 'hashed-pwd');
    expect(crypto.createHash).not.toHaveBeenCalled();
    expect(builderStub.update).not.toHaveBeenCalled();
  });
});
