import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('transfers', table => {
    table.uuid('id').primary().defaultTo(knex.raw('UUID()'));
    table.uuid('from_wallet_id').notNullable()
      .references('id').inTable('wallets')
      .onDelete('CASCADE');
    table.uuid('to_wallet_id').notNullable()
      .references('id').inTable('wallets')
      .onDelete('CASCADE');
    table.decimal('amount', 18, 2).notNullable();
    table.string('reference').notNullable().unique();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('transfers');
}
