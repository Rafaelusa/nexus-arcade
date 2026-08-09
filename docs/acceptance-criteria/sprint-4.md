# Critérios de Aceite - Sprint 4

**Projeto**: NEXUS ARCADE  
**Sprint**: Sprint 4 - User Management API & Audit Logs (Admin CRUD & Recovery)  
**Data**: 09/08/2026  
**Status**: 🟢 APROVADO  

---

## 🎯 1. Objetivo do Teste

Validar o módulo de **Gerenciamento de Usuários e Logs de Auditoria** do **NEXUS ARCADE**, cobrindo:
1. Listagem paginada, busca e filtros de usuários (`GET /users`).
2. CRUD completo de usuários para Administradores (`POST /users`, `PATCH /users/:id`, `DELETE /users/:id`).
3. Regra de **Proteção do Último Administrador**: Bloqueio de exclusão ou remoção de permissões caso reste apenas 1 Administrador ativo.
4. Alternância de status de bloqueio/desbloqueio de contas (`PATCH /users/:id/block`).
5. Gerenciamento do próprio perfil e alteração de senha com validação **Argon2id** (`PATCH /users/me/profile`, `PATCH /users/me/password`).
6. Subsistema de auditoria (`AuditService`) registrando automaticamente as ações administrativas e disponibilizando consulta em `GET /audit-logs`.

---

## 📋 2. Critérios de Aceite Definidos

| ID | Requisito / Funcionalidade | Resultado Esperado | Status |
| :--- | :--- | :--- | :---: |
| **AC-01** | **User Listing & Search** | `GET /users` lista usuários com paginação, filtro por papel (`ADMIN`/`GAMER`), busca textual e status de bloqueio. Exclusivo para `ADMIN`. | 🟢 PASS |
| **AC-02** | **Admin User Creation & Edit** | `POST /users` e `PATCH /users/:id` permitem criar/editar usuários com papéis definidos pelo ADMIN e hash Argon2id. | 🟢 PASS |
| **AC-03** | **Last Admin Protection** | `DELETE /users/:id` impede a exclusão do único Administrador do sistema, retornando erro `400 Bad Request`. | 🟢 PASS |
| **AC-04** | **Block/Unblock Toggle** | `PATCH /users/:id/block` altera o status de bloqueio e impede bloquear o único Admin ativo. | 🟢 PASS |
| **AC-05** | **Self Profile & Password Change** | `PATCH /users/me/password` exige a senha atual com Argon2id antes de salvar a nova senha. | 🟢 PASS |
| **AC-06** | **Audit Logging Subsystem** | Todas as ações registram entradas na tabela `audit_logs`, consultáveis via `GET /audit-logs` com paginação. | 🟢 PASS |

---

## 🧪 3. Validações Executadas

### Testes Automatizados
- [x] Suíte de testes unitários executada com **100% de aprovação (12/12 tests passed)** em `UsersService`, `AuthService` e `AppController`.
- [x] `npm run build` compilando os 3 workspaces (`api`, `web`, `shared-types`) sem qualquer erro.

---

## 🏷️ 4. Informações do Commit & Tag Git

- **Mensagem do Commit**: `feat(sprint-4): implement user management api last admin protection and audit logging`
- **Tag Git**: `v0.4.0-sprint4`
- **Descrição da Tag**: `Sprint 4: User Management API & Audit Logs (Admin CRUD & Recovery)`

---

## 👤 5. Roteiro para Teste Manual do Usuário (Antes do Git Push)

Antes de realizar o `git push`, siga os passos abaixo para testar os endpoints de gerenciamento de usuários e auditoria no Swagger UI:

### Passo 1: Iniciar o Projeto (`npm run start`)
Na raiz do projeto (`nexus-arcade`), execute:
```bash
npm run start
```

### Passo 2: Fazer Login como ADMIN no Swagger (`http://localhost:3000/api/docs`)
1. No Swagger UI, expanda **`POST /auth/login`**.
2. Faça login com o Admin padrão (`admin@nexus.local` / `Admin123!NexusArcade`).
3. Copie o `accessToken` e autorize no botão **Authorize** 🔓 no topo.

### Passo 3: Testar a Regra de Proteção do Último Admin (Tentar Excluir o Admin)
1. Copie o `id` do único Admin existente.
2. Expanda o endpoint **`DELETE /users/{id}`** em **Gerenciamento de Usuários**.
3. Cole o ID do Admin e clique em **Execute**.
- **Resultado Esperado**: Status **400 Bad Request** com a mensagem: `"Operação negada: Não é possível excluir o único Administrador do sistema. Cadastre outro Administrador antes."`.

### Passo 4: Criar um Segundo Administrador (`POST /users`)
Expanda **`POST /users`** e cadastre outro administrador:
```json
{
  "email": "sec_admin@nexus.local",
  "username": "sec_admin",
  "password": "Password123!",
  "role": "ADMIN"
}
```
- **Resultado Esperado**: Status **201 Created** com `role: "ADMIN"`.

### Passo 5: Testar Exclusão Válida (Após ter mais de 1 Admin)
Execute novamente a exclusão do `sec_admin`:
- **Resultado Esperado**: Status **200 OK** com a mensagem de sucesso!

### Passo 6: Consultar os Logs de Auditoria (`GET /audit-logs`)
Expanda o grupo **Auditoria & Logs (Admin)** e execute o endpoint **`GET /audit-logs`**:
- **Resultado Esperado**: Retorna os registros das ações executadas (`ADMIN_CREATED_USER`, `ADMIN_DELETED_USER`) contendo a data, o ID do admin que executou e os metadados.
