import { DiscountSchema } from '../../support/utils/discountschema';
import { BPartner } from '../../support/utils/bpartner';

describe('Create test: discount schema set to customer, https://github.com/metasfresh/metasfresh-e2e/issues/113', function() {
  const timestamp = new Date().getTime();
  const discountSchemaName = `DiscountSchemaTest ${timestamp}`;
  it('Create discount schema and set it to customer', function() {
    cy.fixture('discount/discountschema.json').then(discountschemaJson => {
      Object.assign(new DiscountSchema(), discountschemaJson)
        .setName(discountSchemaName)
        .apply();
    });

    cy.fixture('sales/simple_customer.json').then(customerJson => {
      Object.assign(new BPartner(), customerJson)
        .setCustomer(true)
        .setCustomerDiscountSchema(discountSchemaName)
        .clearLocations() // contacts&locations not needed in this test
        .clearContacts()
        .setBank(undefined) // no bank needed either
        .apply();
    });

    cy.selectTab('Customer');
    cy.log('Now going to verify that the discount schema was set correctly');
    // Looking at the tab like this failed (sometimes?) in the docker image.
    // I believe that's because selectTab didn'T make sure to actually wait for the tab to be loaded.
    // Still even if that's fixed, a simple layout change would break this check.
    // Actually I would like a snapshot of the tab data, but since i'm now focussing on fixing what's there, i rather check only this field value
    //cy.get('table tr').eq(0).get('td').eq(7).should('contain', discountSchemaName);
    cy.selectSingleTabRow();
    cy.openAdvancedEdit();
    cy.getStringFieldValue('M_DiscountSchema_ID', true /*modal*/).then(fieldValue => {
      cy.wrap(fieldValue).should('contain', discountSchemaName);
    });
  });
});
