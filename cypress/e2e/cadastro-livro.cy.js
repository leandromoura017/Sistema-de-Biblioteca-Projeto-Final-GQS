describe('Cadastro de Livro', () => {
  let autorCriado

  before(() => {
    // Criar um autor para usar nos testes
    const autor = {
      nome: 'Machado de Assis',
      email: 'machado@literatura.com',
      dataNascimento: '1839-06-21',
      nacionalidade: 'Brasileira'
    }

    cy.criarAutor(autor).then((response) => {
      autorCriado = response
    })
  })

  beforeEach(() => {
    // Visitar a página de cadastro de livro
    cy.visit('/livros/novo')
  })

  it('deve exibir a página de cadastro de livro corretamente', () => {
    // Verificar se a página carregou corretamente
    cy.contains('Cadastrar Novo Livro').should('be.visible')
    cy.get('#livroForm').should('be.visible')
    
    // Verificar se todos os campos estão presentes
    cy.get('#titulo').should('be.visible')
    cy.get('#isbn').should('be.visible')
    cy.get('#anoPublicacao').should('be.visible')
    cy.get('#genero').should('be.visible')
    cy.get('#numeroPaginas').should('be.visible')
    cy.get('#autorId').should('be.visible')
    cy.get('#submitBtn').should('be.visible').and('contain', 'Cadastrar Livro')
  })

  it('deve carregar autores no select', () => {
    // Verificar se o select de autores foi populado
    cy.get('#autorId option').should('have.length.greaterThan', 1)
    cy.get('#autorId').should('contain', autorCriado.nome)
  })

  it('deve cadastrar um novo livro com autor', () => {
    const livro = {
      titulo: 'Dom Casmurro',
      isbn: '978-85-359-0277-5',
      anoPublicacao: 1899,
      genero: 'Romance',
      numeroPaginas: 256,
      autorId: autorCriado.id
    }

    // Preencher o formulário
    cy.preencherFormularioLivro(livro)

    // Submeter o formulário
    cy.get('#submitBtn').click()

    // Verificar mensagem de sucesso
    cy.get('.alert-success').should('be.visible').and('contain', 'Livro cadastrado com sucesso!')

    // Verificar redirecionamento para lista de livros
    cy.url().should('include', '/livros')
    cy.contains('Lista de Livros').should('be.visible')
    
    // Verificar se o livro aparece na lista
    cy.contains(livro.titulo).should('be.visible')
    cy.contains(livro.isbn).should('be.visible')
    cy.contains(autorCriado.nome).should('be.visible')
  })

  it('deve cadastrar um novo livro sem autor', () => {
    const livro = {
      titulo: 'Livro Independente',
      isbn: '978-3-16-148410-0',
      anoPublicacao: 2023,
      genero: 'Ficção',
      numeroPaginas: 300
    }

    // Preencher formulário sem selecionar autor
    cy.get('#titulo').type(livro.titulo)
    cy.get('#isbn').type(livro.isbn)
    cy.get('#anoPublicacao').type(livro.anoPublicacao.toString())
    cy.get('#genero').select(livro.genero)
    cy.get('#numeroPaginas').type(livro.numeroPaginas.toString())

    // Submeter o formulário
    cy.get('#submitBtn').click()

    // Verificar mensagem de sucesso
    cy.get('.alert-success').should('be.visible').and('contain', 'Livro cadastrado com sucesso!')

    // Verificar redirecionamento
    cy.url().should('include', '/livros')
    cy.contains(livro.titulo).should('be.visible')
  })

  it('deve exibir erro ao tentar cadastrar livro sem campos obrigatórios', () => {
    // Tentar submeter formulário vazio
    cy.get('#submitBtn').click()

    // Verificar que o formulário não foi submetido
    cy.url().should('include', '/livros/novo')
    
    // Verificar validação HTML5 dos campos obrigatórios
    cy.get('#titulo:invalid').should('exist')
    cy.get('#isbn:invalid').should('exist')
    cy.get('#anoPublicacao:invalid').should('exist')
    cy.get('#genero:invalid').should('exist')
    cy.get('#numeroPaginas:invalid').should('exist')
  })

  it('deve exibir erro ao tentar cadastrar livro com ISBN já existente', () => {
    const livroExistente = {
      titulo: 'Primeiro Livro',
      isbn: '978-3-16-148410-1',
      anoPublicacao: 2023,
      genero: 'Ficção',
      numeroPaginas: 300
    }

    const livroDuplicado = {
      titulo: 'Segundo Livro',
      isbn: '978-3-16-148410-1', // Mesmo ISBN
      anoPublicacao: 2022,
      genero: 'Romance',
      numeroPaginas: 250
    }

    // Criar primeiro livro via API
    cy.criarLivro(livroExistente)

    // Tentar cadastrar segundo livro com mesmo ISBN
    cy.preencherFormularioLivro(livroDuplicado)
    cy.get('#submitBtn').click()

    // Verificar mensagem de erro
    cy.get('.alert-danger').should('be.visible').and('contain', 'ISBN já existe')
  })

  it('deve validar ano de publicação', () => {
    const anoAtual = new Date().getFullYear()
    const anoFuturo = anoAtual + 1

    // Tentar inserir ano no futuro
    cy.get('#anoPublicacao').type(anoFuturo.toString())
    cy.get('#titulo').click() // Trigger blur event

    // Verificar validação HTML5
    cy.get('#anoPublicacao:invalid').should('exist')
  })

  it('deve validar número de páginas positivo', () => {
    // Tentar inserir número negativo
    cy.get('#numeroPaginas').type('-10')
    cy.get('#titulo').click() // Trigger blur event

    // Verificar validação HTML5
    cy.get('#numeroPaginas:invalid').should('exist')
  })

  it('deve permitir navegação de volta', () => {
    // Clicar no botão voltar
    cy.contains('Voltar').click()

    // Verificar redirecionamento para página inicial
    cy.url().should('eq', Cypress.config().baseUrl + '/')
    cy.contains('Sistema de Biblioteca').should('be.visible')
  })

  it('deve limpar marcações de erro quando usuário começar a digitar', () => {
    // Submeter formulário vazio para gerar erros
    cy.get('#submitBtn').click()

    // Verificar que há campos inválidos
    cy.get('#titulo:invalid').should('exist')

    // Começar a digitar no campo título
    cy.get('#titulo').type('Teste')

    // Verificar que a marcação de erro foi removida
    cy.get('#titulo:invalid').should('not.exist')
  })

  it('deve desabilitar botão durante submissão', () => {
    const livro = {
      titulo: 'Livro Teste',
      isbn: '978-3-16-148410-2',
      anoPublicacao: 2023,
      genero: 'Ficção',
      numeroPaginas: 300
    }

    cy.preencherFormularioLivro(livro)

    // Interceptar requisição para simular delay
    cy.intercept('POST', '/api/livros', { delay: 1000 }).as('criarLivro')

    cy.get('#submitBtn').click()

    // Verificar que o botão foi desabilitado e mostra loading
    cy.get('#submitBtn').should('be.disabled').and('contain', 'Cadastrando...')

    // Aguardar requisição completar
    cy.wait('@criarLivro')
  })

  it('deve exibir placeholder e texto de ajuda corretos', () => {
    // Verificar placeholder do ISBN
    cy.get('#isbn').should('have.attr', 'placeholder', 'Ex: 978-3-16-148410-0')

    // Verificar texto de ajuda
    cy.contains('ISBN-10 ou ISBN-13').should('be.visible')
    cy.contains('Deixe em branco se o autor não estiver cadastrado').should('be.visible')
  })
})

