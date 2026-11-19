import express from 'express';
import { router } from './routes';
import { view } from './views/jsonView';
import { errorHandler } from './middleware/errorHandler';

/** Assembles the Express app. The database must already be open (see index.ts). */
export function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/api', router);
  app.use((_req, res) => view.error(res, 404, 'no such route'));
  app.use(errorHandler);
  return app;
}
