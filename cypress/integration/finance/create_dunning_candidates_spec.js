import { Product, ProductCategory } from '../../support/utils/product';
import { BPartner } from '../../support/utils/bpartner';
import { salesInvoices } from '../../page_objects/sales_invoices';
import { SalesInvoice, SalesInvoiceLine } from '../../support/utils/sales_invoice';

describe('create dunning candidates', function() {
  const timestamp = new Date().getTime();
  const productName = `Sales Order-to-Invoice Test ${timestamp}`;
  const productPacking = `Sales Order-to-Invoice Test ${timestamp}`;
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
    cy.fixture('product/simple_product.json').then(productJson => {
      Object.assign(new Product(), productJson)
        .setName(productName)
        .setValue(productValue)
        .setProductType('Service')
        .setProductCategory(productCategoryValue + '_' + productCategoryName)
        .apply();
    });

    cy.selectTab('M_HU_PI_Item_Product')
      .pressAddNewButton()
      .selectInListField('M_HU_PI_Item_ID', 'IFCO 6410', true /*modal*/)
      .clearField('Qty')
      .writeIntoStringField('Qty', '10', true /*modal*/)
      .selectDateViaPicker('ValidFrom', 'today', true /*modal*/)
      .pressDoneButton();

    cy.fixture('sales/simple_customer.json').then(customerJson => {
      Object.assign(new BPartner(), customerJson)
        .setName(customerName)
        .apply();
    });

    cy.selectTab('Customer');
    cy.get('.tr-even > :nth-child(3)')
      .dblclick()
      .selectInListField('C_PaymentTerm_ID', 'immediately', false, null, true);
    cy.selectTab('Customer');
    cy.get('.tab-pane > :nth-child(1) > :nth-child(1) > :nth-child(1) > .panel').scrollTo('right');
    cy.get('.tr-even > :nth-child(9)')
      .dblclick()
      .selectInListField('C_Dunning_ID', 'test Dunning test', false, null, true);

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
    cy.visit('/window/540154');
    cy.waitForHeader('Finance', 'Dunning Candidates');
    cy.executeHeaderAction('C_Dunning_Candidate_Create');
    cy.get('.panel-modal-header > .items-row-2 > :nth-child(2)').click();
    cy.get(':nth-child(3) > .header-btn > .header-item-container > .header-item').click();
  });
});
