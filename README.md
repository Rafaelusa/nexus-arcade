# 🎮 NEXUS ARCADE

> **Your games. Your library. Your world.**

Plataforma web Full Stack para gerenciamento, organização e execução de jogos clássicos diretamente no navegador.

O **Nexus Arcade** combina uma interface inspirada em **dashboards empresariais**, estética **anime/retro/cyberpunk** e uma arquitetura Full Stack moderna com **Angular 21**, **NestJS**, **PostgreSQL**, **Prisma ORM**, **Docker**, **WebAssembly**, **EmulatorJS** e **Gamepad API**.

---

## ⚡ Princípio Fundamental: One Command Development

> **"Clone, install, start and develop."**

Sem passos manuais para configurar banco de dados, usuários, tabelas ou servidores. Um único comando prepara e inicializa todo o ecossistema:

```bash
git clone https://github.com/Rafaelusa/nexus-arcade.git
cd nexus-arcade
npm install
npm run start
```

### 🔄 Fluxo do `npm run start`

```text
npm run start
      │
      ├── 1. Verificar ambiente (Node.js & Docker)
      │
      ├── 2. Subir PostgreSQL (Docker Compose)
      │
      ├── 3. Aguardar disponibilidade do banco (Porta 5432)
      │
      ├── 4. Sincronizar Prisma Migrations (scripts/migrate.js)
      │
      ├── 5. Executar Seed idempotente de dados (scripts/seed.js)
      │
      ├── 6. Garantir usuário ADMIN inicial com Argon2id
      │
      ├── 7. Iniciar NestJS (Backend API - Port 3000)
      │
      └── 8. Iniciar Angular (Frontend App - Port 4200)
```

### 📍 Serviços Disponíveis

| Serviço | URL / Endereço | Descrição |
| :--- | :--- | :--- |
| **Frontend Angular** | `http://localhost:4200` | App com Dashboard Cyberpunk / Game Library |
| **Backend NestJS** | `http://localhost:3000` | API RESTful com RBAC, JWT e File Storage |
| **API Docs (Swagger)** | `http://localhost:3000/api/docs` | Documentação interativa da API (OpenAPI) |
| **PostgreSQL Database** | `localhost:5432` | Banco de dados relacional executado no Docker |

---

## 🛡️ Matriz de Permissões (RBAC)

O sistema possui controle de acesso rigoroso baseado em papéis (*Role-Based Access Control*), validados **sempre no Backend** através de Guards do NestJS (`JwtAuthGuard` + `RolesGuard`):

| Recurso / Funcionalidade | GAMER | ADMIN |
| :--- | :---: | :---: |
| Visualizar Dashboard & Biblioteca | ✅ | ✅ |
| Buscar & Filtrar Jogos por Plataforma | ✅ | ✅ |
| Executar Jogos no Navegador (WebAssembly) | ✅ | ✅ |
| Conectar Controles Físicos (Gamepad API) | ✅ | ✅ |
| Gerenciar Save States (IndexedDB & Nuvem) | ✅ | ✅ |
| Favoritar Jogos & Ver Estatísticas | ✅ | ✅ |
| Gerenciar Perfil Pessoal | ✅ | ✅ |
| **Gerenciar Usuários (Listar, Criar, Editar, Excluir, Bloquear)** | ❌ | ✅ |
| **Gerenciar Jogos (Criar, Editar, Remover metadados)** | ❌ | ✅ |
| **Upload & Substituição de ROMs (Armazenamento Binário)** | ❌ | ✅ |
| **Gerenciar Plataformas (SNES, NES, GBA, etc.)** | ❌ | ✅ |
| **Logs de Auditoria do Sistema** | ❌ | ✅ |

---

## 🗄️ Estrutura do Banco de Dados (PostgreSQL + Prisma ORM)

O projeto possui **8 tabelas relacionais** modeladas e migradas automaticamente:

| Tabela | Descrição |
| :--- | :--- |
| `users` | Cadastro de usuários, papéis (`ADMIN`, `GAMER`), hash Argon2id e avatares. |
| `platforms` | Plataformas de jogos (ex: SNES, NES, GBA) com códigos únicos e status ativo. |
| `games` | Catálogo de jogos, metadados, capas e chaves de armazenamento de ROMs. |
| `user_games` | Associação de favoritos, histórico e tempo de jogo de cada usuário. |
| `game_sessions` | Registro detalhado de sessões de jogo iniciadas e finalizadas. |
| `save_states` | Gerenciamento de slots de salvamento de estado com capturas de tela. |
| `controller_profiles` | Mapeamentos customizados de controles físicos (Gamepad API). |
| `audit_logs` | Histórico completo de ações administrativas e alterações no sistema. |

---

## 🛠️ Stack Tecnológica

### Frontend
- **Framework**: Angular 21 (Signals, Standalone Components, Control Flow)
- **Estilização**: CSS Vanilla com Tokens de Design Modernos (Dark Mode / Glassmorphic / Cyberpunk Aesthetic)
- **State & Async**: RxJS + Angular Signals
- **Hardware Integration**: Web Gamepad API, IndexedDB

### Backend
- **Framework**: NestJS (TypeScript)
- **ORM & Database**: Prisma ORM 6 + PostgreSQL 16
- **Autenticação & Segurança**: JWT (Access & Refresh Tokens), Argon2id Password Hashing, Helmet, Rate Limiting
- **Documentação**: OpenAPI / Swagger UI
- **Armazenamento Binário**: SHA-256 Hash Verification & ROM Streaming

### Emulação & Gaming
- **Core Engine**: EmulatorJS / RetroArch Cores (WebAssembly)
- **Binary Storage**: Armazenamento local de ROMs com validação SHA-256

### Infraestrutura & Qualidade
- **Containers**: Docker & Docker Compose
- **Workspaces**: `npm workspaces` Monorepo
- **Testes**: Jest / Vitest & Supertest

---

## 📂 Estrutura do Monorepo

```text
nexus-arcade/
├── apps/
│   ├── web/                     # Frontend Angular 21
│   └── api/                     # Backend NestJS API (Auth, Users, Platforms, Games, Storage)
├── packages/
│   └── shared-types/            # Tipos e DTOs compartilhados
├── database/
│   ├── schema.prisma            # Schema relacional do Prisma ORM
│   ├── migrations/              # Histórico de Migrations
│   └── seed/                    # Seeds (Admin, Roles, SNES Demo)
├── storage/
│   ├── roms/                    # Armazenamento binário de ROMs com SHA-256
│   └── covers/                  # Capas dos Jogos
├── scripts/                     # Node.js Bootstrap Scripts
│   ├── bootstrap.ts             # Script de orquestração do start
│   ├── wait-for-db.js           # Aguarda PostgreSQL ficar pronto
│   ├── migrate.js               # Executa Prisma Migrations
│   └── seed.js                  # Executa os seeds idempotentes
├── docs/                        # Documentação técnica e Critérios de Aceite
│   └── acceptance-criteria/     # Relatórios por Sprint
├── docker-compose.yml           # Serviço PostgreSQL 16
└── package.json                 # Workspaces & Scripts Raiz
```

---

## 🚀 Progresso das Sprints

- 🟢 **[Sprint 1](file:///home/rafael-dev/Projetos%20Pessoais/nexus-arcade/docs/acceptance-criteria/sprint-1.md)**: Monorepo Foundation & One-Command Bootstrap (`v0.1.0-sprint1`) — **Concluído**
- 🟢 **[Sprint 2](file:///home/rafael-dev/Projetos%20Pessoais/nexus-arcade/docs/acceptance-criteria/sprint-2.md)**: Database Layer (PostgreSQL, Prisma ORM, Migrations & Seeds) (`v0.2.0-sprint2`) — **Concluído**
- 🟢 **[Sprint 3](file:///home/rafael-dev/Projetos%20Pessoais/nexus-arcade/docs/acceptance-criteria/sprint-3.md)**: Backend Auth & Security (NestJS, JWT, Argon2id, RBAC Guards & Swagger) (`v0.3.0-sprint3`) — **Concluído**
- 🟢 **[Sprint 4](file:///home/rafael-dev/Projetos%20Pessoais/nexus-arcade/docs/acceptance-criteria/sprint-4.md)**: User Management API & Audit Logs (Admin CRUD & Recovery) (`v0.4.0-sprint4`) — **Concluído**
- 🟢 **[Sprint 5](file:///home/rafael-dev/Projetos%20Pessoais/nexus-arcade/docs/acceptance-criteria/sprint-5.md)**: Platforms & Games API + Binary ROM Storage Subsystem (`v0.5.0-sprint5`) — **Concluído**
- 🟡 **Sprint 6**: Frontend Core Shell (Angular 21, Cyberpunk Theme, Auth & RBAC UX) — **Em andamento**
- ⚪ **Sprint 7**: Frontend Library & Admin Dashboards (Management UI)
- ⚪ **Sprint 8**: WebAssembly Emulator Engine (EmulatorJS & ROM Player)
- ⚪ **Sprint 9**: Gamepad API Integration & Save States (Local + Cloud Sync)
- ⚪ **Sprint 10**: Gamer Statistics Dashboard, Testing Suite & CI/CD Pipeline

---

## 📜 Licença

Desenvolvido para fins educacionais e de demonstração de arquitetura Full Stack de alto desempenho.