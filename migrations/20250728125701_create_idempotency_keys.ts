import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('idempotency_keys', table => {
    table.uuid('id').primary();
    table.string('key').notNullable().unique();
    table.string('request_hash').notNullable();
    table.json('response_body').notNullable();
    table.integer('status_code').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('idempotency_keys');
}
