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
    it('Set packing item', function() {
      cy.selectTab('M_HU_PI_Item_Product')
        .pressAddNewButton()
        .selectInListField('M_HU_PI_Item_ID', productPacking, true /*modal*/)
        .clearField('Qty')
        .writeIntoStringField('Qty', '10', true /*modal*/)
        .selectDateViaPicker('ValidFrom', 'today', true /*modal*/)
        .pressDoneButton();
    });
    cy.fixture('sales/simple_customer.json').then(customerJson => {
      Object.assign(new BPartner(), customerJson)
        .setName(customerName)
        .apply();
    });

    new SalesInvoice(customerName, salesInvoiceTargetDocumentType)
      .addLine(
        new SalesInvoiceLine()
          .setProduct(productName)
          .setQuantity(20)
          .setPackingItem(productPacking)
          .setTuQuantity(2)
      )
      .setDocumentAction('Complete')
      .setDocumentStatus('Completed')
      .apply();
  });

  it('only check', function() {
    cy.visit('/window/143');
  });
});
