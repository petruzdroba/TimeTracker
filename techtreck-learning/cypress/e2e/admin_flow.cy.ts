import { environmentTest } from '../../src/environments/environment';
/// <reference types="cypress" />

describe('Admin promotes user to Manager', () => {
  const empEmail = `emp_${Date.now()}@example.com`;
  const password = 'TestPassword123';
  const empName = 'Employee User';

  it('New employee -> Admin promotes -> Employee sees Manager tab -> Deletes account', () => {
    // --- Employee sign up ---
    cy.log('Employee: Sign up');
    cy.visit('/auth');
    cy.contains('Sign Up', { timeout: 10000 }).should('be.visible').click();
    cy.get('form:visible')
      .last()
      .within(() => {
        cy.get('[formcontrolname="name"]').type(empName);
        cy.get('[formcontrolname="email"]').type(empEmail);
        cy.get('[formcontrolname="password"]').type(password);
        cy.get('[formcontrolname="confirmPassword"]').type(password);
        cy.get('button[type="submit"]').contains('Submit').click();
      });
    cy.url({ timeout: 10000 }).should('include', '/home');

    // --- Employee logs out ---
    cy.get('.btn-menu').first().should('be.visible').click();
    cy.get('.drawer .nav-bar-item').contains('Account').click();
    cy.get('.btn').contains('Log Out').click();
    cy.url().should('include', '/auth');

    // --- Admin logs in ---
    cy.log('Admin: Log in');
    cy.get('form:visible').within(() => {
      cy.get('[formcontrolname="email"]').type(environmentTest.adminEmail, {
        log: false,
      });
      cy.get('[formcontrolname="password"]').type(
        environmentTest.adminPassword,
        { log: false }
      );
      cy.get('button[type="submit"]').contains('Submit').click();
    });
    cy.url({ timeout: 10000 }).should('include', '/home');

    // --- Admin goes to admin panel and searches for employee ---
    cy.log('Admin: Search for employee');
    cy.get('.drawer .nav-bar-item').contains('Admin').click();
    cy.get('input[matinput]').type(empEmail);
    cy.contains('mat-expansion-panel-header', empEmail, {
      timeout: 10000,
    }).click();

    // --- Admin edits role to Manager using <app-edit-box> form ---
    cy.log('Admin: Promote to Manager');
    cy.get('button i.fa-pen').click();

    // Wait for the modal title to be visible instead of using isOpen
    cy.contains(`Edit User - ${empName}`, { timeout: 10000 })
      .should('be.visible')
      .parents('app-edit-box') // scope to the correct modal container
      .within(() => {
        // Change role to Manager
        cy.get('mat-select[formcontrolname="role"]').click();
      });

    // Select the Manager option from dropdown
    cy.get('mat-option').contains('Manager').click();

    // Submit the form inside the same modal
    cy.contains(`Edit User - ${empName}`)
      .parents('app-edit-box')
      .within(() => {
        cy.get('button[type="submit"]').contains('Submit').click({force: true});
      });


    // --- Admin logs out ---
    cy.get('.drawer .nav-bar-item').contains('Account').click();
    cy.get('.btn').contains('Log Out').click();
    cy.url().should('include', '/auth');

    // --- Employee logs back in ---
    cy.log('Employee: Log in to check Manager tab');
    cy.contains('Log In').click();
    cy.get('form:visible').within(() => {
      cy.get('[formcontrolname="email"]').type(empEmail);
      cy.get('[formcontrolname="password"]').type(password);
      cy.get('button[type="submit"]').contains('Submit').click();
    });
    cy.url().should('include', '/home');
    cy.get('.drawer .nav-bar-item').contains('Manager').should('be.visible');

    // --- Employee deletes account ---
    cy.log('Employee: Delete account');
    cy.get('.drawer .nav-bar-item').contains('Account').click();
    cy.get('.btn-delete').click();
    cy.get('[formcontrolname="password"]').type(password);
    cy.contains('Delete forever').click();
    cy.contains('Account deleted!', { timeout: 20000 }).should('be.visible');
  });
});
