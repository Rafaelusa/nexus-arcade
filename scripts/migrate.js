const { execSync } = require('child_process');
const path = require('path');

function migrate() {
  console.log('[Migrate] Sincronizando schema do Prisma com o banco PostgreSQL...');
  try {
    execSync('npx prisma db push --schema=database/schema.prisma', {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
    });
    console.log('[Migrate] ✓ Banco de dados sincronizado com sucesso!');
  } catch (error) {
    console.error('[Migrate] ❌ Falha ao aplicar migrations no PostgreSQL:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  migrate();
}

module.exports = { migrate };
