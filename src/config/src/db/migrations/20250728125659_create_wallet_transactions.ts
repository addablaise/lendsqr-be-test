import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('wallet_transactions', (table) => {
    table.uuid('id').primary()
    table.uuid('wallet_id').notNullable().references('id').inTable('wallets').onDelete('CASCADE')
    table.enu('type', ['FUND', 'TRANSFER_DEBIT', 'TRANSFER_CREDIT', 'WITHDRAW']).notNullable()
    table.decimal('amount', 20, 8).notNullable()
    table.decimal('balance_before', 20, 8).notNullable()
    table.decimal('balance_after', 20, 8).notNullable()
    table.string('reference', 191).notNullable().unique()
    table.json('metadata')
    table.timestamp('created_at').defaultTo(knex.fn.now())
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('wallet_transactions')
}
