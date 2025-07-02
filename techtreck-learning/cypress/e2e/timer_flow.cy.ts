/// <reference types="cypress" />
describe('Sign up, start timer, stop timer, check, and delete flow', () => {
  const randomEmail = `testuser_${Date.now()}@example.com`;
  const password = 'TestPassword123';
  const name = 'Test User';

  function waitForTimerData(userId: number, retries = 10) {
    if (retries === 0) throw new Error('TimerData not found after waiting');
    cy.request({
      method: 'GET',
      url: `/timer/get/${userId}`,
      failOnStatusCode: false,
    }).then((resp) => {
      if (resp.status !== 200) {
        cy.wait(500);
        waitForTimerData(userId, retries - 1);
      }
    });
  }

  function waitForPath(retries = 20) {
    cy.get('body', { timeout: 0 }).then(($body) => {
      // Use jQuery :contains to check if the Start button is in the DOM
      if ($body.find('.btn-timer:contains("Start")').length > 0) {
        // Found it—test can proceed
        return;
      }

      // Not found yet
      if (retries <= 0) {
        throw new Error('Start button never appeared after multiple retries');
      }

      // Retry: re-visit the page in case you got bounced
      cy.visit('/timetrack', { failOnStatusCode: false });
      cy.wait(500);

      // Recursive retry
      waitForPath(retries - 1);
    });
  }

  it('should sign up, start timer, stop timer, check timer, and delete the user', () => {
    // Sign up
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

    // Wait for /auth/me to confirm login and get userId
    cy.request('/auth/me/').then((meResp) => {
      expect(meResp.status).to.eq(200);
      const userId = meResp.body.id;

      // Wait until TimerData exists for this user
      waitForTimerData(userId);

      // 1) Watch the auth check
      cy.intercept('GET', '/auth/me').as('getAuth');

      // 2) Visit the protected route (don’t fail on 401)
      cy.visit('/timetrack', { failOnStatusCode: false });

      // 3) Wait for the backend call that validates the session
      cy.wait('@getAuth', { timeout: 20000 })
        .its('response.statusCode')
        .should('eq', 200);

      // 4) Now wait for the client to finally land on /timetrack
      waitForPath();

      // 5) Finally assert your UI is ready
      cy.get('.btn-timer', { timeout: 10000 })
        .should('be.visible')
        .and('contain', 'Start');

      // 4) Start timer, wait 5 seconds, stop timer
      cy.wait(1000); // Wait for the UI to stabilize
      cy.get('.btn-timer').contains('Start').click();
      cy.wait(5000);
      cy.get('.btn-timer').contains('Stop').click();
      cy.wait(4000); // Wait for the timer to update

      // Go to Work Log
      cy.get('.btn-menu').first().should('be.visible').click();
      cy.get('.drawer .nav-bar-item')
        .contains('Situatia la zi')
        .should('be.visible')
        .click();
      cy.url({ timeout: 10000 }).should('include', '/worklog');
      cy.get('table')
        .contains('td', /00:00:0[4-6]/)
        .should('exist');

      // Go to Account and delete the user

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
});
