describe('Login Page E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should display the login form', () => {
    cy.contains('h2', 'Login');
    cy.get('input#username').should('exist');
    cy.get('input#password').should('exist');
    cy.get('button[type="submit"]').contains('Login');
  });

  it('should successfully log in with valid credentials', () => {
    cy.get('input#username').type('super');
    cy.get('input#password').type('123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('should show an error message with invalid credentials', () => {
    cy.get('input#username').type('invalidUser');
    cy.get('input#password').type('wrongPassword');
    cy.get('button[type="submit"]').click();
    cy.on('window:alert', (text) => {
      expect(text).to.contains('Login failed. Please check your credentials and try again.');
    });
  });

  it('should show an error when server fails', () => {
    cy.get('input#username').type('serverErrorUser');
    cy.get('input#password').type('anyPassword');
    cy.get('button[type="submit"]').click();
    cy.on('window:alert', (text) => {
      expect(text).to.contains('Error occured during login');
    });
  });
});
