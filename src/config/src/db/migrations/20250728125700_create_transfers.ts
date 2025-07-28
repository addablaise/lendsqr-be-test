import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('transfers', (table) => {
    table.uuid('id').primary()
    table.uuid('from_wallet_id').notNullable().references('id').inTable('wallets')
    table.uuid('to_wallet_id').notNullable().references('id').inTable('wallets')
    table.decimal('amount', 20, 8).notNullable()
    table.string('reference', 191).notNullable().unique()
    table.timestamp('created_at').defaultTo(knex.fn.now())
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('transfers')
}
