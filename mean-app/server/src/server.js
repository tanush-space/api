const { app, connectDb } = require('./app');

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await connectDb();
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  start();
}

module.exports = { start };


