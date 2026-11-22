import 'dotenv/config';
import app from './app.js';
import { connectDb } from './config/db.js';

const PORT = process.env.PORT || 4000;

async function main() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is missing. Copy .env.example to .env first.');
  }
  await connectDb();
  app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
}

main().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
