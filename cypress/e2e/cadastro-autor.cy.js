describe('Cadastro de Autor', () => {
  beforeEach(() => {
    // Visitar a página de cadastro de autor
    cy.visit('/autores/novo')
  })

  it('deve exibir a página de cadastro de autor corretamente', () => {
    // Verificar se a página carregou corretamente
    cy.contains('Cadastrar Novo Autor').should('be.visible')
    cy.get('#autorForm').should('be.visible')
    
    // Verificar se todos os campos estão presentes
    cy.get('#nome').should('be.visible')
    cy.get('#email').should('be.visible')
    cy.get('#dataNascimento').should('be.visible')
    cy.get('#nacionalidade').should('be.visible')
    cy.get('#biografia').should('be.visible')
    cy.get('#submitBtn').should('be.visible').and('contain', 'Cadastrar Autor')
  })

  it('deve cadastrar um novo autor com sucesso', () => {
    const autor = {
      nome: 'Clarice Lispector',
      email: 'clarice@literatura.com',
      dataNascimento: '1920-12-10',
      nacionalidade: 'Brasileira',
      biografia: 'Escritora e jornalista brasileira nascida na Ucrânia.'
    }

    // Preencher o formulário
    cy.preencherFormularioAutor(autor)

    // Submeter o formulário
    cy.get('#submitBtn').click()

    // Verificar mensagem de sucesso
    cy.get('.alert-success').should('be.visible').and('contain', 'Autor cadastrado com sucesso!')

    // Verificar redirecionamento para lista de autores
    cy.url().should('include', '/autores')
    cy.contains('Lista de Autores').should('be.visible')
    
    // Verificar se o autor aparece na lista
    cy.contains(autor.nome).should('be.visible')
    cy.contains(autor.email).should('be.visible')
  })

  it('deve exibir erro ao tentar cadastrar autor sem campos obrigatórios', () => {
    // Tentar submeter formulário vazio
    cy.get('#submitBtn').click()

    // Verificar que o formulário não foi submetido (ainda na mesma página)
    cy.url().should('include', '/autores/novo')
    
    // Verificar validação HTML5 dos campos obrigatórios
    cy.get('#nome:invalid').should('exist')
    cy.get('#email:invalid').should('exist')
    cy.get('#dataNascimento:invalid').should('exist')
    cy.get('#nacionalidade:invalid').should('exist')
  })

  it('deve exibir erro ao tentar cadastrar autor com email inválido', () => {
    const autorEmailInvalido = {
      nome: 'Autor Teste',
      email: 'email-invalido',
      dataNascimento: '1980-01-01',
      nacionalidade: 'Brasileira'
    }

    // Preencher formulário com email inválido
    cy.preencherFormularioAutor(autorEmailInvalido)

    // Submeter o formulário
    cy.get('#submitBtn').click()

    // Verificar mensagem de erro
    cy.get('.alert-danger').should('be.visible').and('contain', 'Dados inválidos')
  })

  it('deve exibir erro ao tentar cadastrar autor com email já existente', () => {
    const autorExistente = {
      nome: 'Primeiro Autor',
      email: 'mesmo@email.com',
      dataNascimento: '1980-01-01',
      nacionalidade: 'Brasileira'
    }

    const autorDuplicado = {
      nome: 'Segundo Autor',
      email: 'mesmo@email.com', // Mesmo email
      dataNascimento: '1985-01-01',
      nacionalidade: 'Portuguesa'
    }

    // Criar primeiro autor via API
    cy.criarAutor(autorExistente)

    // Tentar cadastrar segundo autor com mesmo email
    cy.preencherFormularioAutor(autorDuplicado)
    cy.get('#submitBtn').click()

    // Verificar mensagem de erro
    cy.get('.alert-danger').should('be.visible').and('contain', 'Email já existe')
  })

  it('deve validar contador de caracteres da biografia', () => {
    const biografiaLonga = 'A'.repeat(1001) // 1001 caracteres

    cy.get('#biografia').type(biografiaLonga)

    // Verificar que o texto foi truncado para 1000 caracteres
    cy.get('#biografia').should('have.value', 'A'.repeat(1000))
    
    // Verificar mensagem de limite atingido
    cy.get('.form-text').should('contain', 'Máximo de 1000 caracteres atingido')
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
    cy.get('#nome:invalid').should('exist')

    // Começar a digitar no campo nome
    cy.get('#nome').type('Teste')

    // Verificar que a marcação de erro foi removida
    cy.get('#nome:invalid').should('not.exist')
  })

  it('deve desabilitar botão durante submissão', () => {
    const autor = {
      nome: 'Autor Teste',
      email: 'teste@exemplo.com',
      dataNascimento: '1980-01-01',
      nacionalidade: 'Brasileira'
    }

    cy.preencherFormularioAutor(autor)

    // Interceptar requisição para simular delay
    cy.intercept('POST', '/api/autores', { delay: 1000 }).as('criarAutor')

    cy.get('#submitBtn').click()

    // Verificar que o botão foi desabilitado e mostra loading
    cy.get('#submitBtn').should('be.disabled').and('contain', 'Cadastrando...')

    // Aguardar requisição completar
    cy.wait('@criarAutor')
  })
})

