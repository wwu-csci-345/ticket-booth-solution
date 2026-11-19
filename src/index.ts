import { openDatabase } from './db/database';
import { createApp } from './app';

const PORT = Number(process.env.PORT ?? 3000);

await openDatabase();
createApp().listen(PORT, () => {
  console.log(`Ticket Booth API on http://localhost:${PORT}  (database seeded, in memory)`);
});
