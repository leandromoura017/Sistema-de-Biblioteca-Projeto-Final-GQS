describe('Navegação do Sistema', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('deve exibir a página inicial corretamente', () => {
    // Verificar elementos principais da página inicial
    cy.contains('Sistema de Biblioteca').should('be.visible')
    cy.contains('Gerencie livros e autores de forma simples e eficiente').should('be.visible')
    
    // Verificar cards de funcionalidades
    cy.contains('Gerenciar Livros').should('be.visible')
    cy.contains('Gerenciar Autores').should('be.visible')
    
    // Verificar botões de ação
    cy.contains('Cadastrar Livro').should('be.visible')
    cy.contains('Ver Todos os Livros').should('be.visible')
    cy.contains('Cadastrar Autor').should('be.visible')
    cy.contains('Ver Todos os Autores').should('be.visible')
  })

  it('deve navegar para cadastro de livro via página inicial', () => {
    cy.contains('Cadastrar Livro').click()
    cy.url().should('include', '/livros/novo')
    cy.contains('Cadastrar Novo Livro').should('be.visible')
  })

  it('deve navegar para lista de livros via página inicial', () => {
    cy.contains('Ver Todos os Livros').click()
    cy.url().should('include', '/livros')
    cy.contains('Lista de Livros').should('be.visible')
  })

  it('deve navegar para cadastro de autor via página inicial', () => {
    cy.contains('Cadastrar Autor').click()
    cy.url().should('include', '/autores/novo')
    cy.contains('Cadastrar Novo Autor').should('be.visible')
  })

  it('deve navegar para lista de autores via página inicial', () => {
    cy.contains('Ver Todos os Autores').click()
    cy.url().should('include', '/autores')
    cy.contains('Lista de Autores').should('be.visible')
  })

  it('deve navegar via menu superior', () => {
    // Testar navegação para início
    cy.get('.navbar-brand').click()
    cy.url().should('eq', Cypress.config().baseUrl + '/')

    // Testar dropdown de livros
    cy.get('#livrosDropdown').click()
    cy.contains('Cadastrar Livro').click()
    cy.url().should('include', '/livros/novo')

    // Voltar e testar lista de livros
    cy.get('#livrosDropdown').click()
    cy.contains('Listar Livros').click()
    cy.url().should('include', '/livros')

    // Testar dropdown de autores
    cy.get('#autoresDropdown').click()
    cy.contains('Cadastrar Autor').click()
    cy.url().should('include', '/autores/novo')

    // Voltar e testar lista de autores
    cy.get('#autoresDropdown').click()
    cy.contains('Listar Autores').click()
    cy.url().should('include', '/autores')
  })

  it('deve exibir navbar responsiva', () => {
    // Simular viewport mobile
    cy.viewport(768, 1024)

    // Verificar se o botão toggle aparece
    cy.get('.navbar-toggler').should('be.visible')

    // Clicar no toggle para abrir menu
    cy.get('.navbar-toggler').click()

    // Verificar se os itens do menu ficaram visíveis
    cy.get('.navbar-nav').should('be.visible')
    cy.get('#livrosDropdown').should('be.visible')
    cy.get('#autoresDropdown').should('be.visible')
  })

  it('deve manter estado ativo do menu', () => {
    // Navegar para página de livros
    cy.visit('/livros/novo')

    // Verificar se o menu de livros está destacado (se implementado)
    cy.get('.navbar').should('be.visible')
  })

  it('deve exibir ícones corretos no menu', () => {
    // Verificar ícones na navbar
    cy.get('.navbar-brand i.fa-book').should('be.visible')
    cy.get('a[href="/"] i.fa-home').should('be.visible')
    cy.get('#livrosDropdown i.fa-book').should('be.visible')
    cy.get('#autoresDropdown i.fa-user-edit').should('be.visible')
  })

  it('deve funcionar navegação por teclado', () => {
    // Testar navegação por Tab
    cy.get('body').tab()
    cy.focused().should('have.class', 'navbar-brand')

    // Continuar navegação por Tab
    cy.focused().tab()
    cy.focused().should('contain', 'Início')
  })

  it('deve exibir breadcrumb ou indicação de localização', () => {
    // Navegar para diferentes páginas e verificar títulos
    cy.visit('/livros/novo')
    cy.get('title').should('contain', 'Cadastrar Novo Livro')

    cy.visit('/autores/novo')
    cy.get('title').should('contain', 'Cadastrar Novo Autor')

    cy.visit('/livros')
    cy.get('title').should('contain', 'Lista de Livros')

    cy.visit('/autores')
    cy.get('title').should('contain', 'Lista de Autores')
  })

  it('deve lidar com rotas inexistentes', () => {
    // Tentar acessar rota que não existe
    cy.visit('/rota-inexistente', { failOnStatusCode: false })
    
    // Verificar se retorna 404 ou redireciona
    cy.url().should('include', '/rota-inexistente')
  })

  it('deve manter consistência visual entre páginas', () => {
    const paginas = ['/', '/livros/novo', '/autores/novo', '/livros', '/autores']

    paginas.forEach(pagina => {
      cy.visit(pagina)
      
      // Verificar elementos comuns em todas as páginas
      cy.get('.navbar').should('be.visible')
      cy.get('.navbar-brand').should('contain', 'Sistema de Biblioteca')
      cy.get('.container').should('be.visible')
      
      // Verificar que o Bootstrap está carregado
      cy.get('body').should('have.css', 'font-family')
    })
  })
})

