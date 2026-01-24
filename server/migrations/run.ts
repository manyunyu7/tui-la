import fs from 'fs/promises'
import path from 'path'
import pg from 'pg'
import { config } from 'dotenv'

config()

const { Pool } = pg

const connectionString = process.env.DATABASE_URL ||
  `postgresql://${process.env.POSTGRES_USER || 'lovemap'}:${process.env.POSTGRES_PASSWORD || 'lovemap_dev'}@${process.env.POSTGRES_HOST || 'localhost'}:${process.env.POSTGRES_PORT || '5432'}/${process.env.POSTGRES_DB || 'lovemap'}`

const pool = new Pool({ connectionString })

async function runMigrations(): Promise<void> {
  const client = await pool.connect()

  try {
    // Create migrations table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT NOW()
      )
    `)

    // Get list of already executed migrations
    const executed = await client.query<{ name: string }>('SELECT name FROM migrations')
    const executedNames = new Set(executed.rows.map(r => r.name))

    // Get migration files
    const migrationsDir = path.dirname(new URL(import.meta.url).pathname)
    const files = await fs.readdir(migrationsDir)
    const sqlFiles = files
      .filter(f => f.endsWith('.sql'))
      .sort()

    // Run pending migrations
    for (const file of sqlFiles) {
      if (executedNames.has(file)) {
        console.log(`Skipping ${file} (already executed)`)
        continue
      }

      console.log(`Running migration: ${file}`)

      const sql = await fs.readFile(path.join(migrationsDir, file), 'utf-8')

      await client.query('BEGIN')
      try {
        await client.query(sql)
        await client.query('INSERT INTO migrations (name) VALUES ($1)', [file])
        await client.query('COMMIT')
        console.log(`Completed: ${file}`)
      } catch (error) {
        await client.query('ROLLBACK')
        console.error(`Failed: ${file}`, error)
        throw error
      }
    }

    console.log('All migrations completed!')
  } finally {
    client.release()
    await pool.end()
  }
}

runMigrations().catch(console.error)
