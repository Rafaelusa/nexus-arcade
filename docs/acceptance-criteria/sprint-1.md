# Critérios de Aceite - Sprint 1

**Projeto**: NEXUS ARCADE  
**Sprint**: Sprint 1 - Monorepo Architecture & One-Command Bootstrap  
**Data**: 09/08/2026  
**Status**: 🟢 APROVADO  

---

## 🎯 1. Objetivo do Teste

Validar a criação e estabilidade da fundação do projeto **NEXUS ARCADE**, cobrindo:
1. Estrutura de Monorepo com `npm workspaces` (`apps/web`, `apps/api`, `packages/shared-types`).
2. Configuração do Docker Compose com container PostgreSQL 16 Alpine.
3. Criação dos scripts de automação em Node.js cross-platform (`scripts/start.js` e `scripts/wait-for-db.js`) garantindo o conceito **"One Command Development"**.
4. Layout inicial do Frontend Angular 21 com estética Cyberpunk/Glassmorphism.
5. Endpoints de diagnóstico `/` e `/health` no Backend NestJS.
6. Compilação bem-sucedida de todas as aplicações e pacotes via `npm run build`.

---

## 📋 2. Critérios de Aceite Definidos

| ID | Requisito / Funcionalidade | Resultado Esperado | Status |
| :--- | :--- | :--- | :---: |
| **AC-01** | **Monorepo Structure** | Configuração de `package.json` com workspaces `apps/*` e `packages/*`, integrando `apps/web` (Angular 21), `apps/api` (NestJS) e `packages/shared-types`. | 🟢 PASS |
| **AC-02** | **Docker PostgreSQL** | `docker-compose.yml` definindo serviço PostgreSQL 16 com healthcheck e portas expostas. | 🟢 PASS |
| **AC-03** | **Cross-Platform DB Wait** | Script em Node.js (`scripts/wait-for-db.js`) utilizando sockets para aguardar disponibilidade do PostgreSQL sem depender de bash shell. | 🟢 PASS |
| **AC-04** | **One-Command Bootstrap** | Script `scripts/start.js` acionado via `npm run start` orquestrando checagem de Docker, subida do banco e inicialização dos servidores. | 🟢 PASS |
| **AC-05** | **Frontend Cyberpunk & Health Integration** | Aplicação Angular exibindo dashboard com status da conexão com a API e design system Cyberpunk/Dark Mode. | 🟢 PASS |
| **AC-06** | **Monorepo Build** | Comando `npm run build` compilando os 3 projetos (`api`, `web`, `shared-types`) sem erros. | 🟢 PASS |

---

## 🧪 3. Validações Executadas

### Testes Automatizados & Compilação
- [x] `npm run build --workspace=packages/shared-types` compilado sem erros.
- [x] `npm run build --workspace=apps/api` compilado sem erros.
- [x] `npm run build --workspace=apps/web` compilado sem erros.
- [x] `npm run build` (Monorepo raiz) compilado com 100% de sucesso.

### Testes de Infraestrutura
- [x] Leitura de arquivo `.env` e fallback automático para `.env.example` quando ausente.
- [x] Tratamento gracioso de erro quando o Docker daemon não está rodando.

---

## 🏷️ 4. Informações do Commit & Tag Git

- **Mensagem do Commit**: `feat(sprint-1): bootstrap monorepo architecture and one-command start`
- **Tag Git**: `v0.1.0-sprint1`
- **Descrição da Tag**: `Sprint 1: Monorepo Architecture & One-Command Bootstrap`

---

## 👤 5. Roteiro para Teste Manual do Usuário (Antes do Git Push)

Antes de realizar o `git push`, siga os passos abaixo no seu terminal para homologar a Sprint 1:

### Passo 1: Iniciar o Docker
Certifique-se de que o **Docker Desktop** (ou o serviço do Docker) esteja rodando na sua máquina.

### Passo 2: Executar o "One Command Development"
Na raiz do projeto (`nexus-arcade`), execute:
```bash
npm run start
```

**Resultado esperado no terminal:**
1. Exibição do Banner ASCII Cyberpunk do **NEXUS ARCADE**.
2. Confirmação do carregamento do `.env`.
3. Verificação do Docker daemon ativo (`✓ Docker daemon ativo e disponível`).
4. Subida do container PostgreSQL (`nexus_arcade_postgres`).
5. Confirmação de conexão com o banco de dados (`✓ Conexão com banco de dados estabelecida!`).
6. Inicialização simultânea do NestJS e Angular.

### Passo 3: Testar o Frontend Angular
Abra o navegador em `http://localhost:4200`:
- Verifique a página inicial com o tema Cyberpunk / Dark Mode / Glassmorphic.
- O badge de status no topo indicará `API CONECTADA` em verde assim que a API NestJS estiver respondendo.

### Passo 4: Testar a API NestJS
Abra o navegador em `http://localhost:3000/health`:
- Deverá retornar um JSON estruturado:
```json
{
  "status": "online",
  "service": "Nexus Arcade API Core",
  "version": "0.1.0-sprint1",
  "timestamp": "...",
  "database": "PostgreSQL (Docker)",
  "architecture": "Monorepo Full Stack (NestJS + Angular)"
}
```

### Passo 5: Testar o Build do Monorepo
Em outro terminal na raiz do projeto, execute:
```bash
npm run build
```
- Deve finalizar com sucesso construindo os 3 workspaces (`api`, `web`, `shared-types`).
