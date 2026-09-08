import dotenv from 'dotenv';
import app from './app';
import { pool } from './db';

dotenv.config();

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const handleShutdown = async (signal: string): Promise<void> => {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'info',
      actor: 'system',
      action: 'server_shutdown_initiated',
      signal,
    })
  );
  server.close(async () => {
    try {
      await pool.end();
      console.log(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: 'info',
          actor: 'system',
          action: 'db_pool_closed',
        })
      );
      process.exit(0);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: 'error',
          actor: 'system',
          action: 'shutdown_error',
          message,
        })
      );
      process.exit(1);
    }
  });
};

process.on('SIGINT', () => void handleShutdown('SIGINT'));
process.on('SIGTERM', () => void handleShutdown('SIGTERM'));

export default server;
