import { Product, ProductCategory } from '../../support/utils/product';
import { BPartner } from '../../support/utils/bpartner';
import { SalesInvoice, SalesInvoiceLine } from '../../support/utils/sales_invoice';

describe('create dunning candidates', function() {
  const timestamp = new Date().getTime();
  const productName = `Sales Order-to-Invoice Test ${timestamp}`;
  const customerName = `Sales Order-to-Invoice Test ${timestamp}`;
  const salesInvoiceTargetDocumentType = 'Sales Invoice';

  before(function() {
    const productValue = `sales_order_to_invoice_test ${timestamp}`;
    const productCategoryName = `ProductCategoryName ${timestamp}`;
    const productCategoryValue = `ProductNameValue ${timestamp}`;

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
        .setProductType('Service')
        .setProductCategory(productCategoryValue + '_' + productCategoryName)
        .apply();
    });

    cy.fixture('sales/simple_bpartner.json').then(customerJson => {
      Object.assign(new BPartner(), customerJson)
        .setName(customerName)
        .setCustomerPaymentTerm('immediately')
        .setCustomerDunning('test Dunning test')
        .apply();
    });

    new SalesInvoice(customerName, salesInvoiceTargetDocumentType)
      .addLine(
        new SalesInvoiceLine()
          .setProduct(productName)
          .setQuantity(20)
          .setPackingItem('IFCO 6410 x 10 Stk')
          .setTuQuantity(2)
      )
      .setDocumentAction('Complete')
      .setDocumentStatus('Completed')
      .apply();
  });

  it('create dunning candidates', function() {
    cy.visitWindow('540154');
    cy.waitForHeader('Finance', 'Dunning Candidates');
    cy.executeHeaderAction('C_Dunning_Candidate_Create');
    cy.pressStartButton(1000);
    cy.clickOnBreadcrumb('Dunning Candidates');
  });
});
