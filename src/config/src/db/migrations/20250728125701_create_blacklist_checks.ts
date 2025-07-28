import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('blacklist_checks', (table) => {
    table.uuid('id').primary()
    table.string('user_payload_hash', 191).notNullable()
    table.string('adjutor_request_id', 191)
    table.enu('result', ['CLEAR', 'BLACKLISTED', 'ERROR']).notNullable()
    table.json('raw_response')
    table.timestamp('created_at').defaultTo(knex.fn.now())
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('blacklist_checks')
}
