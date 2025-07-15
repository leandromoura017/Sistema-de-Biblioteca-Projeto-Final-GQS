# Sistema de Biblioteca - Projeto Final

Este projeto implementa um sistema de biblioteca com arquitetura MVC, desenvolvido como projeto final da disciplina de Gestão da Qualidade de Software (GQS). O sistema permite o cadastro e gerenciamento de livros e autores, com uma API RESTful completa e testes automatizados.

## Características do Projeto

- **Arquitetura MVC** (Model-View-Controller)
- **API RESTful** com operações CRUD completas
- **Banco de dados SQLite** para persistência
- **Interface web responsiva** com Bootstrap
- **Testes unitários e de integração** com Jest e Supertest
- **Testes E2E** com Cypress
- **Validação de dados** tanto no frontend quanto no backend

## Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Sequelize** - ORM para banco de dados
- **SQLite** - Banco de dados
- **EJS** - Template engine

### Frontend
- **HTML5/CSS3** - Estrutura e estilo
- **Bootstrap 5** - Framework CSS
- **JavaScript ES6+** - Interatividade
- **Font Awesome** - Ícones

### Testes
- **Jest** - Framework de testes unitários
- **Supertest** - Testes de API
- **Cypress** - Testes E2E

## Estrutura do Projeto

```
projeto-final/
├── src/
│   ├── controllers/          # Controladores (lógica de negócio)
│   │   ├── autorController.js
│   │   └── livroController.js
│   ├── models/              # Modelos de dados
│   │   ├── Autor.js
│   │   ├── Livro.js
│   │   └── index.js
│   ├── routes/              # Rotas da API
│   │   ├── autorRoutes.js
│   │   └── livroRoutes.js
│   ├── views/               # Templates EJS
│   │   ├── autores/
│   │   ├── livros/
│   │   ├── index.ejs
│   │   └── layout.ejs
│   ├── public/              # Arquivos estáticos
│   │   └── js/
│   └── database/            # Configuração do banco
│       └── database.js
├── tests/                   # Testes automatizados
│   ├── unit/               # Testes unitários
│   ├── integration/        # Testes de integração
│   └── setup.js
├── cypress/                 # Testes E2E
│   ├── e2e/
│   ├── support/
│   └── fixtures/
├── app.js                   # Arquivo principal
├── package.json
├── cypress.config.js
├── jest.config.js
└── README.md
```

## Instalação e Configuração

### Pré-requisitos
- Node.js (versão 14 ou superior)
- npm (gerenciador de pacotes)

### Passos para instalação

1. **Instale as dependências**
   ```bash
   npm install
   ```

2. **Configure o banco de dados**
   O banco SQLite será criado automaticamente na primeira execução.

## Como Executar o Projeto

### Executar em modo de desenvolvimento
```bash
npm run dev
```

### Executar em modo de produção
```bash
npm start
```

O servidor será iniciado na porta 3000. Acesse: http://localhost:3000

## Como Executar os Testes

### Testes Unitários e de Integração
```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch

# Executar testes com coverage
npm run test:coverage
```

### Testes E2E com Cypress

**Importante**: Para executar os testes E2E, o servidor deve estar rodando.

1. **Inicie o servidor** (em um terminal separado):
   ```bash
   npm start
   ```

2. **Execute os testes Cypress**:
   ```bash
   # Modo interativo (abre interface do Cypress)
   npm run cypress:open

   # Modo headless (execução em linha de comando)
   npm run cypress:run
   ```

## Funcionalidades Implementadas

### Entidades
1. **Autor**
   - Nome (obrigatório)
   - Email (obrigatório, único)
   - Data de nascimento (obrigatório)
   - Nacionalidade (obrigatório)
   - Biografia (opcional)

2. **Livro**
   - Título (obrigatório)
   - ISBN (obrigatório, único)
   - Ano de publicação (obrigatório)
   - Gênero (obrigatório)
   - Número de páginas (obrigatório)
   - Autor (opcional, relacionamento)


---

**Projeto Final da disciplina de Gestão da Qualidade de Software**