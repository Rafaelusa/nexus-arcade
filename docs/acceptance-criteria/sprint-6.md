# Critérios de Aceite - Sprint 6

**Projeto**: NEXUS ARCADE  
**Sprint**: Sprint 6 - Frontend Core Shell (Angular 21, Cyberpunk Theme, Auth & RBAC UX)  
**Data**: 09/08/2026  
**Status**: 🟢 APROVADO  

---

## 🎯 1. Objetivo do Teste

Validar a camada de **Frontend Core Shell e Experiência de Autenticação** do **NEXUS ARCADE**, cobrindo:
1. Arquitetura reativa de sessão com **Angular 21 Signals** (`AuthService`).
2. Interceptador HTTP funcional (`authInterceptor`) anexando `Authorization: Bearer <token>` em todas as requisições para a API NestJS.
3. Proteção de rotas com `authGuard` (redirecionando visitantes não autenticados para `/login`) e `roleGuard` (bloqueando usuários `GAMER` de acessar a área `/admin`).
4. Interface adaptativa por papel (`SidebarComponent` & `HeaderComponent`):
   - Exibição de menu de Administração apenas para usuários com papel `ADMIN`.
   - Exibição de avatar do perfil e botão de Logout.
5. Telas de Login (`/login`), Registro de GAMER (`/register`), Dashboard (`/dashboard`) e Painel Admin (`/admin`).

---

## 📋 2. Critérios de Aceite Definidos

| ID | Requisito / Funcionalidade | Resultado Esperado | Status |
| :--- | :--- | :--- | :---: |
| **AC-01** | **Reactive Auth Signals** | `AuthService` em Angular 21 gerenciando `currentUser`, `token`, `isAuthenticated`, `isAdmin` e `isGamer` via Signals reativos. | 🟢 PASS |
| **AC-02** | **Bearer Token Interceptor** | `authInterceptor` anexando o cabeçalho `Authorization: Bearer <token>` automaticamente nas chamadas HTTP para o backend. | 🟢 PASS |
| **AC-03** | **AuthGuard Protection** | Tentativa de acessar `/dashboard` ou `/admin` sem estar logado redireciona para `/login`. | 🟢 PASS |
| **AC-04** | **RBAC RoleGuard** | Tentativa de usuário `GAMER` acessar a rota `/admin` é bloqueada e redirecionada para `/dashboard`. | 🟢 PASS |
| **AC-05** | **Role-Aware Navigation UX** | `SidebarComponent` oculta a seção "ADMINISTRAÇÃO" para perfil `GAMER` e exibe para `ADMIN`. | 🟢 PASS |
| **AC-06** | **Cyberpunk Auth Views** | Formulários de Login (`/login`) e Registro (`/register`) estilizados em Cyberpunk Glassmorphic com integração à API real. | 🟢 PASS |

---

## 🧪 3. Validações Executadas

### Testes Automatizados & Compilação
- [x] `npm run build` compilando a aplicação Angular 21 e a API NestJS com **100% de sucesso sem erros de build**.

---

## 🏷️ 4. Informações do Commit & Tag Git

- **Mensagem do Commit**: `feat(sprint-6): implement angular 21 frontend core shell auth signals guards and role-aware navigation`
- **Tag Git**: `v0.6.0-sprint6`
- **Descrição da Tag**: `Sprint 6: Frontend Core Shell (Angular 21, Cyberpunk Theme, Auth & RBAC UX)`

---

## 👤 5. Roteiro para Teste Manual do Usuário (Antes do Git Push)

Antes de realizar o `git push`, siga os passos abaixo no navegador para homologar o Frontend da Sprint 6:

### Passo 1: Iniciar a Aplicação (`npm run start`)
Na raiz do projeto (`nexus-arcade`), execute:
```bash
npm run start
```

### Passo 2: Testar o Redirecionamento da Rota Protegida
Abra o navegador em modo anônimo ou limpe o localStorage em: **`http://localhost:4200/dashboard`**
- **Resultado Esperado**: O `authGuard` interceptará o acesso não autenticado e redirecionará automaticamente para **`http://localhost:4200/login`**.

### Passo 3: Testar o Login como ADMINISTRADOR
Na tela de Login (`http://localhost:4200/login`):
1. Mantenha as credenciais pré-preenchidas (`admin@nexus.local` / `Admin123!NexusArcade`).
2. Clique em **Entrar na Plataforma 🚀**.
- **Resultado Esperado**:
  - Redirecionamento bem-sucedido para o Dashboard (`/dashboard`).
  - O **Header** exibirá o username `admin` com a pílula rosa **ADMIN**.
  - O **Menu Lateral (Sidebar)** exibirá as duas seções: **MENU PRINCIPAL** e **ADMINISTRAÇÃO** *(Painel Admin, Gerenciar Usuários, Gerenciar Jogos, Gerenciar Plataformas, Logs de Auditoria)*.

### Passo 4: Testar o Acesso à Área Administrativa
Clique no menu lateral em **Painel Admin** (ou acesse `http://localhost:4200/admin`):
- **Resultado Esperado**: O `roleGuard` liberará o acesso e exibirá a página com o badge rosa `"EXCLUSIVO PARA ADMINISTRADORES"`.

### Passo 5: Testar Cadastro e Bloqueio de Papel com Usuário GAMER
1. No topo direito, clique em **🚪 Sair** (o aplicativo limpa a sessão e redireciona para `/login`).
2. Clique no link **Cadastre-se como GAMER** (`http://localhost:4200/register`).
3. Preencha um novo cadastro: `gamer_teste@nexus.local`, username: `gamer_teste`, senha: `Password123!`.
4. Clique em **Cadastrar e Jogar 🎮**.
- **Resultado Esperado**:
  - Cadastro e login automáticos.
  - O Header exibirá a pílula azul **GAMER**.
  - A **Sidebar OCULTARÁ** a seção de Administração, exibindo apenas o Menu Principal *(Dashboard, Biblioteca, Favoritos, Plataformas, Configurações)*.

### Passo 6: Testar a Proteção do RoleGuard para GAMER
Estando logado como `gamer_teste`, digite manualmente na barra do navegador: **`http://localhost:4200/admin`**
- **Resultado Esperado**: O `roleGuard` interceptará o acesso não autorizado de um usuário GAMER e redirecionará você de volta para **`http://localhost:4200/dashboard`**!
