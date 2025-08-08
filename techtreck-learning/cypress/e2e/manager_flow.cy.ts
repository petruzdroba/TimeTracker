import { enviornmentTest } from './../../src/environments/environment';
/// <reference types="cypress" />

describe('Employee–Manager Vacation Approval Flow', () => {
  const empEmail = `emp_${Date.now()}@example.com`;
  const mgrEmail = `mgr_${Date.now()}@example.com`;
  const password = 'TestPassword123';
  const nameEmp = 'Employee User';
  const nameMgr = 'Manager User';

  // Using emails as IDs directly
  let empId = empEmail;
  let mgrId = mgrEmail;

  beforeEach(() => {
    // On failure, clean up using emails as IDs
    Cypress.on('fail', (err, runnable) => {
      if (mgrId) {
        cy.request('POST', `/auth/delete/${mgrId}`, { password }).then(() => {
          Cypress.log({
            name: 'Cleanup',
            message: 'Manager deleted after failure',
          });
        });
      }
      if (empId) {
        cy.request('POST', `/auth/delete/${empId}`, { password }).then(() => {
          Cypress.log({
            name: 'Cleanup',
            message: 'Employee deleted after failure',
          });
        });
      }
      throw err;
    });
  });

  it('Employee creates vacation; Manager reviews & accounts deleted', () => {
    // --- Employee sign up & create vacation ---
    cy.log('Employee: Sign up');
    cy.visit('/auth');
    cy.contains('Sign Up').click();
    cy.contains('Sign Up', { timeout: 10000 }).should('be.visible').click();
    cy.get('form:visible')
      .last()
      .within(() => {
        cy.get('input[formcontrolname="name"]').type(nameEmp);
        cy.get('input[formcontrolname="email"]').type(empEmail);
        cy.get('input[formcontrolname="password"]').type(password);
        cy.get('input[formcontrolname="confirmPassword"]').type(password);
        cy.get('button[type="submit"]').contains('Submit').click();
      });
    cy.url({ timeout: 10000 }).should('include', '/home');

    cy.log('Employee: Request a vacation');
    cy.get('.btn-menu').first().should('be.visible').click();
    cy.contains('Concediu').click();

    const day = new Date();
    day.setDate(day.getDate() + 1); // Start = tomorrow

    // Skip weekend if start date is Saturday(6) or Sunday(0)
    while (day.getDay() === 0 || day.getDay() === 6) {
      day.setDate(day.getDate() + 1);
    }

    // Format start date as MM/DD/YYYY
    const mm = String(day.getMonth() + 1).padStart(2, '0');
    const dd = String(day.getDate()).padStart(2, '0');
    const yyyy = day.getFullYear();
    const start = `${mm}/${dd}/${yyyy}`;

    // Calculate end date skipping weekends
    const endDate = new Date(day);
    do {
      endDate.setDate(endDate.getDate() + 1);
    } while (endDate.getDay() === 0 || endDate.getDay() === 6); // Skip Sunday(0) and Saturday(6)

    // Format end date as MM/DD/YYYY
    const em = String(endDate.getMonth() + 1).padStart(2, '0');
    const ed = String(endDate.getDate()).padStart(2, '0');
    const ey = endDate.getFullYear();
    const end = `${em}/${ed}/${ey}`;

    cy.get('[formcontrolname="startDate"]').clear().type(start);
    cy.get('[formcontrolname="endDate"]').clear().type(end);
    cy.get('[formcontrolname="description"]').type('Emp vacation');
    cy.contains('button[type="submit"]', 'Submit').click();
    cy.get('table.vacation-list').should('contain', 'Emp vacation');

    // Log out employee
    cy.get('.drawer .nav-bar-item')
      .contains('Account')
      .should('be.visible')
      .click();
    cy.get('.btn').contains('Log Out').should('be.visible').click();

    // --- Manager sign up & create vacation ---
    cy.log('Manager: Sign up');
    cy.visit('/auth');
    cy.get('form:visible')
      .first()
      .within(() => {
        cy.get('input[formcontrolname="email"]').type(
          enviornmentTest.managerEmail,
          { log: false }
        );
        cy.get('input[formcontrolname="password"]').type(
          enviornmentTest.managerPassword,
          { log: false }
        );
        cy.get('button[type="submit"]').contains('Submit').click();
      });
    cy.url({ timeout: 10000 }).should('include', '/home');

    cy.log('Manager: Request own vacation');
    cy.get('.btn-menu').first().should('be.visible').click();
    cy.contains('Concediu').click();

    cy.document().then((doc) => {
      const table = doc.querySelector('table.vacation-list');
      if (!table) {
        cy.log('No vacation table — skipping delete.');
        return;
      }

      const rows = Array.from(table.querySelectorAll('tbody tr'));
      if (rows.length === 0) {
        cy.log('No vacation rows — skipping delete.');
        return;
      }

      const pendingRow = rows.find((row) =>
        row.querySelector('td:nth-child(4) i.fas.fa-circle.pending')
      );

      if (pendingRow) {
        cy.wrap(pendingRow).within(() => {
          cy.get('td')
            .eq(5)
            .find('button.btn-icon i.fas.fa-trash')
            .click({ force: true });
        });
        cy.on('window:confirm', () => true);
      } else {
        cy.log('No pending vacation found — skipping delete.');
      }
    });

    cy.get('[formcontrolname="startDate"]')
      .first()
      .clear({ force: true })
      .type(start, { force: true });
    cy.get('[formcontrolname="endDate"]')
      .first()
      .clear({ force: true })
      .type(end, { force: true });

    cy.get('[formcontrolname="description"]').type('Mgr vacation');
    cy.contains('button[type="submit"]', 'Submit').click();
    cy.get('table.vacation-list').should('contain', 'Mgr vacation');

    // --- Manager reviews pending requests ---
    cy.log('Manager: Go to Manager tab');
    cy.get('.drawer .nav-bar-item')
      .contains('Manager')
      .should('be.visible')
      .click();

    cy.log('Manager: Deny employee vacation');
    cy.get('.pending-table')
      .contains('td', empEmail)
      .parent('tr')
      .within(() => {
        cy.get('button.accept').click();
      });
    cy.get('.pending-table').should('not.contain', empEmail);

    cy.log('Manager: Accept own vacation');
    cy.get('.pending-table')
      .contains('td', enviornmentTest.managerEmail)
      .parent('tr')
      .within(() => {
        cy.get('button.deny').click();
      });
    cy.get('.completed-table').should('contain', enviornmentTest.managerEmail);

    // --- Manager logs out first ---
    cy.log('Manager: Log out');
    cy.get('.drawer .nav-bar-item')
      .contains('Account')
      .should('be.visible')
      .click();
    cy.get('.btn').contains('Log Out').should('be.visible').click();
    cy.url().should('include', '/auth');

    // --- Employee logs back in to delete ---
    cy.log('Employee: Log in to delete own account');
    cy.visit('/auth');
    cy.contains('Log In').click();
    cy.get('form:visible').within(() => {
      cy.get('[formcontrolname="email"]').type(empEmail);
      cy.get('[formcontrolname="password"]').type(password);
      cy.get('button[type="submit"]').contains('Submit').click();
    });
    cy.url().should('include', '/home');

    cy.log('Employee: Delete account');
    cy.get('.btn-menu').first().click();
    cy.contains('Account').click();
    cy.get('.btn-delete').click();
    cy.get('[formcontrolname="password"]').type(password);
    cy.contains('Delete forever').click();
    cy.contains('Account deleted!', { timeout: 20000 }).should('be.visible');
  });
});
