import { DataEntryTab } from '../../support/utils/dataEntryTab';

import { appendHumanReadableNow, getLanguageSpecific } from '../../support/utils/utils';

let dataEntryTabName;
let eingabeFenster; 
let tabName;
let seqNo;

describe('Reproduce issue https://github.com/metasfresh/metasfresh-webui-frontend/issues/2214', function() {
  it('Read the fixture', function() {
    cy.fixture('dataEntry/dataEntry_set_seqno.json').then(f => {
      dataEntryTabName = appendHumanReadableNow(f['dataEntryTabName']);
      eingabeFenster = getLanguageSpecific(f, 'eingabeFenster');
      tabName = f['tabName'];
      seqNo = f['seqNo'];
    });
  });

  it('Create dataEntry group with SeqNo 21', function() {


    new DataEntryTab(dataEntryTabName, eingabeFenster)
      .setTabName(tabName)
      .setSeqNo(seqNo)
      .apply();

    // these are sortof guards, to demonstrate that other fields work.
    cy.get('.form-field-Name')
      .find('input')
      .should('have.value', dataEntryTabName);
    cy.get('.form-field-TabName')
      .find('input')
      .should('have.value', 'Group1-Tab1');

    // here it comes: SeqNo has a value of '21', as entered by us
    cy.get('.form-field-SeqNo')
      .find('input')
      .should('have.value', '21');

    // deactivate the custom tab, because we don't want other tests to unexpectedly have it among their respective bpartner-tabs
    cy.clickOnIsActive();
  });
});