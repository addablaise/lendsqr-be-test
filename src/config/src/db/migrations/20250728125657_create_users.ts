import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (table) => {
    table.uuid('id').primary()
    table.string('first_name', 100).notNullable()
    table.string('last_name', 100).notNullable()
    table.string('email', 191).notNullable().unique()
    table.string('phone', 32).unique()
    table.boolean('karma_blacklisted').defaultTo(false)
    table.timestamps(true, true)
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('users')
}
