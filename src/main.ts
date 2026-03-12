import { createApp } from './app.js';

async function start(): Promise<void> {
  const app = await createApp();

  try {
    await app.listen({ host: '127.0.0.1', port: 8000 });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

await start();
