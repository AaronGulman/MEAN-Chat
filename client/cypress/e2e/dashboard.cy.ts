describe('Dashboard Page E2E Tests', () => {
    beforeEach(() => {
      cy.visit('/login');
      cy.get('input#username').type('super');
      cy.get('input#password').type('123');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
      cy.visit('/dashboard');
    });
  
    it('should display the dashboard with welcome message', () => {
      cy.contains('h1', 'Welcome, super');
    });
  
    it('should display sidebar navigation items', () => {
      cy.get('.sidebar-content').within(() => {
        cy.contains('Groups');
        cy.contains('Settings');
        cy.contains('Users');
      });
    });
  
    it('should navigate to Settings page and update user information', () => {
      cy.contains('Settings').click();
      cy.contains('User Settings').should('be.visible');
      cy.get('input#email').clear().type('newuser@example.com');
      cy.get('button[type="submit"]').contains('Update Details').click();
      cy.on('window:alert', (alertText) => {
        expect(alertText).to.equal("Details Updated");
      });
    });
  
    it('should open Register for New Groups modal and close it', () => {
      cy.contains('Groups').click();
      cy.get('.card-title').contains('Register for New Groups').click();
      cy.get('#registerGroupModal').should('be.visible');
  
    });
  
    it('should open Create New Group modal and close it', () => {
      cy.contains('Groups').click();
      cy.get('.card-title').contains('Create New Group').click();
      cy.get('#createGroupModal').should('be.visible');
  
      cy.get('input#groupName').type('New Group Name');
      cy.get('textarea#groupDescription').type('This is a new group description.');
  
    });
  
    it('should navigate to Groups page and interact with group cards', () => {
      cy.contains('Groups').click();
      cy.contains('Groups');
      cy.get('.card').first().should('be.visible').click();
      cy.contains('Group Role:');
    });
  
    it('should navigate to Users page and interact with user management actions', () => {
      cy.contains('Users').click();
      cy.contains('Users List').should('be.visible');
      it('should navigate to Users page and interact with user management actions', () => {
        cy.contains('Users').click();
        cy.contains('Users List').should('be.visible');
      
        cy.get('.list-group-item').each(($el) => {
          cy.wrap($el).find('button').contains('Promote').then(($btn) => {
            if ($btn.length > 0) {
              cy.wrap($btn).click();
            }
          });
      
          cy.wrap($el).find('button').contains('Demote').then(($btn) => {
            if ($btn.length > 0) {
              cy.wrap($btn).click();
            }
          });
      
          cy.wrap($el).find('button').contains('Delete').then(($btn) => {
            if ($btn.length > 0) {
              cy.wrap($btn).click();
            }
          });
        });
      });
      
    });
  
    it('should log out when logout button is clicked', () => {
      cy.get('.btn-danger').contains('Logout').should('be.visible').click();
      cy.url().should('include', '/login');
    });
  
    it('should open and close pending group overlay', () => {
      cy.contains('Groups').click();
      cy.get('.card-overlay').first().should('be.visible').click();
      cy.get('.card-overlay').should('be.visible');
    });
  
    // it('should delete account from settings page', () => {
    //   cy.contains('Settings').click();
    //   cy.get('button').contains('Delete Account').should('be.visible').click();
    //   cy.on('window:confirm', () => true);
    //   cy.url().should('include', '/login');
    // });
  });
  