# Critérios de Aceite - Sprint 5

**Projeto**: NEXUS ARCADE  
**Sprint**: Sprint 5 - Platforms & Games API + Binary ROM Storage Subsystem  
**Data**: 09/08/2026  
**Status**: 🟢 APROVADO  

---

## 🎯 1. Objetivo do Teste

Validar o módulo de **Catálogo de Plataformas, Jogos e Armazenamento Binário de ROMs** do **NEXUS ARCADE**, cobrindo:
1. CRUD completo de Plataformas (`/platforms`) com controle de códigos únicos (ex: `snes`, `gba`, `nes`) e proteção contra exclusão de plataformas com jogos vinculados.
2. CRUD de Jogos (`/games`) com busca textual, paginação e associação com plataformas.
3. Subsistema de Armazenamento (`StorageService`):
   - Gravando arquivos binários de ROMs em `storage/roms/`.
   - Gravando capas de jogos em `storage/covers/`.
   - Cálculo automatizado de integridade via **hash SHA-256** e contagem do tamanho do arquivo em bytes.
4. Endpoint de Streaming de ROM (`GET /games/:id/rom/stream`) para alimentação direta do emulador WebAssembly no navegador.
5. Suporte a uploads `multipart/form-data` na documentação Swagger UI em `http://localhost:3000/api/docs`.

---

## 📋 2. Critérios de Aceite Definidos

| ID | Requisito / Funcionalidade | Resultado Esperado | Status |
| :--- | :--- | :--- | :---: |
| **AC-01** | **Platforms Management** | `GET /platforms` lista plataformas ativas com total de jogos vinculados. `POST /platforms` permite cadastrar novas plataformas (Exclusivo `ADMIN`). | 🟢 PASS |
| **AC-02** | **Platform Delete Protection** | `DELETE /platforms/:id` impede a exclusão se a plataforma tiver jogos vinculados (`400 Bad Request`). | 🟢 PASS |
| **AC-03** | **Games Catalog Search & Filter** | `GET /games` permite filtrar jogos por termo de busca ou pelo código da plataforma (ex: `platformCode=snes`). | 🟢 PASS |
| **AC-04** | **Binary ROM Upload & SHA-256** | `POST /games/:id/rom` salva a ROM no disco, gera o hash **SHA-256** e atualiza os metadados no banco. | 🟢 PASS |
| **AC-05** | **Game Cover Upload** | `POST /games/:id/cover` salva a imagem de capa em `storage/covers/` e atualiza a URL da capa no banco. | 🟢 PASS |
| **AC-06** | **ROM Binary Streaming** | `GET /games/:id/rom/stream` serve o arquivo binário com cabeçalho `application/octet-stream` para execução no emulador. | 🟢 PASS |

---

## 🧪 3. Validações Executadas

### Testes Automatizados
- [x] Suíte de testes unitários executada com **100% de aprovação (16/16 tests passed)** cobrindo `GamesService`, `PlatformsService`, `UsersService`, `AuthService` e `AppController`.
- [x] `npm run build` compilando os 3 workspaces (`api`, `web`, `shared-types`) sem qualquer erro.

---

## 🏷️ 4. Informações do Commit & Tag Git

- **Mensagem do Commit**: `feat(sprint-5): implement platforms games api and binary rom storage subsystem`
- **Tag Git**: `v0.5.0-sprint5`
- **Descrição da Tag**: `Sprint 5: Platforms & Games API + Binary ROM Storage Subsystem`

---

## 👤 5. Roteiro para Teste Manual do Usuário (Antes do Git Push)

Antes de realizar o `git push`, siga os passos abaixo para testar o cadastro de plataformas, jogos e upload de ROMs no Swagger UI:

### Passo 1: Iniciar a Aplicação (`npm run start`)
Na raiz do projeto (`nexus-arcade`), execute:
```bash
npm run start
```

### Passo 2: Fazer Login como ADMIN no Swagger (`http://localhost:3000/api/docs`)
1. Abra **`http://localhost:3000/api/docs`**.
2. Faça login com o Admin padrão em **`POST /auth/login`**.
3. Copie o `accessToken` e autorize no botão **Authorize** 🔓 no topo.

### Passo 3: Cadastrar uma Nova Plataforma (ex: Game Boy Advance)
1. Expanda **`POST /platforms`** em **Plataformas de Jogos**.
2. Envie o JSON:
```json
{
  "name": "Game Boy Advance",
  "code": "gba",
  "description": "Console portátil de 32-bit da Nintendo."
}
```
3. **Resultado Esperado**: Status **201 Created** com o novo ID da plataforma. Copie o `id`.

### Passo 4: Cadastrar um Jogo para a Nova Plataforma
1. Expanda **`POST /games`** em **Catálogo de Jogos & ROMs**.
2. Envie o JSON:
```json
{
  "title": "Pokémon Emerald Version",
  "description": "RPG clássico de Pokémon no GBA.",
  "platformId": "<id_da_plataforma_gba>",
  "releaseYear": 2004,
  "developer": "Game Freak",
  "publisher": "Nintendo"
}
```
3. **Resultado Esperado**: Status **201 Created**. Copie o `id` do jogo criado.

### Passo 5: Testar Upload de ROM Binária com Cálculo de SHA-256 (`POST /games/{id}/rom`)
1. Expanda **`POST /games/{id}/rom`**.
2. Insira o `id` do jogo.
3. No campo **file**, selecione qualquer arquivo pequeno do seu computador (ex: um arquivo `.gba`, `.sfc` ou `.txt` de teste).
4. Clique em **Execute**.
- **Resultado Esperado**: Status **200 OK**. Observe a resposta JSON contendo:
  - `romStorageKey` (nome do arquivo gerado no servidor)
  - `romSize` (tamanho em bytes)
  - `romHash` (Hash **SHA-256** calculado automaticamente!)

### Passo 6: Testar o Streaming da ROM (`GET /games/{id}/rom/stream`)
Em uma nova aba do navegador, acesse:
```text
http://localhost:3000/games/<id_do_jogo>/rom/stream
```
- **Resultado Esperado**: O navegador iniciará o download/stream do arquivo binário da ROM!
