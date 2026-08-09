const net = require('net');

function waitForDb(host = 'localhost', port = 5432, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const tryConnect = () => {
      const socket = new net.Socket();

      socket.setTimeout(2000);

      socket.on('connect', () => {
        socket.destroy();
        resolve(true);
      });

      socket.on('error', (err) => {
        socket.destroy();
        if (Date.now() - startTime >= timeoutMs) {
          reject(new Error(`Timeout waiting for PostgreSQL at ${host}:${port}`));
        } else {
          setTimeout(tryConnect, 1000);
        }
      });

      socket.on('timeout', () => {
        socket.destroy();
        if (Date.now() - startTime >= timeoutMs) {
          reject(new Error(`Timeout waiting for PostgreSQL at ${host}:${port}`));
        } else {
          setTimeout(tryConnect, 1000);
        }
      });

      socket.connect(port, host);
    };

    tryConnect();
  });
}

if (require.main === module) {
  const host = process.env.POSTGRES_HOST || 'localhost';
  const port = parseInt(process.env.POSTGRES_PORT || '5432', 10);
  console.log(`[Bootstrap] Aguardando PostgreSQL em ${host}:${port}...`);
  waitForDb(host, port)
    .then(() => {
      console.log(`[Bootstrap] PostgreSQL está pronto e escutando na porta ${port}!`);
      process.exit(0);
    })
    .catch((err) => {
      console.error(`[Bootstrap] Erro ao aguardar PostgreSQL:`, err.message);
      process.exit(1);
    });
}

module.exports = { waitForDb };
