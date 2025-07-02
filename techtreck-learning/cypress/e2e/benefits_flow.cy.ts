/// <reference types="cypress" />
describe('Sign up, request benefits, and delete flow', () => {
  const randomEmail = `testuser_${Date.now()}@example.com`;
  const password = 'TestPassword123';
  const name = 'Test User';

  it('should sign up, request benefits,delete benefits,  and delete the user', () => {
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

    cy.log('Step 2: Open menu, go to Concediu, and request');
    cy.get('.btn-menu').first().should('be.visible').click();
    cy.get('.drawer .nav-bar-item')
      .contains('Concediu')
      .should('be.visible')
      .click();

    cy.contains('button[type="submit"]', 'Submit') // ensure form is visible
      .should('be.disabled'); // at first, because form is invalid

    const day = new Date();
    day.setDate(day.getDate() + 1); // Shift to tomorrow
    const mm = String(day.getMonth() + 1).padStart(2, '0');
    const dd = String(day.getDate()).padStart(2, '0');
    const yyyy = day.getFullYear();

    const start = `${mm}/${dd}/${yyyy}`;

    const endDate = new Date(day);
    endDate.setDate(endDate.getDate() + 1); // Day after tomorrow
    const em = String(endDate.getMonth() + 1).padStart(2, '0');
    const ed = String(endDate.getDate()).padStart(2, '0');
    const ey = endDate.getFullYear();
    const end = `${em}/${ed}/${ey}`;

    cy.get('input[formcontrolname="startDate"]')
      .clear()
      .type(start)
      .should('have.value', start);

    cy.get('input[formcontrolname="endDate"]')
      .clear()
      .type(end)
      .should('have.value', end);

    cy.get('input[formcontrolname="description"]')
      .clear()
      .type('Automated vacation request')
      .should('have.value', 'Automated vacation request');

    cy.contains('button[type="submit"]', 'Submit')
      .should('not.be.disabled')
      .click();

    //check if the request was successful
    cy.get('table.vacation-list tbody tr').should(
      'contain',
      'Automated vacation request'
    );

    cy.get('.btn-icon').should('not.be.disabled').click();
    cy.contains('Automated vacation request').should('not.exist');

    cy.log('Step 3: go to Leave Slips, and request');

    cy.get('.drawer .nav-bar-item')
      .contains('Bilet de voie')
      .should('be.visible')
      .click();

    cy.contains('button[type="submit"]', 'Submit') // ensure form is visible
      .should('be.disabled'); // at first, because form is invalid

    // Select tomorrow’s date (same logic reused)
    const slipDate = new Date();
    slipDate.setDate(slipDate.getDate() + 1);
    const slipMonth = String(slipDate.getMonth() + 1).padStart(2, '0');
    const slipDay = String(slipDate.getDate()).padStart(2, '0');
    const slipYear = slipDate.getFullYear();
    const formattedDate = `${slipMonth}/${slipDay}/${slipYear}`;

    // Fill in the form fields
    cy.get('input[formcontrolname="date"]')
      .clear()
      .type(formattedDate)
      .should('have.value', formattedDate);

    // Time range: 09:00 to 09:30 (fits the step of 1800 seconds = 30 min)
    cy.get('input[formcontrolname="startTime"]')
      .clear()
      .type('09:00')
      .should('have.value', '09:00');

    cy.get('input[formcontrolname="endTime"]')
      .clear()
      .type('09:30')
      .should('have.value', '09:30');

    // Select reason from dropdown
    cy.get('mat-select[formcontrolname="description"]').click();
    cy.get('mat-option').contains('Medical Appointment').click();

    // If "Other" is chosen, trigger custom input (optional, shown here for coverage)
    // cy.get('mat-select[formcontrolname="description"]').click();
    // cy.get('mat-option').contains('Other').click();
    // cy.get('input[formcontrolname="reason"]')
    //   .type('Test reason')
    //   .should('have.value', 'Test reason');

    // Submit the form
    cy.contains('button[type="submit"]', 'Submit')
      .should('not.be.disabled')
      .click();

    // Assert success (depending on behavior)
    cy.contains('Medical').should('exist');

    cy.get('.btn-icon').should('not.be.disabled').click();
    cy.contains('Medical').should('not.exist');

    cy.log('Step 4: Delete the user account');

    cy.get('.drawer .nav-bar-item') // click Account
      .contains('Account')
      .should('be.visible')
      .click();

    cy.get('.btn-delete') // click the delete button
      .should('be.visible')
      .click();

    cy.get('input[formcontrolname="password"]') // confirm delete
      .should('be.visible')
      .type(password);

    cy.contains('button', 'Delete forever').should('be.visible').click();

    cy.contains('Account deleted!').should('be.visible');
  });
});
