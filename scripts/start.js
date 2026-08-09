const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { waitForDb } = require('./wait-for-db');
const { migrate } = require('./migrate');
const { seed } = require('./seed');

// ANSI Colors for Terminal Output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
};

function printBanner() {
  console.log(`
${colors.cyan}${colors.bright}
  ███╗   ██╗███████╗██╗  ██╗██╗  ██╗███████╗    █████╗ ██████╗  ██████╗ █████╗ ██████╗ ███╗   ██╗
  ████╗  ██║██╔════╝╚██╗██╔╝██║  ██║██╔════╝   ██╔══██╗██╔══██╗██╔════╝██╔══██╗██╔══██╗████╗  ██║
  ██╔██╗ ██║█████╗   ╚███╔╝ ██║  ██║███████╗   ███████║██████╔╝██║     ███████║██║  ██║██╔██╗ ██║
  ██║╚██╗██║██╔══╝   ██╔██╗ ██║  ██║╚════██║   ██╔══██║██╔══██╗██║     ██╔══██║██║  ██║██║╚██╗██║
  ██║ ╚████║███████╗██╔╝ ██╗╚█████╔╝███████║   ██║  ██║██║  ██║╚██████╗██║  ██║██████╔╝██║ ╚████║
  ╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝ ╚════╝ ╚══════╝   ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚═════╝ ╚═╝  ╚═══╝
${colors.reset}
  ${colors.magenta}🎮 Your games. Your library. Your world.${colors.reset}
  --------------------------------------------------
  `);
}

async function bootstrap() {
  printBanner();

  // 1. Ensure .env file exists
  const envPath = path.join(__dirname, '../.env');
  const envExamplePath = path.join(__dirname, '../.env.example');

  if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
    console.log(`${colors.yellow}⚠️  Arquivo .env não encontrado. Copiando de .env.example...${colors.reset}`);
    fs.copyFileSync(envExamplePath, envPath);
  }

  // Load environment variables into process.env
  require('dotenv').config({ path: envPath });

  console.log(`${colors.green}✓ Ambiente configurado (.env carregado)${colors.reset}`);

  // 2. Check Docker Availability
  try {
    execSync('docker info', { stdio: 'ignore' });
    console.log(`${colors.green}✓ Docker daemon ativo e disponível${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}❌ Docker não está em execução. Por favor, inicie o Docker e execute npm run start novamente.${colors.reset}`);
    process.exit(1);
  }

  // 3. Start PostgreSQL container via Docker Compose
  console.log(`${colors.cyan}🔄 Subindo container PostgreSQL...${colors.reset}`);
  try {
    execSync('docker compose up -d postgres', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    console.log(`${colors.green}✓ PostgreSQL container iniciado com sucesso${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}❌ Falha ao iniciar container PostgreSQL via Docker Compose.${colors.reset}`);
    process.exit(1);
  }

  // 4. Wait for PostgreSQL to be ready
  const dbHost = process.env.POSTGRES_HOST || 'localhost';
  const dbPort = parseInt(process.env.POSTGRES_PORT || '5432', 10);
  console.log(`${colors.cyan}⏳ Aguardando disponibilidade da conexão com PostgreSQL (${dbHost}:${dbPort})...${colors.reset}`);

  try {
    await waitForDb(dbHost, dbPort, 30000);
    console.log(`${colors.green}✓ Conexão com banco de dados estabelecida!${colors.reset}`);
  } catch (err) {
    console.error(`${colors.red}❌ ${err.message}${colors.reset}`);
    process.exit(1);
  }

  // 5. Execute Prisma Migrations
  console.log(`${colors.cyan}🔄 Sincronizando Schema do Banco de Dados (Prisma Migrations)...${colors.reset}`);
  try {
    migrate();
  } catch (err) {
    console.error(`${colors.red}❌ Falha na sincronização das migrations.${colors.reset}`);
    process.exit(1);
  }

  // 6. Execute Seed (Plataforma SNES + Usuário ADMIN + Jogo Demo)
  console.log(`${colors.cyan}🌱 Executando Seed de Dados (SNES, ADMIN & Jogo Demo)...${colors.reset}`);
  try {
    await seed();
  } catch (err) {
    console.error(`${colors.red}❌ Falha na execução do seed.${colors.reset}`);
    process.exit(1);
  }

  console.log(`
${colors.bright}${colors.green}==================================================
🚀 NEXUS ARCADE AMBIENTE PRONTO!
==================================================${colors.reset}
  Frontend Angular : ${colors.cyan}http://localhost:4200${colors.reset}
  Backend NestJS   : ${colors.cyan}http://localhost:3000${colors.reset}
  API Swagger Docs : ${colors.cyan}http://localhost:3000/api/docs${colors.reset}
  PostgreSQL DB    : ${colors.cyan}localhost:${dbPort}${colors.reset}
--------------------------------------------------
Iniciando servidores de desenvolvimento (NestJS & Angular)...
`);

  // 7. Start NestJS API and Angular Web app concurrently
  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

  const apiProcess = spawn(npmCmd, ['run', 'start:dev', '--workspace=apps/api'], {
    stdio: 'inherit',
    shell: true,
    cwd: path.join(__dirname, '..'),
  });

  const webProcess = spawn(npmCmd, ['run', 'start', '--workspace=apps/web'], {
    stdio: 'inherit',
    shell: true,
    cwd: path.join(__dirname, '..'),
  });

  const cleanup = () => {
    console.log(`\n${colors.yellow}Encerrando processos de desenvolvimento...${colors.reset}`);
    apiProcess.kill();
    webProcess.kill();
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

bootstrap().catch((err) => {
  console.error(`${colors.red}Erro inesperado no bootstrap:`, err, colors.reset);
  process.exit(1);
});
