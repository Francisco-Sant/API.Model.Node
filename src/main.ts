import { createApp } from './app.js';

async function start(): Promise<void> {
  const app = await createApp();

  try {
    await app.listen({ port: 8000, host: '0.0.0.0' });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

await start();
