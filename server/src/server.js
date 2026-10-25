const { port, nodeEnv } = require('./config/env'); // loads and checks .env first
const connectDB = require('./config/db');
const app = require('./app');

async function start() {
  await connectDB();
  const server = app.listen(port, () => {
    console.log(`API running in ${nodeEnv} mode on http://localhost:${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') console.error(`Port ${port} is already in use. Stop the other process or change PORT.`);
    else console.error(err);
    process.exit(1);
  });
}

// A failed promise should be logged, not silently ignored.
process.on('unhandledRejection', (reason) => console.error('Unhandled rejection:', reason));

start();
