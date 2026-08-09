const { PrismaClient } = require('@prisma/client');
const argon2 = require('argon2');
require('dotenv').config();

const prisma = new PrismaClient();

async function seed() {
  console.log('[Seed] Iniciando processo de seed de dados para Nexus Arcade...');

  try {
    // 1. Seed Plataforma SNES
    const snesPlatform = await prisma.platform.upsert({
      where: { code: 'snes' },
      update: {
        name: 'Super Nintendo (SNES)',
        description: 'Super Nintendo Entertainment System - Console 16-bit clássico da Nintendo.',
        iconUrl: '/assets/icons/snes.svg',
        isActive: true,
      },
      create: {
        name: 'Super Nintendo (SNES)',
        code: 'snes',
        description: 'Super Nintendo Entertainment System - Console 16-bit clássico da Nintendo.',
        iconUrl: '/assets/icons/snes.svg',
        isActive: true,
      },
    });

    console.log(`[Seed] ✓ Plataforma cadastrada/verificada: ${snesPlatform.name} (${snesPlatform.code})`);

    // 2. Seed Usuário ADMIN (Idempotente)
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@nexus.local';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!NexusArcade';

    const existingAdmin = await prisma.user.findFirst({
      where: {
        OR: [{ email: adminEmail }, { username: 'admin' }],
      },
    });

    if (!existingAdmin) {
      const passwordHash = await argon2.hash(adminPassword, {
        type: argon2.argon2id,
      });

      const adminUser = await prisma.user.create({
        data: {
          email: adminEmail,
          username: 'admin',
          passwordHash: passwordHash,
          role: 'ADMIN',
          avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=nexus-admin',
        },
      });

      console.log(`[Seed] ✓ Usuário ADMIN criado com sucesso: ${adminUser.email} (Role: ${adminUser.role})`);
    } else {
      console.log(`[Seed] ✓ Usuário ADMIN já existe (${existingAdmin.email}), pulando criação.`);
    }

    // 3. Seed Jogo de Demonstração (SNES)
    const demoGame = await prisma.game.upsert({
      where: { id: '00000000-0000-0000-0000-000000000001' },
      update: {
        title: 'Super Mario World (Demo)',
        description: 'Um clássico atemporal da Nintendo que definiu a era dos jogos de plataforma 16-bit.',
        platformId: snesPlatform.id,
        coverUrl: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?q=80&w=400&auto=format&fit=crop',
        releaseYear: 1990,
        developer: 'Nintendo EAD',
        publisher: 'Nintendo',
      },
      create: {
        id: '00000000-0000-0000-0000-000000000001',
        title: 'Super Mario World (Demo)',
        description: 'Um clássico atemporal da Nintendo que definiu a era dos jogos de plataforma 16-bit.',
        platformId: snesPlatform.id,
        coverUrl: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?q=80&w=400&auto=format&fit=crop',
        releaseYear: 1990,
        developer: 'Nintendo EAD',
        publisher: 'Nintendo',
      },
    });

    console.log(`[Seed] ✓ Jogo de demonstração cadastrado/verificado: ${demoGame.title}`);

    console.log('[Seed] ✨ Seed finalizado com sucesso!');
  } catch (error) {
    console.error('[Seed] ❌ Erro durante a execução do seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seed();
}

module.exports = { seed };
