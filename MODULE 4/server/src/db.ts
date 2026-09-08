import { Pool, QueryResult, QueryResultRow } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is missing.');
}

export const pool = new Pool({
  connectionString,
});

pool.on('error', (err: Error) => {
  console.error(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'error',
      actor: 'system',
      action: 'db_pool_error',
      message: err.message,
    })
  );
});

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<QueryResult<T>> {
  const start = Date.now();
  try {
    const result = await pool.query<T>(text, params);
    return result;
  } catch (err: unknown) {
    const duration = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'error',
        actor: 'system',
        action: 'db_query_error',
        duration_ms: duration,
        message,
      })
    );
    throw err;
  }
}
