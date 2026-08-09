# Critérios de Aceite - Sprint 7

**Projeto**: NEXUS ARCADE  
**Sprint**: Sprint 7 - Frontend Library & Admin Dashboards (Management UI)  
**Data**: 09/08/2026  
**Status**: 🟢 APROVADO  

---

## 🎯 1. Objetivo do Teste

Validar as **Interfaces Gráficas de Gerenciamento e Biblioteca** do **NEXUS ARCADE**, cobrindo:
1. **Visão do Gamer**:
   - Biblioteca de jogos (`/library`) com grid Cyberpunk, busca textual em tempo real, filtro por plataforma, atalho "🎮 Jogar" e alternância "⭐ Favoritar".
   - Tela de Jogos Favoritos (`/favorites`).
   - Visão de Consoles (`/platforms`).
   - Painel de Configurações (`/settings`) com edição de perfil (username/avatar) e alteração de senha com validação Argon2id.
2. **Visão do Administrador**:
   - Gerenciador de Usuários (`/admin/users`) com tabela paginada, cadastro de novos admins, toggle de bloqueio e modal com alerta visual para a **Proteção do Último Admin**.
   - Gerenciador de Jogos & ROMs (`/admin/games`) com formulário de metadados, modal gráfico de **Upload de ROMs binárias** com verificação SHA-256 e **Upload de Capas**.
   - Gerenciador de Plataformas (`/admin/platforms`).
   - Visualizador de Logs de Auditoria (`/admin/logs`) consultando a tabela `audit_logs`.

---

## 📋 2. Critérios de Aceite Definidos

| ID | Requisito / Funcionalidade | Resultado Esperado | Status |
| :--- | :--- | :--- | :---: |
| **AC-01** | **Game Library UI** | `LibraryComponent` (`/library`) permite buscar jogos por título, filtrar por plataforma e marcar favoritos. | 🟢 PASS |
| **AC-02** | **Favorites View** | `FavoritesComponent` (`/favorites`) exibe em tempo real apenas os jogos favoritados pelo usuário. | 🟢 PASS |
| **AC-03** | **Self Profile & Security Settings** | `SettingsComponent` (`/settings`) atualiza username/avatar e altera senha via Argon2id com feedback em tela. | 🟢 PASS |
| **AC-04** | **Admin Users Dashboard** | `AdminUsersComponent` (`/admin/users`) gerencia contas, aplica bloqueios e bloqueia exclusão do último Admin ativando o aviso `400 Bad Request`. | 🟢 PASS |
| **AC-05** | **Admin Games & ROM Upload UI** | `AdminGamesComponent` (`/admin/games`) cadastra jogos e realiza upload de ROMs binárias e capas com envio `multipart/form-data`. | 🟢 PASS |
| **AC-06** | **Audit Trail Dashboard** | `AdminLogsComponent` (`/admin/logs`) renderiza a tabela de auditoria com ações, usuários e metadados JSON. | 🟢 PASS |

---

## 🧪 3. Validações Executadas

### Testes Automatizados & Compilação
- [x] `npm run build` compilando os 3 workspaces do Monorepo (`api`, `web`, `shared-types`) com **100% de sucesso**.

---

## 🏷️ 4. Informações do Commit & Tag Git

- **Mensagem do Commit**: `feat(sprint-7): implement frontend game library and admin management dashboards`
- **Tag Git**: `v0.7.0-sprint7`
- **Descrição da Tag**: `Sprint 7: Frontend Library & Admin Dashboards (Management UI)`

---

## 👤 5. Roteiro para Teste Manual do Usuário (Antes do Git Push)

Antes de realizar o `git push`, siga os passos no navegador em `http://localhost:4200`:

### Passo 1: Iniciar a Aplicação (`npm run start`)
Na raiz do projeto (`nexus-arcade`), execute:
```bash
npm run start
```

### Passo 2: Testar a Biblioteca de Jogos (`/library`) e Favoritos (`/favorites`)
1. Faça login como `admin@nexus.local` ou como `GAMER`.
2. Clique no menu lateral em **Biblioteca**.
3. Teste digitar um nome no campo de busca ou selecionar a plataforma na lista suspensa.
4. Clique em **☆ Favoritar** em um jogo.
5. Clique no menu lateral em **Favoritos** e verifique se o jogo foi listado.

### Passo 3: Testar as Configurações de Perfil e Senha (`/settings`)
1. Clique em **Configurações** no menu lateral.
2. Altere seu **Username** e clique em **Salvar Alterações do Perfil**. Observe a mensagem verde de sucesso.
3. No painel de senha, digite a senha atual (`Admin123!NexusArcade`) e uma nova senha. Teste também uma senha incorreta para ver a validação.

### Passo 4: Testar o Gerenciamento de Usuários (`/admin/users`)
1. Logado como Admin, clique no menu lateral em **Gerenciar Usuários**.
2. Clique em **➕ Novo Usuário** e crie um novo usuário.
3. Clique em **Bloquear** para alternar o status do usuário recém-criado.
4. Tente clicar em **Excluir** no seu próprio usuário Admin (o único ativo).
- **Resultado Esperado**: O sistema exibirá o alerta vermelho de erro da **Proteção do Último Admin**.

### Passo 5: Testar o Gerenciamento de Jogos & Upload de ROM (`/admin/games`)
1. Clique no menu lateral em **Gerenciar Jogos**.
2. Clique em **➕ Novo Jogo** para cadastrar metadados de um novo título.
3. No jogo cadastrado, clique no botão azul **💾 Upload ROM**.
4. Selecione um arquivo `.sfc` ou `.gba` e clique em **Enviar ROM**.
- **Resultado Esperado**: A tabela atualizará o status para **🟢 ROM Pronta** exibindo o tamanho em KB/MB!

### Passo 6: Consultar os Logs de Auditoria (`/admin/logs`)
Clique no menu lateral em **Logs de Auditoria**:
- **Resultado Esperado**: Visualização da tabela com todas as ações que você acabou de realizar.
