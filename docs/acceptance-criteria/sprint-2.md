# Critérios de Aceite - Sprint 2

**Projeto**: NEXUS ARCADE  
**Sprint**: Sprint 2 - Database Layer (PostgreSQL, Prisma ORM, Migrations & Seeds)  
**Data**: 09/08/2026  
**Status**: 🟢 APROVADO  

---

## 🎯 1. Objetivo do Teste

Validar a implementação da camada de persistência relacional do **NEXUS ARCADE**, cobrindo:
1. Modelagem relacional completa em `database/schema.prisma` com suporte a papéis (`ADMIN`, `GAMER`), usuários, plataformas, jogos, sessões, save states, perfis de controle e logs de auditoria.
2. Migrations automatizadas sincronizando o schema com o container PostgreSQL 16 no Docker.
3. Script de Seed idempotente em Node.js (`scripts/seed.js`) realizando a carga inicial sem duplicações:
   - Plataforma Super Nintendo (SNES).
   - Usuário `ADMIN` inicial com senha criptografada via **Argon2id**.
   - Jogo de demonstração (*Super Mario World Demo*).
4. Integração do `PrismaService` no NestJS através de um `DatabaseModule` global.
5. Exibição das estatísticas do banco de dados na API REST e no dashboard do Angular.

---

## 📋 2. Critérios de Aceite Definidos

| ID | Requisito / Funcionalidade | Resultado Esperado | Status |
| :--- | :--- | :--- | :---: |
| **AC-01** | **Prisma Relational Schema** | Schema relacional configurado em `database/schema.prisma` com enums, chaves primárias UUID e relacionamentos em cascata. | 🟢 PASS |
| **AC-02** | **PostgreSQL Migrations** | Script `scripts/migrate.js` executando `npx prisma db push` e aplicando as tabelas no banco relacional. | 🟢 PASS |
| **AC-03** | **Idempotent Seed & Argon2id** | Script `scripts/seed.js` populando SNES, usuário ADMIN (com hash Argon2id) e Jogo Demo. Testes de re-execução confirmam **100% de idempotência**. | 🟢 PASS |
| **AC-04** | **NestJS Database Module** | `PrismaService` injetável no NestJS gerenciando ciclo de vida da conexão (`$connect` e `$disconnect`). | 🟢 PASS |
| **AC-05** | **Database Health Query** | Endpoint `GET /health` retornando o estado da conexão do banco e contagens em tempo real (`users: 1`, `platforms: 1`, `games: 1`). | 🟢 PASS |
| **AC-06** | **Frontend DB Integration** | Angular 21 renderizando estatísticas do banco relacional com estética Cyberpunk no dashboard. | 🟢 PASS |

---

## 🧪 3. Validações Executadas

### Testes Automatizados & Seed Idempotente
- [x] Execução do `npx prisma generate` gerando o Prisma Client com sucesso.
- [x] Execução de `node scripts/seed.js` pela 1ª vez: `✓ Usuário ADMIN criado com sucesso`.
- [x] Execução de `node scripts/seed.js` pela 2ª vez: `✓ Usuário ADMIN já existe, pulando criação` (Idempotência verificada).
- [x] `npm run build` compilando os 3 workspaces (`api`, `web`, `shared-types`) sem qualquer erro.

---

## 🏷️ 4. Informações do Commit & Tag Git

- **Mensagem do Commit**: `feat(sprint-2): implement postgresql prisma orm database layer migrations and seed`
- **Tag Git**: `v0.2.0-sprint2`
- **Descrição da Tag**: `Sprint 2: Database Layer (PostgreSQL, Prisma ORM, Migrations & Seeds)`

---

## 👤 5. Roteiro para Teste Manual do Usuário (Antes do Git Push)

Antes de realizar o `git push`, siga os passos abaixo no seu terminal para homologar a Sprint 2:

### Passo 1: Executar o Bootstrap Automatizado (`npm run start`)
Na raiz do projeto (`nexus-arcade`), execute:
```bash
npm run start
```

**Resultado esperado no terminal:**
1. O PostgreSQL subirá no Docker.
2. Mensagem `🔄 Sincronizando Schema do Banco de Dados (Prisma Migrations)...`.
3. Mensagem `🌱 Executando Seed de Dados (SNES, ADMIN & Jogo Demo)...`.
4. Log de Seed: `✓ Plataforma cadastrada: Super Nintendo (SNES)`, `✓ Usuário ADMIN verificado/criado` e `✓ Jogo demo verificado`.
5. Inicialização dos servidores NestJS e Angular.

### Passo 2: Testar a Consulta ao Banco na API
Acesse no navegador: `http://localhost:3000/health`
- Deverá retornar a contagem em tempo real vinda do PostgreSQL:
```json
{
  "status": "online",
  "service": "Nexus Arcade API Core",
  "version": "0.2.0-sprint2",
  "timestamp": "...",
  "database": {
    "provider": "PostgreSQL (Prisma ORM)",
    "status": "connected",
    "stats": {
      "users": 1,
      "platforms": 1,
      "games": 1
    }
  },
  "architecture": "Monorepo Full Stack (NestJS + Angular)"
}
```

### Passo 3: Testar o Dashboard no Frontend
Acesse no navegador: `http://localhost:4200`
- Observe o badge no topo: **SPRINT 2 - DATABASE LAYER** e **API & PRISMA CONECTADOS**.
- Verifique os 3 novos cards renderizando os dados reais vindos do banco via Prisma:
  - **1 Usuário Cadastrado** (ADMIN com Argon2id)
  - **1 Plataforma Ativa** (Super Nintendo - SNES)
  - **1 Jogo no Catálogo** (Super Mario World Demo)

### Passo 4: Testar a Idempotência do Seed
Abra outro terminal na raiz do projeto e rode manualmente:
```bash
node scripts/seed.js
```
- Verifique que a mensagem confirma que o usuário ADMIN e as plataformas já existem, finalizando sem erros nem duplicações.
