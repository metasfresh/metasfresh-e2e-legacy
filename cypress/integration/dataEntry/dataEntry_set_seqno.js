import { DataEntryTab } from '../../support/utils/DataEntryTab';

describe('Reproduce issue https://github.com/metasfresh/metasfresh-webui-frontend/issues/2214', function() {
  it('Create dataEntry tab with SeqNo 21', function() {
    const timestamp = new Date().getTime(); // used in the document names, for ordering
    const dataEntryTabName = `Tab1 ${timestamp}`;

    new DataEntryTab(dataEntryTabName, 'Business Partner')
      .setTabName('Tab1')
      .setSeqNo(21)
      .apply();

    // these are sortof guards, to demonstrate that other fields work.
    cy.get('.form-field-Name')
      .find('input')
      .should('have.value', dataEntryTabName);
    cy.get('.form-field-TabName')
      .find('input')
      .should('have.value', 'Tab1');

    // here it comes: SeqNo has a value of '21', as entered by us
    cy.get('.form-field-SeqNo')
      .find('input')
      .should('have.value', '21');
  });
});
