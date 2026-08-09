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
      ├── 4. Sincronizar Prisma Migrations
      │
      ├── 5. Executar Seed de dados (Plataforma SNES + Jogo Demo)
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
| **API Docs (Swagger)** | `http://localhost:3000/api/docs` | Documentação interativa da API |
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

## 🛠️ Stack Tecnológica

### Frontend
- **Framework**: Angular 21 (Signals, Standalone Components, Control Flow)
- **Estilização**: CSS Vanilla com Tokens de Design Modernos (Dark Mode / Glassmorphism / Cyberpunk Aesthetic)
- **State & Async**: RxJS + Angular Signals
- **Hardware Integration**: Web Gamepad API, IndexedDB

### Backend
- **Framework**: NestJS (TypeScript)
- **ORM & Database**: Prisma ORM + PostgreSQL 16
- **Autenticação & Segurança**: JWT (Access/Refresh Tokens), Argon2id Password Hashing, Helmet, Rate Limiting
- **Documentação**: OpenAPI / Swagger

### Emulação & Gaming
- **Core Engine**: EmulatorJS / RetroArch Cores (WebAssembly)
- **Binary Storage**: Sistema de armazenamento local de ROMs com validação SHA-256

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
│   └── api/                     # Backend NestJS API
├── packages/
│   └── shared-types/            # Tipos e DTOs compartilhados
├── database/
│   ├── schema.prisma            # Schema do Banco de Dados
│   ├── migrations/              # Histórico de Migrations
│   └── seed/                    # Seeds (Admin, Roles, SNES Demo)
├── storage/
│   ├── roms/                    # Armazenamento binário de ROMs
│   └── covers/                  # Capas dos Jogos
├── scripts/                     # Node.js Bootstrap Scripts
│   ├── bootstrap.ts             # Script de orquestração do start
│   ├── wait-for-db.ts           # Aguarda PostgreSQL ficar pronto
│   ├── migrate.ts               # Executa Prisma Migrations
│   └── seed.ts                  # Executa os seeds idempotentes
├── docs/                        # Documentação técnica e Critérios de Aceite
│   └── acceptance-criteria/     # Relatórios por Sprint
├── docker-compose.yml           # Serviço PostgreSQL
└── package.json                 # Workspaces & Scripts Raiz
```

---

## 🚀 Sprints de Desenvolvimento

```text
🟡 SPRINT 1 : Monorepo Foundation & One-Command Bootstrap (Em andamento)
⚪ SPRINT 2 : Database Layer (PostgreSQL, Prisma ORM, Migrations & Seeds)
⚪ SPRINT 3 : Backend Auth & Security (NestJS, JWT, Argon2id, RBAC Guards)
⚪ SPRINT 4 : User Management API & Audit Logs (Admin CRUD & Recovery)
⚪ SPRINT 5 : Platforms & Games API + Binary ROM Storage Subsystem
⚪ SPRINT 6 : Frontend Core Shell (Angular 21, Cyberpunk Theme, Auth & RBAC UX)
⚪ SPRINT 7 : Frontend Library & Admin Dashboards (Management UI)
⚪ SPRINT 8 : WebAssembly Emulator Engine (EmulatorJS & ROM Player)
⚪ SPRINT 9 : Gamepad API Integration & Save States (Local + Cloud Sync)
⚪ SPRINT 10: Gamer Statistics Dashboard, Testing Suite & CI/CD Pipeline
```

---

## 📜 Licença

Desenvolvido para fins educacionais e de demonstração de arquitetura Full Stack de alto desempenho.