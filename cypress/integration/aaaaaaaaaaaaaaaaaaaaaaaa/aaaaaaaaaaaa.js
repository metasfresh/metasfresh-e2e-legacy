import { humanReadableNow } from '../../support/utils/utils';
import { Pricesystem } from '../../support/utils/pricesystem';
import { PriceList, PriceListVersion } from '../../support/utils/pricelist';
import { Product, ProductCategory } from '../../support/utils/product';
import { PriceListSchema } from '../../support/utils/price_list_schema';
import { ProductPrices } from '../../page_objects/product_prices';
import { applyFilters, selectNotFrequentFilterWidget, toggleNotFrequentFilters } from '../../support/functions';

// these variables are at the root of the file
const date = humanReadableNow();

// OneFixtureToCreateThemAll
let fixture;

// Price
let priceSystemName;
let priceListName;
let priceListVersionName;
let priceListVersionNameSearch1; // magic from fixture (PLV doesn't have standard name :( )
let priceListVersionNameSearch2; // magic from fixture (PLV doesn't have standard name :( )

// Product
let categoryName;
let productName1;

// Price List Schema
let priceListSchemaName;
let surchargeAmount;

// test
let priceListID;
let originalPriceStd;
let originalPriceLimit;
let originalPriceList;
let originalUOM;
let originalTaxCategory;

describe('Read fixture and prepare test data', function() {
  it('reaaaaaalyyyyyyyyy', function() {
    cy.wait(5000);
  });

  it('Read fixture', function() {
    cy.fixture('price/add_a_product_to_a_pricelist_schema_and_create_a_new_PLV.json').then(fixtureJson => {
      fixture = fixtureJson;
    });
  });

  it('Create PriceSystem', function() {
    const priceSystemJson = fixture['PriceSystem'];
    priceSystemJson.name = priceSystemJson.name + `_${date}`;
    priceSystemName = priceSystemJson.name;

    Object.assign(new Pricesystem(), priceSystemJson).apply();
  });

  it('Create PriceList and Version', function() {
    const priceListJson = fixture['PriceList'];
    priceListJson.name = priceListJson.name + appendDate();
    priceListName = priceListJson.name;
    priceListJson.priceSystem = priceSystemName;

    priceListVersionName = priceListJson.priceListVersions[0].name + appendDate();
    priceListJson.priceListVersions[0].name = priceListVersionName;

    Object.assign(new PriceList(), priceListJson).apply();

    cy.getCurrentWindowRecordId().then(id => (priceListID = id));

    priceListVersionNameSearch1 = new RegExp(priceListName + '.*' + '2019-01-01$'); // magic from fixture (PLV doesn't have standard name :( )
    priceListVersionNameSearch2 = new RegExp(priceListName + '.*' + '2019-01-02$'); // magic from fixture (PLV doesn't have standard name :( )
  });

  it('Create ProductCategory', function() {
    const productCategoryJson = fixture['ProductCategory'];
    productCategoryJson.name = productCategoryJson.name + appendDate();
    categoryName = productCategoryJson.name;

    Object.assign(new ProductCategory(), productCategoryJson).apply();
  });

  it('Create Product1', function() {
    const productJson = fixture['Products'][0];
    productJson.name = productJson.name + appendDate();
    productName1 = productJson.name;

    productJson.category = categoryName;
    productJson.productPrices[0].priceList = priceListName;

    Object.assign(new Product(), productJson).apply();
  });

  it('Create Product2', function() {
    const productJson = fixture['Products'][1];
    productJson.name = productJson.name + appendDate();

    productJson.category = categoryName;
    productJson.productPrices[0].priceList = priceListName;

    Object.assign(new Product(), productJson).apply();
  });

  it('Create Price List Schema', function() {
    const priceListSchemaJson = fixture['PriceListSchema'];
    priceListSchemaJson.name = priceListSchemaJson.name + appendDate();
    priceListSchemaName = priceListSchemaJson.name;

    priceListSchemaJson.lines[0].product = productName1;
    surchargeAmount = priceListSchemaJson.lines[0].surchargeAmount;

    Object.assign(new PriceListSchema(), priceListSchemaJson).apply();
  });
});

describe('Check preconditions', function() {
  it('Expect Product1 has a single Product Price', function() {
    filterProductPricesByProduct(productName1);
    cy.expectNumberOfRows(1);
  });

  it('Expect PLV1 has 2 Product Prices', function() {
    filterProductPricesByPLV(priceListName, priceListVersionNameSearch1);
    cy.expectNumberOfRows(2);
  });

  it('Save initial Product Price data', function() {
    cy.selectNthRow(0).dblclick();
    cy.getStringFieldValue('PriceStd').then(val => {
      originalPriceStd = parseFloat(val);
    });
    cy.getStringFieldValue('PriceLimit').then(val => {
      originalPriceLimit = parseFloat(val);
    });
    cy.getStringFieldValue('PriceList').then(val => {
      originalPriceList = parseFloat(val);
    });
    cy.getStringFieldValue('C_UOM_ID').then(val => {
      originalUOM = val;
    });
    cy.getStringFieldValue('C_TaxCategory_ID').then(val => {
      originalTaxCategory = val;
    });
  });
});

describe('Create new Price List Version from the Price List Schema', function() {
  it('Add the Schema PriceList Version', function() {
    cy.visitWindow('540321', priceListID);

    const plvJson = fixture['PriceListVersionFromPriceListSchema'];
    plvJson.discountSchema = priceListSchemaName;
    plvJson.basisPriceListVersion = priceListVersionName;

    PriceList.applyPriceListVersion(Object.assign(new PriceListVersion(), plvJson));
    cy.expectNumberOfRows(2);
  });

  it('Run action "Create Price List"', function() {
    // the PriceListSchema PLV should always be the first, as its date is the biggest and the default sorting is by ValidFrom, desc
    cy.selectNthRow(0);
    cy.executeHeaderAction('M_PriceList_Create');
    cy.waitForSaveIndicator();
  });

  it('Expect Product1 has 2 Product Prices', function() {
    filterProductPricesByProduct(productName1);
    cy.expectNumberOfRows(2);
  });

  it('Expect PLV1 has 2 Product Prices', function() {
    filterProductPricesByPLV(priceListName, priceListVersionNameSearch1);
    cy.expectNumberOfRows(2);
  });

  it('Expect PLV2 has 1 Product Price', function() {
    filterProductPricesByPLV(priceListName, priceListVersionNameSearch2);
    cy.expectNumberOfRows(1);
  });

  it('Check the new Product Price', function() {
    cy.selectNthRow(0).dblclick();
    cy.getStringFieldValue('PriceStd').should(val => {
      expect(parseFloat(val)).to.be.closeTo(originalPriceStd + surchargeAmount, 0.01);
    });
    cy.getStringFieldValue('PriceLimit').should(val => {
      expect(parseFloat(val)).to.be.closeTo(originalPriceLimit, 0.01);
    });
    cy.getStringFieldValue('PriceList').should(val => {
      expect(parseFloat(val)).to.be.closeTo(originalPriceList, 0.01);
    });
    cy.getStringFieldValue('M_Product_ID').should('contains', productName1);
    cy.getStringFieldValue('M_Product_Category_ID').should('contain', categoryName);
    cy.getStringFieldValue('M_PriceList_Version_ID').should('contain', priceListName);
    cy.getStringFieldValue('C_UOM_ID').should('contain', originalUOM);
    cy.getStringFieldValue('C_TaxCategory_ID').should('contain', originalTaxCategory);
  });
});

function filterProductPricesByProduct(product) {
  cy.visitWindow(ProductPrices.windowId);
  toggleNotFrequentFilters();
  selectNotFrequentFilterWidget('default');
  cy.writeIntoLookupListField('M_Product_ID', product, product, false, false, null, true);
  applyFilters();
}

function filterProductPricesByPLV(priceListName, priceListVersionMatch) {
  cy.visitWindow(ProductPrices.windowId);
  toggleNotFrequentFilters();
  selectNotFrequentFilterWidget('default');
  cy.writeIntoLookupListField('M_PriceList_Version_ID', priceListName, priceListVersionMatch, false, false, null, true);
  applyFilters();
}

function appendDate() {
  return `_${date}`;
}
