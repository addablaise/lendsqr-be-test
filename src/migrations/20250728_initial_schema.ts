import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // users table
  await knex.schema.createTable('users', table => {
    table.uuid('id').primary().defaultTo(knex.raw('UUID()'));
    table.string('first_name').notNullable();
    table.string('last_name').notNullable();
    table.string('email').notNullable().unique();
    table.string('phone').notNullable().unique();
    table.string('password_hash', 255).notNullable().defaultTo('');
    table.string('token', 64).unique().nullable();
    table.boolean('karma_blacklisted').notNullable().defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  // wallets table
  await knex.schema.createTable('wallets', table => {
    table.uuid('id').primary().defaultTo(knex.raw('UUID()'));
    table.uuid('user_id').notNullable()
      .references('id').inTable('users')
      .onDelete('CASCADE');
    table.decimal('balance', 18, 2).notNullable().defaultTo(0);
    table.string('currency', 3).notNullable().defaultTo('GHS');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  // wallet_transactions table
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

  // transfers table
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

  // idempotency_keys table
  await knex.schema.createTable('idempotency_keys', table => {
    table.uuid('id').primary().defaultTo(knex.raw('UUID()'));
    table.string('key').notNullable().unique();
    table.string('request_hash').notNullable();
    table.json('response_body').notNullable();
    table.integer('status_code').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // blacklist_checks table
  await knex.schema.createTable('blacklist_checks', table => {
    table.uuid('id').primary().defaultTo(knex.raw('UUID()'));
    table.string('user_payload_hash').notNullable();
    table.string('adjutor_request_id').nullable();
    table.enum('result', ['CLEAR', 'BLACKLISTED', 'ERROR']).notNullable();
    table.json('raw_response').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('blacklist_checks');
  await knex.schema.dropTableIfExists('idempotency_keys');
  await knex.schema.dropTableIfExists('transfers');
  await knex.schema.dropTableIfExists('wallet_transactions');
  await knex.schema.dropTableIfExists('wallets');
  await knex.schema.dropTableIfExists('users');
}
