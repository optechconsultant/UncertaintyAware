import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { query } from './db';
import authRouter from './routes/auth';
import widgetPreferencesRouter from './routes/widgetPreferences';
import usersRouter from './routes/users';

dotenv.config();

const app = express();
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json());

app.use('/auth', authRouter);
app.use('/widget-preferences', widgetPreferencesRouter);
app.use('/users', usersRouter);

interface HealthQueryResult {
  db_time: Date;
}

app.get('/health', async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await query<HealthQueryResult>('SELECT NOW() as db_time;');
    const dbTime = result.rows[0]?.db_time ? result.rows[0].db_time.toISOString() : null;

    res.status(200).json({
      status: 'ok',
      dbTime,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Database query failed';
    res.status(500).json({
      status: 'error',
      message,
    });
  }
});

export default app;
