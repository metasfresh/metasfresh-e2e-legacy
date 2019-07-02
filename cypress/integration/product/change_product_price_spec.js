import { Product, ProductCategory, ProductPrice } from '../../support/utils/product';
import { BPartner } from '../../support/utils/bpartner';
import { SalesOrder } from '../../support/utils/sales_order';
import { toggleNotFrequentFilters, selectNotFrequentFilterWidget, applyFilters } from '../../support/functions';

describe('change product price', function() {
  const timestamp = new Date().getTime(); // used in the document names, for ordering
  const productName = `ProductName ${timestamp}`;
  const productValue = `ProductNameValue ${timestamp}`;
  const productCategoryName = `ProductCategoryName ${timestamp}`;
  const productCategoryValue = `ProductNameValue ${timestamp}`;
  const bpartnerName = `Testcustomer ${timestamp}`;
  const salesReference = `TestSalesOrder ${timestamp}`;
  const listPrice = 1.23;
  const standardPrice1 = 2.23;
  const standardPrice2 = 4.23;
  const limitPrice = 3.23;

  before(function() {
    cy.fixture('product/simple_productCategory.json').then(productCategoryJson => {
      Object.assign(new ProductCategory(), productCategoryJson)
        .setName(productCategoryName)
        .setValue(productCategoryValue)
        .apply();
    });
    let productPrice;
    cy.fixture('product/product_price.json').then(productPriceJson => {
      productPrice = Object.assign(new ProductPrice(), productPriceJson)
        .setListPriceAmount(listPrice)
        .setStandardPriceAmount(standardPrice1)
        .setLimitPriceAmount(limitPrice);
    });
    cy.fixture('product/product.json').then(productJson => {
      Object.assign(new Product(), productJson)
        .setName(productName)
        .setValue(productValue)
        .setProductCategory(productCategoryValue + '_' + productCategoryName)
        .addProductPrice(productPrice)
        .apply();
    });
    cy.fixture('sales/simple_bpartner.json').then(bpartner => {
      Object.assign(new BPartner(), bpartner)
        .setName(bpartnerName)
        .apply();
    });
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

  it('check price', function() {
    cy.get('.table-flex-wrapper table tbody tr')
      .should('have.length', 1)
      .click();
    cy.openAdvancedEdit();
    cy.get(`.form-field-PriceEntered`).find('input', standardPrice1);
    cy.pressDoneButton();
  });

  it('add another price', function() {
    cy.visitWindow('140');
    cy.waitForHeader('Product Management', 'Product');
    toggleNotFrequentFilters();
    selectNotFrequentFilterWidget('default');
    cy.writeIntoStringField('Name', productName, false, undefined, true);
    applyFilters();

    cy.get('.table > tbody')
      .contains('td', productName)
      .dblclick();

    cy.selectTab('M_ProductPrice');
    cy.get('.table-flex-wrapper table tbody tr')
      .should('have.length', 1)
      .click();
    cy.openAdvancedEdit();

    cy.writeIntoStringField('PriceStd', standardPrice2, true /*modal*/, null /*rewriteUrl*/, true /*noRequest*/);

    cy.get('.btn')
      .contains('Done')
      .should('exist')
      .click()
      .wait(1000);
  });

  it('check in sales order new product price', function() {
    cy.visitWindow('143');
    toggleNotFrequentFilters();
    selectNotFrequentFilterWidget('default');
    cy.writeIntoStringField('Name', bpartnerName, false, undefined, true);
    applyFilters();

    cy.selectTab('C_OrderLine');

    cy.pressBatchEntryButton();
    cy.writeIntoLookupListField('M_Product_ID', productName, productName);
    cy.writeIntoStringField('Qty', '1');
    cy.get('.table-flex-wrapper table tbody tr')
      .should('have.length', 2)
      .click();
    cy.openAdvancedEdit();
    cy.get(`.form-field-PriceEntered`).find('input', standardPrice2);
    cy.pressDoneButton();
  });
});
