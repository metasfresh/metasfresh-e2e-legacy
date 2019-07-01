import { Product, ProductCategory } from '../../support/utils/product';
import { BPartner, BPartnerLocation } from '../../support/utils/bpartner';
import { SalesOrder } from '../../support/utils/sales_order';
import { toggleNotFrequentFilters, selectNotFrequentFilterWidget, applyFilters } from '../../support/functions';

describe('change product price', function() {
  const timestamp = new Date().getTime(); // used in the document names, for ordering
  const productName = `ProductName ${timestamp}`;
  const productValue = `ProductNameValue ${timestamp}`;
  const productCategoryName = `ProductCategoryName ${timestamp}`;
  const productCategoryValue = `ProductNameValue ${timestamp}`;
  const bpartnerName = `Testcustomer ${timestamp}`;
  const bpartnerLocation = `Testadresse ${timestamp}`;
  const salesReference = `TestSalesOrder ${timestamp}`;

  before(function() {
    cy.fixture('product/simple_productCategory.json').then(productCategoryJson => {
      Object.assign(new ProductCategory(), productCategoryJson)
        .setName(productCategoryName)
        .setValue(productCategoryValue)
        .apply();
    });
    cy.fixture('product/product.json').then(productJson => {
      Object.assign(new Product(), productJson)
        .setName(productName)
        .setValue(productValue)
        // .setProductType('Service')
        .setProductCategory(productCategoryValue + '_' + productCategoryName)
        .setProductCategory('24_Gebinde')
        .apply();
    });
    cy.fixture('sales/simple_bpartner.json').then(bpartner => {
      Object.assign(new BPartner(), bpartner).apply();
    });
    // new BPartner()
    //   .setName(bpartnerName)
    //   .setCustomer(true)
    //   .addLocation(new BPartnerLocation(bpartnerLocation).setCity('Cologne').setCountry('Deutschland'))
    //   .apply();
    new SalesOrder(salesReference)
      .setBPartner(bpartnerName)
      .setPricingSystem('Testpreisliste Kunden')
      .setPaymentTerm('immediately')
      .apply();
  });

  it('order line', function() {
    cy.selectTab('C_OrderLine');

    cy.pressBatchEntryButton();
    cy.writeIntoLookupListField('M_Product_ID', productName, productName);
    cy.writeIntoStringField('Qty', '1');
  });

  it('check in product', function() {
    cy.visit('/window/140');
    cy.waitForHeader('Product Management', 'Product');
    toggleNotFrequentFilters();
    selectNotFrequentFilterWidget('default');
    cy.writeIntoStringField('Name', productName, false, undefined, true);
    applyFilters();

    cy.get('.table > tbody')
      .contains('td', productName)
      .dblclick();
  });
});
