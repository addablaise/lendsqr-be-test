import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('wallets', (table) => {
    table.uuid('id').primary()
    table.uuid('user_id').unique().notNullable().references('id').inTable('users').onDelete('CASCADE')
    table.decimal('balance', 20, 8).defaultTo(0)
    table.string('currency', 3).defaultTo('GHS')
    table.timestamps(true, true)
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('wallets')
}
