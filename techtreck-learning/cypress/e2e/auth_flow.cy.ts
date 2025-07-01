describe('User sign up, logout, login, and delete flow', () => {
  const randomEmail = `testuser_${Date.now()}@example.com`;
  const password = 'TestPassword123';
  const name = 'Test User';

  it('should sign up, log out, log in, and delete the user', () => {
    cy.log('Step 1: Sign up a new user');
    cy.visit('/auth');
    cy.contains('Sign Up').click();
    cy.get('form:visible')
      .last()
      .within(() => {
        cy.get('input[formcontrolname="name"]').type(name);
        cy.get('input[formcontrolname="email"]').type(randomEmail);
        cy.get('input[formcontrolname="password"]').type(password);
        cy.get('input[formcontrolname="confirmPassword"]').type(password);
        cy.get('button[type="submit"]').contains('Submit').click();
      });
    cy.url({ timeout: 10000 }).should('include', '/home');

    cy.log('Step 2: Open menu, go to Account, and log out');
    cy.get('.btn-menu').first().should('be.visible').click();
    cy.get('.drawer .nav-bar-item')
      .contains('Account')
      .should('be.visible')
      .click();
    cy.get('.btn').contains('Log Out').should('be.visible').click();

    cy.log('Step 3: Log in with the same user');
    cy.visit('/auth');
    cy.contains('Log In').click();
    cy.get('form:visible').within(() => {
      cy.get('input[formcontrolname="email"]').type(randomEmail);
      cy.get('input[formcontrolname="password"]').type(password);
      cy.get('button[type="submit"]').contains('Submit').click();
    });
    cy.url({ timeout: 10000 }).should('include', '/home');

    cy.log('Step 4: Delete the user');
    cy.get('.btn-menu').first().should('be.visible').click();
    cy.get('.drawer .nav-bar-item')
      .contains('Account')
      .should('be.visible')
      .click();
    cy.get('.btn-delete').should('be.visible').click();
    cy.get('input[formcontrolname="password"]')
      .should('be.visible')
      .type(password);
    cy.get('button.btn-form')
      .contains('Delete forever')
      .should('be.visible')
      .click();
    cy.contains('Account deleted!').should('be.visible');
  });
});
