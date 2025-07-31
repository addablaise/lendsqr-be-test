require('dotenv').config();

module.exports = {
  development: {
    client: 'mysql2',
    connection: {
      host     : process.env.DB_HOST,
      user     : process.env.DB_USER,
      password : process.env.DB_PASSWORD,
      database : process.env.DB_NAME,
    },
    migrations: { directory: './migrations' }
  },
  production: {
    client: 'mysql2',
    // use JawsDB_URL if present, else fallback
    connection: process.env.JAWSDB_URL || process.env.CLEARDB_DATABASE_URL,
    migrations: { directory: './migrations' }
  }
};


// // knexfile.js
// require('dotenv').config()

// /** @type {import('knex').Knex.Config} */
// module.exports = {
//   development: {
//     client: 'mysql2',
//     connection: {
//       host: process.env.DB_HOST,
//       port: Number(process.env.DB_PORT) || 3306,
//       user: process.env.DB_USER,
//       password: process.env.DB_PASSWORD,
//       database: process.env.DB_NAME
//     },
//     migrations: {
//       directory: './src/migrations'
//     },
//     seeds: {
//       directory: './seeds'
//     }
//   }
// }
