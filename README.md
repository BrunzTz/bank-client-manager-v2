# Bank Client Manager v2

Sistema de gerenciamento de clientes bancarios com arquitetura de micro frontends usando Angular + Native Federation.

## Visao Geral

Este repositorio contem a versao atual do projeto em `bank-client-manager-v2`.

- Shell de autenticacao e orquestracao dos MFEs
- MFE de consulta de clientes
- MFE de gerenciamento (criar, editar, excluir)
- Mock API local em Node.js/Express

No workspace tambem existe uma pasta legado chamada `bank-client-manager`, mas o fluxo principal de desenvolvimento esta em `bank-client-manager-v2`.

## Arquitetura Atual

```
Shell (4200)
  |- carrega MFE Consulta (4201) -> exposto como ./ClientList
  |- carrega MFE Gerenciamento (4202) -> exposto como ./ClientManagementPage
  '- integra com Mock API (3000)
```

## Estrutura do Projeto (v2)

```
bank-client-manager-v2/
├── angular.json
├── package.json
└── projects/
    ├── shell/
    ├── mfe-clientes/
    ├── mfe-gerenciamento/
    └── mock-api/
```

## Stack Tecnica

- Angular 21
- Native Federation (`@angular-architects/native-federation`)
- PrimeNG 21 + PrimeIcons + tema Aura (`@primeuix/themes`)
- RxJS
- ngx-mask
- Node.js + Express (mock-api)

## Aplicacoes e Portas

1. Shell
- Caminho: `projects/shell`
- Porta: `4200`
- Responsavel por login, layout e carregamento dinamico dos MFEs

2. MFE Clientes (Consulta)
- Caminho: `projects/mfe-clientes`
- Porta: `4201`
- Expose federation: `./ClientList`

3. MFE Gerenciamento
- Caminho: `projects/mfe-gerenciamento`
- Porta: `4202`
- Expose federation: `./ClientManagementPage`

4. Mock API
- Caminho: `projects/mock-api`
- Porta: `3000`
- Endpoint base: `http://localhost:3000/api/clients`

## Scripts Principais

Na raiz `bank-client-manager-v2/`:

```bash
npm run start                 # ng serve shell
npm run start:shell           # shell (4200)
npm run start:mfe-clientes    # mfe-clientes (4201)
npm run start:mfe-gerenciamento # mfe-gerenciamento (4202)
```

No `projects/mock-api/`:

```bash
npm run start                 # nodemon ./app/server.js
```

## Testes (Jest)

Na raiz `bank-client-manager-v2/`:

```bash
# executa todos os testes unitarios
npm test

# modo watch
npm run test:watch

# gera relatorio de cobertura
npm run test:coverage

# runner nativo do Angular (alternativo)
npm run test:ng
```

### Relatorio de Cobertura

Depois de rodar `npm run test:coverage`, abra:

- `coverage/lcov-report/index.html`

Arquivos uteis para integracao com CI:

- `coverage/lcov.info`
- `coverage/coverage-final.json`

## Quick Start

### Pre-requisitos

- Node.js 18+
- npm 9+

### Instalacao

```bash
# 1) Instalar dependencias do workspace Angular
cd bank-client-manager-v2
npm install

# 2) Instalar dependencias da mock-api
cd projects/mock-api
npm install
```

### Executar em Desenvolvimento

Use 4 terminais:

```bash
# Terminal 1 - Mock API
cd bank-client-manager-v2/projects/mock-api
npm run start

# Terminal 2 - MFE Consulta
cd bank-client-manager-v2
npm run start:mfe-clientes

# Terminal 3 - MFE Gerenciamento
cd bank-client-manager-v2
npm run start:mfe-gerenciamento

# Terminal 4 - Shell
cd bank-client-manager-v2
npm run start:shell
```

Abrir: `http://localhost:4200`

## Endpoints da Mock API

- `GET /api/clients`
- `GET /api/clients/:id`
- `POST /api/clients`
- `PUT /api/clients/:id`
- `DELETE /api/clients/:id`

## Build

```bash
cd bank-client-manager-v2

# builds individuais
npx ng build shell
npx ng build mfe-clientes
npx ng build mfe-gerenciamento
```

## Comunicacao entre Shell e MFEs

- O Shell carrega os componentes remotos via `MicroFrontendService`.
- Acoes de navegacao de cliente (create/edit/delete/query) sao propagadas por evento global `client-management-action`.

## Licenca

ISC