require('dotenv').config();

module.exports = {
  development: {
    client: 'mysql2',
    connection: {
      host     : 'u0zbt18wwjva9e0v.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
      user     : 'k5cur9pqmob9r1d0',
      password : 'ufwpkw9renpxvlx5',
      database : 's4kx6f0ln1omwxys',
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
