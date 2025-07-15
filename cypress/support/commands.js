// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Comando para limpar banco de dados
Cypress.Commands.add('limparBancoDados', () => {
  cy.request('DELETE', '/api/test/limpar-dados').then((response) => {
    expect(response.status).to.eq(200)
  })
})

// Comando para criar autor via API
Cypress.Commands.add('criarAutor', (autor) => {
  return cy.request('POST', '/api/autores', autor).then((response) => {
    expect(response.status).to.eq(201)
    return response.body
  })
})

// Comando para criar livro via API
Cypress.Commands.add('criarLivro', (livro) => {
  return cy.request('POST', '/api/livros', livro).then((response) => {
    expect(response.status).to.eq(201)
    return response.body
  })
})

// Comando para preencher formulário de autor
Cypress.Commands.add('preencherFormularioAutor', (autor) => {
  cy.get('#nome').type(autor.nome)
  cy.get('#email').type(autor.email)
  cy.get('#dataNascimento').type(autor.dataNascimento)
  cy.get('#nacionalidade').select(autor.nacionalidade)
  if (autor.biografia) {
    cy.get('#biografia').type(autor.biografia)
  }
})

// Comando para preencher formulário de livro
Cypress.Commands.add('preencherFormularioLivro', (livro) => {
  cy.get('#titulo').type(livro.titulo)
  cy.get('#isbn').type(livro.isbn)
  cy.get('#anoPublicacao').type(livro.anoPublicacao.toString())
  cy.get('#genero').select(livro.genero)
  cy.get('#numeroPaginas').type(livro.numeroPaginas.toString())
  if (livro.autorId) {
    cy.get('#autorId').select(livro.autorId.toString())
  }
})

// Comando para aguardar carregamento
Cypress.Commands.add('aguardarCarregamento', () => {
  cy.get('#loadingSpinner').should('not.exist')
})

