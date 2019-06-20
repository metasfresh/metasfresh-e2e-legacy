describe('create dunning documents', function() {
  before(function() {
    cy.visit('/window/540154');
    cy.waitForHeader('Finance', 'Dunning Candidates');
  });

  it('select entries', function() {
    cy.get('body')
      .type('{ctrl}', { release: false })
      .get('tbody > :nth-child(1) > :nth-child(1)')
      .click()
      .get('tbody > :nth-child(2) > :nth-child(1)')
      .click();
  });

  it('proccess dunning candidates', function() {
    cy.executeHeaderAction('C_Dunning_Candidate_Process');
    cy.pressStartButton(500);
  });

  it('go to location', function() {
    cy.clickOnBreadcrumb('Finance', 'Dunning');
  });
});
