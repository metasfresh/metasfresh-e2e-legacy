import { BPartner, BPartnerLocation } from '../../support/utils/bpartner';
import { SalesOrder } from '../../support/utils/sales_order';
import { Product, ProductCategory } from '../../support/utils/product';

describe('Create new picking slot', function() {
  const timestamp = new Date().getTime();
  const bpartnerName = `Testcustomer ${timestamp}`;
  const bpartnerLocation = `Testadresse ${timestamp}`;
  const salesReference = `TestSalesOrder ref ${timestamp}`;
  const productValue = `TestSalesOrderToInvoice ${timestamp}`;
  const productCategoryName = `testProductCategoryName ${timestamp}`;
  const productCategoryValue = `testProductNameValue ${timestamp}`;
  const productName = `TestProduct ${timestamp}`;

  before(function() {
    cy.fixture('product/simple_productCategory.json').then(productCategoryJson => {
      Object.assign(new ProductCategory(), productCategoryJson)
        .setName(productCategoryName)
        .setValue(productCategoryValue)
        .apply();
    });
    cy.fixture('product/simple_product.json').then(productJson => {
      Object.assign(new Product(), productJson)
        .setName(productName)
        .setValue(productValue)
        .setProductType('Service')
        .setProductCategory(productCategoryValue + '_' + productCategoryName)
        .apply();
    });
    cy.fixture('shipment/bpartner.json').then(customerJson => {
      Object.assign(new BPartner(), customerJson)
        .setName(bpartnerName)
        .addLocation(new BPartnerLocation(bpartnerLocation).setCity('Cologne').setCountry('Deutschland'))
        .apply();
    });

    new SalesOrder(salesReference)
      .setBPartner(bpartnerName)
      .setBPartnerLocation(bpartnerLocation)
      .apply();
  });

  it('new picking tray', function() {
    cy.visit('/window/540206');
    cy.waitForHeader('Shipment', 'Picking Tray');

    cy.clickHeaderNav(Cypress.messages.window.new.caption);
    cy.selectInListField('PickingSlot', '000.1');
    cy.selectInListField('M_Warehouse_ID', 'Hauptlager_StdWarehouse');
    cy.selectInListField('M_Locator_ID', 'Hauptlager_StdWarehouse_Verdichtung_0_0_1');
    cy.writeIntoLookupListField('C_BPartner_ID', bpartnerName, bpartnerName);
    cy.writeIntoLookupListField('C_BPartner_Location_ID', bpartnerLocation, bpartnerLocation);
  });

  it('another new picking tray', function() {
    cy.visit('/window/540206');
    cy.waitForHeader('Shipment', 'Picking Tray');

    cy.clickHeaderNav(Cypress.messages.window.new.caption);
    cy.selectInListField('PickingSlot', '000.2');
    cy.selectInListField('M_Warehouse_ID', 'Hauptlager_StdWarehouse');
    cy.selectInListField('M_Locator_ID', 'Hauptlager_StdWarehouse_Verdichtung_0_0_1');
    cy.clickOnCheckBox('IsDynamic');
  });

  it('picking terminal', function() {
    cy.visit('/window/540345');
    cy.waitForHeader('Shipment', 'Picking Terminal (Prototype)');

    cy.get(':nth-child(3) > .header-btn > .header-item-container > .header-item').click();
  });
});
