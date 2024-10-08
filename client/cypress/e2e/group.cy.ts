describe('Group Component Tests - Superuser', () => {
    before(() => {
        cy.visit('/register');
        cy.get('input#username').type('newUser');
        cy.get('input#email').type('newUser@example.com');
        cy.get('input#password').type('password123');
        cy.get('button[type="submit"]').click();
        cy.visit('/login');
        cy.get('input[name="username"]').type('newUser');
        cy.get('input[name="password"]').type('password123');
        cy.get('button[type="submit"]').click();
        cy.url().should('include', '/dashboard');
    })
    beforeEach(() => {
      cy.visit('/login');
      cy.get('input[name="username"]').type('super');
      cy.get('input[name="password"]').type('123');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });
  
    it('Superuser - Create a New Group', () => {
      cy.contains('Groups').click();
      cy.contains('Create New Group').click();
      cy.get('input[name="groupName"]').type('Super Group');
      cy.get('textarea[name="groupDescription"]').type('Group created by superadmin for testing.');
      cy.get('textarea[name="groupDescription"]').type('Group created by superadmin for testing.');
      cy.get('textarea[name="groupDescription"]').type('Group created by superadmin for testing.');
      cy.get('button[type="submit"]').click();
      cy.contains('Super Group').should('exist');
    });
  
    it('Superuser - Add/Remove Users from Group', () => {
        cy.contains('Groups').click();
        cy.contains('Super Group').click();
        cy.contains('Users').click();
      
        cy.contains('Available Users').parent().find('.list-group-item').then(($members) => {
          const initialMemberCount = $members.length;
      
          cy.get('button').contains('Add').first().click();
      
          cy.contains('Available Users').parent().find('.list-group-item').should(($membersAfter) => {
            const newMemberCount = $membersAfter.length;
            expect(newMemberCount).to.equal(initialMemberCount - 1);
          });
      
          cy.get('button').contains('Remove').first().click();
      
          cy.contains('Available Users').parent().find('.list-group-item').should(($membersAfterRemoval) => {
            const finalMemberCount = $membersAfterRemoval.length;
            expect(finalMemberCount).to.equal(initialMemberCount);
          });
        });
      });
      
      
      
      it('Superuser - Ban and Unban Users in Group', () => {
        cy.contains('Groups').click();
        cy.contains('Super Group').click();
        cy.contains('Users').click();
        cy.get('button').contains('Add').first().click();
        cy.contains('Members').parent().find('.list-group-item').then(($members) => {
          const initialMemberCount = $members.length;

          cy.get('button').contains('Ban').first().click();
      
          cy.contains('Members').parent().find('.list-group-item').should(($membersAfterBan) => {
            const newMemberCount = $membersAfterBan.length;
            expect(newMemberCount).to.equal(initialMemberCount - 1);
          });
      
          cy.contains('Banned').parent().find('.list-group-item').should(($bannedUsers) => {
            const bannedUserCount = $bannedUsers.length;
            expect(bannedUserCount).to.be.greaterThan(0);
          });
      
          cy.get('button').contains('Unban').first().click();
      
          cy.contains('Members').parent().find('.list-group-item').should(($membersAfterUnban) => {
            const finalMemberCount = $membersAfterUnban.length;
            expect(finalMemberCount).to.equal(initialMemberCount);
          });
        });
      });
      
      it('Superuser - Manage Users in Group', () => {
        cy.contains('Groups').click();
        cy.contains('Super Group').click();
        cy.contains('Users').click();
      
        cy.contains('Admins').parent().find('.list-group-item').then(($admins) => {
          const initialAdminCount = $admins.length;
      
          cy.get('button').contains('Add').first().click();
      
          cy.get('button').contains('Promote').first().click();
      
          cy.contains('Admins').parent().find('.list-group-item').should(($adminsAfter) => {
            const newAdminCount = $adminsAfter.length;
            expect(newAdminCount).to.equal(initialAdminCount + 1);
          });
      
          cy.get('button').contains('Demote').first().click();
        });
      });
  
    it('Superuser - Delete Group', () => {
      cy.contains('Groups').click();
      cy.contains('Super Group').click();
      cy.contains('Settings').click();
      cy.contains('Delete Group').click();
      cy.contains('Super Group').should('not.exist');
    });

    after(() => {
      cy.visit('/login');
      cy.get('input[name="username"]').type('newUser');
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
      cy.contains('Settings').click();
      cy.get('button').contains('Delete Account').should('be.visible').click();
      cy.on('window:confirm', () => true);
      cy.url().should('include', '/login');
    })
  });
  