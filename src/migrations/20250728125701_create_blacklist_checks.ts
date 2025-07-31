import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
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
}
