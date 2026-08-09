# Critérios de Aceite - Sprint 3

**Projeto**: NEXUS ARCADE  
**Sprint**: Sprint 3 - Backend Auth & Security (NestJS, JWT, Argon2id, RBAC Guards & Swagger)  
**Data**: 09/08/2026  
**Status**: 🟢 APROVADO  

---

## 🎯 1. Objetivo do Teste

Validar o módulo de **Autenticação, Autorização e Segurança** do **NEXUS ARCADE**, cobrindo:
1. Registro de usuários `GAMER` (`POST /auth/register`) com hashing seguro **Argon2id**.
2. Autenticação com credenciais (`POST /auth/login`) e geração de **JWT Access Tokens** (expiração de 1h) e **Refresh Tokens** (7 dias).
3. Renovação de tokens (`POST /auth/refresh`).
4. Proteção de rotas com `JwtAuthGuard` e leitura de perfil (`GET /auth/me`).
5. Proteção RBAC com `@Roles(UserRole.ADMIN)` e `RolesGuard` garantindo bloqueio HTTP 403 Forbidden para perfis não autorizados (`GET /auth/admin-test`).
6. Validação global de payloads com `ValidationPipe`, cabeçalhos de segurança com `Helmet` e documentação OpenAPI Swagger em `http://localhost:3000/api/docs`.

---

## 📋 2. Critérios de Aceite Definidos

| ID | Requisito / Funcionalidade | Resultado Esperado | Status |
| :--- | :--- | :--- | :---: |
| **AC-01** | **User Registration & Argon2id** | `POST /auth/register` cria novos usuários com papel `GAMER`, aplica hash Argon2id e retorna JWT Tokens. Rejeita duplicações com HTTP 409. | 🟢 PASS |
| **AC-02** | **Authentication & Login** | `POST /auth/login` valida credenciais via `argon2.verify`, bloqueia contas com `isBlocked: true` e retorna tokens. | 🟢 PASS |
| **AC-03** | **Token Refresh** | `POST /auth/refresh` valida refresh token e emite novo Access Token JWT sem exigir nova senha. | 🟢 PASS |
| **AC-04** | **JWT Bearer Protection** | `GET /auth/me` exige token `Authorization: Bearer <token>` e retorna dados do usuário autenticado sem expor a senha. | 🟢 PASS |
| **AC-05** | **RBAC Authorization Guard** | `GET /auth/admin-test` com `@Roles(UserRole.ADMIN)` bloqueia usuários com perfil `GAMER` (403 Forbidden) e permite acesso para `ADMIN` (200 OK). | 🟢 PASS |
| **AC-06** | **Swagger UI & Security Headers** | Documentação interativa rodando em `http://localhost:3000/api/docs`, DTOs validados via `class-validator` e Helmet ativado. | 🟢 PASS |

---

## 🧪 3. Validações Executadas

### Testes Automatizados
- [x] Testes unitários para `AuthService` e `AppController` executados com **100% de aprovação (6/6 tests passed)**.
- [x] `npm run build` compilando os 3 workspaces (`api`, `web`, `shared-types`) sem qualquer erro.

---

## 🏷️ 4. Informações do Commit & Tag Git

- **Mensagem do Commit**: `feat(sprint-3): implement nestjs auth jwt argon2id rbac guards and swagger`
- **Tag Git**: `v0.3.0-sprint3`
- **Descrição da Tag**: `Sprint 3: Backend Auth & Security (NestJS, JWT, Argon2id, RBAC Guards & Swagger)`

---

## 👤 5. Roteiro para Teste Manual do Usuário (Antes do Git Push)

Antes de realizar o `git push`, siga os passos abaixo para testar os endpoints de segurança no navegador através da Swagger UI:

### Passo 1: Iniciar a Aplicação (`npm run start`)
Na raiz do projeto (`nexus-arcade`), execute:
```bash
npm run start
```

### Passo 2: Abrir a Documentação Swagger UI
Abra o navegador em: **`http://localhost:3000/api/docs`**
- Você verá o grupo **Autenticação & Segurança** contendo os endpoints `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/me` e `/auth/admin-test`.

### Passo 3: Testar o Login com Usuário ADMIN Existente
No Swagger, expanda o endpoint **`POST /auth/login`**:
- Clique em **Try it out**.
- Insira o JSON com as credenciais do Admin gerado no Seed:
```json
{
  "email": "admin@nexus.local",
  "password": "Admin123!NexusArcade"
}
```
- Clique em **Execute**.
- **Resultado Esperado**: Status **200 OK**, com o objeto `user` (`role: "ADMIN"`) e as chaves `accessToken` e `refreshToken`.
- **Copie o `accessToken` gerado**.

### Passo 4: Testar a Autorização de ADMIN (`GET /auth/admin-test`)
1. No topo da página do Swagger, clique no botão **Authorize** 🔓 (canto superior direito).
2. Cole o `accessToken` no campo de texto e clique em **Authorize**.
3. Expanda o endpoint **`GET /auth/admin-test`**, clique em **Try it out** e **Execute**.
- **Resultado Esperado**: Status **200 OK** com a mensagem: `"Acesso concedido com sucesso! Você possui permissão de ADMINISTRADOR."`.

### Passo 5: Cadastrar um Usuário GAMER (`POST /auth/register`)
No Swagger, expanda o endpoint **`POST /auth/register`**:
- Insira um novo usuário:
```json
{
  "email": "player1@nexus.local",
  "username": "player1",
  "password": "Password123!"
}
```
- Clique em **Execute**.
- **Resultado Esperado**: Status **201 Created**, com o usuário de role `"GAMER"` e seu novo `accessToken`.

### Passo 6: Testar o Bloqueio RBAC (403 Forbidden) para GAMER
1. Clique em **Authorize** 🔓 no topo, substitua o token pelo token do `player1` (papel `GAMER`).
2. Execute o endpoint **`GET /auth/admin-test`**.
- **Resultado Esperado**: Status **403 Forbidden** com a mensagem: `"Acesso negado: Recursos exigem privilégios de [ADMIN], mas seu perfil é [GAMER]"`.
