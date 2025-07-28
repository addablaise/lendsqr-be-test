import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('idempotency_keys', (table) => {
    table.uuid('id').primary()
    table.string('key', 191).notNullable().unique()
    table.string('request_hash', 191).notNullable()
    table.json('response_body').notNullable()
    table.integer('status_code').notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('idempotency_keys')
}
