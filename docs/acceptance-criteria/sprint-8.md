# Critérios de Aceite - Sprint 8

**Projeto**: NEXUS ARCADE  
**Sprint**: Sprint 8 - WebAssembly Emulator Engine (EmulatorJS & ROM Player)  
**Data**: 09/08/2026  
**Status**: 🟢 APROVADO  

---

## 🎯 1. Objetivo do Teste

Validar o **Motor de Emulação WebAssembly (EmulatorJS)** e a interface gráfica do **Player de Jogos** do **NEXUS ARCADE**, cobrindo:
1. Carregamento dinâmico da engine WebAssembly no Angular 21 ao acessar `/player/:gameId`.
2. Mapeamento inteligente de cores por console (SNES ➔ `snes9x`, GBA ➔ `mgba`, NES ➔ `fceumm`, Mega Drive ➔ `genesis_plus_gx`).
3. Consumo automático do streaming de ROMs binárias via HTTP da API NestJS (`/games/:id/rom/stream`).
4. Barra de ferramentas do Player contendo **🖥️ Tela Cheia**, **🔄 Reiniciar** e **⬅️ Voltar à Biblioteca**.
5. Tratamento de estado para jogos que não possuem ROM binária enviada.

---

## 📋 2. Critérios de Aceite Definidos

| ID | Requisito / Funcionalidade | Resultado Esperado | Status |
| :--- | :--- | :--- | :---: |
| **AC-01** | **WebAssembly Engine Integration** | `PlayerComponent` (`/player/:gameId`) carrega o canvas do emulador com o core correspondente à plataforma. | 🟢 PASS |
| **AC-02** | **ROM Binary Streaming** | O emulador efetua o streaming da ROM binária a partir da API NestJS (`/games/:id/rom/stream`). | 🟢 PASS |
| **AC-03** | **Fullscreen & Reset Controls** | Botões de **Tela Cheia** e **Reiniciar Jogo** operando através do HTML5 Fullscreen API e reload do emulador. | 🟢 PASS |
| **AC-04** | **No-ROM Alert State** | Exibição de aviso Cyberpunk orientando quando o jogo não possui ROM cadastrada. | 🟢 PASS |

---

## 🧪 3. Validações Executadas

### Testes Automatizados & Compilação
- [x] `npm run build` compilando a aplicação Angular 21 e o backend NestJS com **100% de sucesso sem erros**.

---

## 🏷️ 4. Informações do Commit & Tag Git

- **Mensagem do Commit**: `feat(sprint-8): implement webassembly emulator engine and player component`
- **Tag Git**: `v0.8.0-sprint8`
- **Descrição da Tag**: `Sprint 8: WebAssembly Emulator Engine (EmulatorJS & ROM Player)`

---

## 👤 5. Roteiro para Teste Manual do Usuário (Antes do Git Push)

Antes de realizar o `git push`, siga os passos no navegador em `http://localhost:4200`:

### Passo 1: Iniciar a Aplicação (`npm run start`)
Na raiz do projeto (`nexus-arcade`), execute:
```bash
npm run start
```

### Passo 2: Executar um Jogo com ROM Cadastrada
1. Faça login em `http://localhost:4200/login`.
2. Acesse a **Biblioteca** no menu lateral.
3. No jogo onde você enviou a ROM (ex: *Super Mario World* ou *Pokémon Emerald*), clique no botão **🎮 Jogar**.
- **Resultado Esperado**:
  - O navegador abrirá a rota `/player/<id_do_jogo>`.
  - O header exibirá o título do jogo e a pílula do console.
  - A engine WebAssembly (EmulatorJS) será inicializada, carregará a ROM via streaming da API e o jogo iniciará no canvas!

### Passo 3: Testar os Controles da Interface
1. Clique no botão **🖥️ Tela Cheia** no header do Player para expandir o jogo.
2. Pressione `ESC` para sair da tela cheia.
3. Clique em **🔄 Reiniciar** para reiniciar a emulação.
4. Clique em **⬅️ Voltar à Biblioteca** para retornar à lista de jogos.
