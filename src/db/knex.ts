import knex from 'knex'
import type { Knex } from 'knex'

// plain JS config at project root
const config: { [env: string]: Knex.Config } = require('../../knexfile.js')

const rawEnv = process.env.NODE_ENV || 'development'
// if that key is missing, fall back to development
const envConfig = config[rawEnv] || config['development']

const db = knex(envConfig)

export default db

