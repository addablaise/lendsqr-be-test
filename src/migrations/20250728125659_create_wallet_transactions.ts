import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('wallet_transactions', table => {
    table.uuid('id').primary().defaultTo(knex.raw('UUID()'));
    table.uuid('wallet_id').notNullable()
      .references('id').inTable('wallets')
      .onDelete('CASCADE');
    table.enum('type', [
      'FUND',
      'TRANSFER_DEBIT',
      'TRANSFER_CREDIT',
      'WITHDRAW'
    ]).notNullable();
    table.decimal('amount', 18, 2).notNullable();
    table.decimal('balance_before', 18, 2).notNullable();
    table.decimal('balance_after', 18, 2).notNullable();
    table.string('reference').notNullable().unique();
    table.json('metadata').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('wallet_transactions');
}
