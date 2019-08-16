import { BPartner } from '../../support/utils/bpartner';
import { humanReadableNow } from '../../support/utils/utils';
import { DiscountSchema } from '../../support/utils/discountschema';

describe('Create a new payment without invoice selection', function() {
  const date = humanReadableNow();
  const paymentDocumentType = 'Zahlungseingang';
  const bPartnerName = `BPartner ${date}`;
  const discountSchemaName = `DiscountSchemaTest ${date}`;
  const accountNo1060 = '1060';
  const accountNo1106 = '1106';

  it('Create discount schema and customer', function() {
    cy.fixture('discount/discountschema.json').then(discountSchemaJson => {
      Object.assign(new DiscountSchema(), discountSchemaJson)
        .setName(discountSchemaName)
        .apply();
    });
    cy.fixture('sales/simple_customer.json').then(customerJson => {
      new BPartner({ ...customerJson, name: bPartnerName }).setCustomerDiscountSchema(discountSchemaName).apply();
    });
  });

  it('Create new payment', function() {
    cy.visitWindow('195', 'NEW');
    cy.writeIntoLookupListField('C_BPartner_ID', bPartnerName, bPartnerName);
    cy.getStringFieldValue('C_BP_BankAccount_ID').should('not.be.empty');
    cy.writeIntoStringField('PayAmt', '250', false, null, true);
    cy.getStringFieldValue('C_Currency_ID').should('equal', 'CHF');
    cy.selectInListField('C_DocType_ID', paymentDocumentType);
    cy.getStringFieldValue('DocumentNo').should('not.be.empty');

    cy.completeDocument();
  });

  it('Check account transactions', function() {
    cy.openReferencedDocuments('AD_RelationType_ID-540201');
    cy.expectNumberOfRows(2);
    cy.selectNthRow(0).dblclick();
    cy.getStringFieldValue('Account_ID', false).should('contain', accountNo1060);
    cy.go('back');
    cy.selectNthRow(1).dblclick();
    cy.getStringFieldValue('Account_ID', false).should('contain', accountNo1106);
  });
});