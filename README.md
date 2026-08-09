# 🎮 NEXUS ARCADE

> **Your games. Your library. Your world.**
> 
> *Desenvolvido por **Dev Rafael Ribeiro** como um projeto de demonstração de Arquitetura Full Stack High Performance para Portfólio.*

---

## 🎯 Objetivo & Visão Geral do Projeto

O **Nexus Arcade** é um **Hub Centralizado de Jogos Retro Online na Nuvem**.

Diferente de emuladores tradicionais ou aplicativos desktop que exigem que cada usuário baixe softwares, instale plugins ou faça dumps manuais de arquivos binários no seu computador, o **Nexus Arcade roda 100% online no navegador web**:

1. **Sem Downloads ou Instalação**: O usuário simplesmente acessa o portal, escolhe qualquer jogo disponível no catálogo e joga instantaneamente com 1 clique.
2. **Emulação de Alta Performance com WebAssembly**: A emulação dos consoles (SNES, NES, GBA, Mega Drive, Game Boy) é processada no navegador através dos motores WebAssembly (cores do EmulatorJS / RetroArch).
3. **Save States na Nuvem**: O progresso é salvo no banco PostgreSQL em tempo real e pode ser retomado em qualquer dispositivo.
4. **Suporte Nativo a Gamepads Físicos**: Integração direta com a **Gamepad API** do navegador para reconhecer controles de Xbox, PlayStation, Nintendo Switch Pro ou USB genérico sem configurações.
5. **Gestão Centralizada (Conta Admin)**: Administradores gerenciam a plataforma, cadastram novos consoles, sobem jogos, editam metadados e gerenciam permissões de usuários.

---

## 🔒 Arquitetura de Segurança & Proteção de Dados

A plataforma implementa práticas de segurança de nível corporativo:

- **Tokens JWT de 8 Horas (`8h`)**: Sessão contínua de trabalho e gameplay com renovação via Refresh Token.
- **Proteção contra Força Bruta & Rate Limiting (`@nestjs/throttler`)**: Limite de 100 requisições por minuto por IP para prevenir ataques de força bruta.
- **Mensageria Segura Anti-Enumeração**: Mensagens padronizadas (*"Usuário ou senha incorretos."*) que não revelam a existência prévia do e-mail no banco de dados.
- **Detecção & Mensageria de Conta Bloqueada**: Alerta explicito e bloqueio imediato (*"Esta conta de usuário foi bloqueada por um Administrador. Entre em contato com o suporte."*).
- **Redefinição Segura de Senha**: Endpoints `POST /auth/forgot-password` e `POST /auth/reset-password` com tokens assinados digitalmente e expiração de 15 minutos.
- **Criptografia de Senhas com Argon2id**: Senhas armazenadas com o algoritmo Argon2id resistente a GPU e ataques Rainbow Table.
- **Cabeçalhos de Segurança HTTP & HTTPS (`Helmet + HSTS`)**: Inclusão de `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` para forçar tráfego criptografado HTTPS.

---

## ⚡ Princípio Fundamental: One Command Development

> **"Clone, install, start and develop."**

Um único comando orquestra o banco PostgreSQL no Docker, executa migrations, roda os seeds idempotentes do Prisma e inicia a API NestJS e o app Angular 21:

```bash
git clone https://github.com/Rafaelusa/nexus-arcade.git
cd nexus-arcade
npm install
npm run start
```

### 📍 Serviços Disponíveis

| Serviço | URL / Endereço | Descrição |
| :--- | :--- | :--- |
| **Frontend Angular 21** | `http://localhost:4200` | App Cyberpunk com Lazy Loading e Gamepad API |
| **Backend NestJS API** | `http://localhost:3000` | API RESTful com RBAC, Rate Limit, JWT 8h e Argon2id |
| **API Docs (Swagger)** | `http://localhost:3000/api/docs` | Documentação interativa da API (OpenAPI) |
| **PostgreSQL Database** | `localhost:5432` | Banco de dados relacional no Docker Compose |

---

## 🛡️ Matriz de Permissões (RBAC)

| Recurso / Funcionalidade | GAMER | ADMIN |
| :--- | :---: | :---: |
| Visualizar Dashboard & Consoles Ativos | ✅ | ✅ |
| Buscar & Filtrar Jogos por Plataforma | ✅ | ✅ |
| Executar Jogos no Navegador (WebAssembly) | ✅ | ✅ |
| Conectar Controles Físicos (Gamepad API no Header) | ✅ | ✅ |
| Gerenciar Save States (Nuvem PostgreSQL) | ✅ | ✅ |
| Favoritar Jogos & Histórico de Partidas | ✅ | ✅ |
| Gerenciar Perfil Pessoal & Troca de Senha | ✅ | ✅ |
| **Gerenciar Usuários (Listar, Bloquear, Excluir)** | ❌ | ✅ |
| **Gerenciar Metadados dos Jogos (Criar, Editar, Excluir)** | ❌ | ✅ |
| **Upload de Capas via Link/Arquivo e ROMs (SHA-256)** | ❌ | ✅ |
| **Gerenciar Plataformas (Criar, Editar informações, Ativar/Desativar)** | ❌ | ✅ |
| **Logs de Auditoria do Sistema** | ❌ | ✅ |

---

## 🛠️ Stack Tecnológica

### Frontend
- **Framework**: Angular 21 (Signals, Standalone Components, Control Flow)
- **Performance**: Lazy Loading de Rotas (`loadComponent`) dividindo a aplicação em chunks sob demanda (Redução do bundle inicial para 283 kB)
- **Estilização**: CSS Vanilla com Tokens de Design Cyberpunk / Dark Glassmorphism
- **Hardware Integration**: Web Gamepad API (Badge no topo do cabeçalho com detecção dinâmica de Xbox, PlayStation, Switch Pro e Gamepads genéricos)

### Backend
- **Framework**: NestJS 11 (TypeScript)
- **ORM & Database**: Prisma ORM 6 + PostgreSQL 16
- **Segurança**: JWT (Expiração de 8h), Argon2id, NestJS Throttler Rate Limiting, Helmet com HSTS HTTPS, Validação DTO com Class-Validator
- **Documentação**: OpenAPI / Swagger UI
- **Armazenamento Binário**: Hash Verification SHA-256 & ROM Streaming (Body Parser 50MB)

---

## 📜 Licença & Autoria

Projeto concebido e desenvolvido por **Dev Rafael Ribeiro** para fins de portfólio de arquitetura de software e engenharia Full Stack.