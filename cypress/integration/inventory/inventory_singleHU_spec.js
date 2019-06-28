

import { Product } from '../../support/utils/product';

import { SingleInventory, InventoryLine } from '../../support/utils/create_inventory';
//import { toggleNotFrequentFilters, selectNotFrequentFilterWidget, applyFilters } from '../../support/functions';

describe('Aggregated inventory test', function() {
  const timestamp = new Date().getTime();
  const productName = `SingleHUInventory ${timestamp}`;
  const productValue = `${timestamp}`;

  before(function() {
    cy.wait(1000); // see comment/doc of getLanguageSpecific
    // setSingleHUsDocTypeAsDefault();
    cy.fixture('product/simple_product.json').then(productJson => {
      Object.assign(new Product(), productJson)
        .setName(productName)
        .setValue(productValue)
        .apply();
    });
  });
  
  it('Create a new single-HU inventory doc', function() {
  cy.fixture('inventory/inventory.json').then(inventoryJson => {
  Object.assign(new SingleInventory(), inventoryJson)
    .setWarehouse()
    .addLine(new InventoryLine().setProduct(productName).setQty(20))
    .apply();
  })
})
})