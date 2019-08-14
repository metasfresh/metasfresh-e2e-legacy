/**The test is done but is failing due to https://github.com/metasfresh/me03/issues/2381.
 * After this issue will be fixed, the test will pass.
 *  It will need to be moved from integration/defunct dir. */
import { BPartner } from '../../support/utils/bpartner';
import { DiscountSchema } from '../../support/utils/discountschema';
import { Builder } from '../../support/utils/builder';
import { humanReadableNow } from '../../support/utils/utils';
import { SalesOrder, SalesOrderLine } from '../../support/utils/sales_order';
import { PackingMaterial } from '../../support/utils/packing_material';
import { PackingInstructions } from '../../support/utils/packing_instructions';
import { PackingInstructionsVersion } from '../../support/utils/packing_instructions_version';
import { ProductCategory } from '../../support/utils/product';
import { applyFilters, selectNotFrequentFilterWidget, toggleNotFrequentFilters } from '../../support/functions';

describe('Create Sales order', function() {
  const date = humanReadableNow();
  const customer1 = `CustomerTest1 ${date}`;
  const productName1 = `ProductTest1 ${date}`;
  const productCategoryName = `ProductCategoryName ${date}`;
  const discountSchemaName = `DiscountSchemaTest ${date}`;
  const priceSystemName = `PriceSystem ${date}`;
  const priceListName = `PriceList ${date}`;
  const priceListVersionName = `PriceListVersion ${date}`;
  const productType = 'Item';
  const productForPackingMaterial = `ProductPackingMaterial ${date}`;
  const productPMValue = `purchase_order_testPM ${date}`;
  const packingMaterialName = `ProductPackingMaterial ${date}`;
  const packingInstructionsName = `ProductPackingInstrutions ${date}`;

  it('Create price and product entities to be used in purchase order', function() {
    Builder.createBasicPriceEntities(priceSystemName, priceListVersionName, priceListName, true);
    cy.fixture('discount/discountschema.json').then(discountSchemaJson => {
      Object.assign(new DiscountSchema(), discountSchemaJson)
        .setName(discountSchemaName)
        .apply();
    });
    Builder.createProductWithPriceUsingExistingCategory(
      priceListName,
      productForPackingMaterial,
      productPMValue,
      productType,
      '24_Gebinde'
    );
    cy.fixture('product/packing_material.json').then(packingMaterialJson => {
      Object.assign(new PackingMaterial(), packingMaterialJson)
        .setName(packingMaterialName)
        .setProduct(productForPackingMaterial)
        .apply();
    });
  });
  it('Create packing related items to be used in purchase order', function() {
    cy.fixture('product/packing_instructions.json').then(packingInstructionsJson => {
      Object.assign(new PackingInstructions(), packingInstructionsJson)
        .setName(packingInstructionsName)
        .apply();
    });
    cy.fixture('product/packing_instructions_version.json').then(pivJson => {
      Object.assign(new PackingInstructionsVersion(), pivJson)
        .setName(packingInstructionsName)
        .setPackingInstructions(packingInstructionsName)
        .setPackingMaterial(packingMaterialName)
        .apply();
    });

    cy.fixture('product/simple_productCategory.json').then(productCategoryJson => {
      Object.assign(new ProductCategory(), productCategoryJson)
        .setName(productCategoryName)
        .setValue(productCategoryName)
        .apply();
    });
    Builder.createProductWithPriceAndCUTUAllocationUsingExistingCategory(
      productCategoryName,
      productCategoryName,
      priceListName,
      productName1,
      productName1,
      productType,
      packingInstructionsName
    );
    cy.fixture('sales/simple_customer.json').then(customerJson => {
      const bpartner = new BPartner({ ...customerJson, name: customer1 }).setCustomerDiscountSchema(discountSchemaName);
      bpartner.apply();
    });
  });
  it('Create the first sales order', function() {
    new SalesOrder()
      .setBPartner(customer1)
      .setPriceSystem(priceSystemName)
      .addLine(new SalesOrderLine().setProduct(productName1).setQuantity(15))
      .apply();
    cy.completeDocument();
  });
  it('Open Picking terminal', function() {
    cy.visitWindow('540345');

    toggleNotFrequentFilters();
    selectNotFrequentFilterWidget('default');
    cy.writeIntoLookupListField('M_Product_ID', productName1, productName1, false, false, null, true);
    cy.writeIntoLookupListField('C_BPartner_Customer_ID', customer1, customer1, false, false, null, true);
    applyFilters();

    // cy.expectNumberOfRows(1);
  });
});
