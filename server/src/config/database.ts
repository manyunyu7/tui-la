import pg from 'pg'
import { env } from './env.js'
import { createChildLogger } from './logger.js'

const log = createChildLogger('database')

const { Pool } = pg

const connectionString = env.DATABASE_URL ||
  `postgresql://${env.POSTGRES_USER}:${env.POSTGRES_PASSWORD}@${env.POSTGRES_HOST}:${env.POSTGRES_PORT}/${env.POSTGRES_DB}`

export const pool = new Pool({
  connectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

pool.on('error', (err) => {
  log.fatal({ err }, 'Unexpected error on idle client')
  process.exit(-1)
})

function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase())
}

function transformRows<T>(rows: Record<string, unknown>[]): T[] {
  return rows.map(row => {
    const transformed: Record<string, unknown> = {}
    for (const key in row) {
      transformed[snakeToCamel(key)] = row[key]
    }
    return transformed as T
  })
}

export async function query<T extends pg.QueryResultRow>(text: string, params?: unknown[]): Promise<pg.QueryResult<T>> {
  const start = Date.now()
  const result = await pool.query<T>(text, params)
  const duration = Date.now() - start

  log.debug({ text: text.substring(0, 100), duration, rows: result.rowCount }, 'Executed query')

  result.rows = transformRows<T>(result.rows as unknown as Record<string, unknown>[])
  return result
}

export async function getClient(): Promise<pg.PoolClient> {
  return pool.connect()
}

export async function transaction<T>(
  callback: (client: pg.PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect()
  const origQuery = client.query.bind(client)
  ;(client as any).query = async (...args: any[]) => {
    const result = await (origQuery as any)(...args)
    if (result?.rows) {
      result.rows = transformRows(result.rows as unknown as Record<string, unknown>[])
    }
    return result
  }
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}
