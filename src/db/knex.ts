import knex from 'knex'
import type { Knex } from 'knex'

const config: { [key: string]: Knex.Config } = require('../../knexfile.js')

const env = process.env.NODE_ENV || 'development'
const db = knex(config[env])

export default db
