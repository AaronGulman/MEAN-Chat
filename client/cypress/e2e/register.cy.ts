describe('Register Page E2E Tests', () => {
    beforeEach(() => {
      cy.visit('/register');
    });
  
    it('should display the registration form', () => {
      cy.contains('h2', 'Register');
      cy.get('input#username').should('exist');
      cy.get('input#email').should('exist');
      cy.get('input#password').should('exist');
      cy.get('button[type="submit"]').contains('Register');
    });
  
    it('should successfully register with valid inputs', () => {
      cy.get('input#username').type('newUser'+new Date().toDateString());
      cy.get('input#email').type('newUser@example.com');
      cy.get('input#password').type('password123');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/login');
    });
  
    it('should show an error for invalid email', () => {
      cy.get('input#username').type('newUser');
      cy.get('input#email').type('invalid-email');
      cy.get('input#password').type('password123');
      cy.get('button[type="submit"]').click();
      cy.contains('Please enter a valid email address');
    });
  
    it('should show required field errors', () => {
      cy.get('button[type="submit"]').click();
      cy.contains('Username is required');
      cy.contains('Email is required');
      cy.contains('Password is required');
    });
  });
  