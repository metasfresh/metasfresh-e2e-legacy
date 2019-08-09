import { humanReadableNow } from '../../support/utils/utils';
import { Pricesystem } from '../../support/utils/pricesystem';
import { PriceList } from '../../support/utils/pricelist';
import { Product, ProductCategory } from '../../support/utils/product';
import { PriceListSchema } from '../../support/utils/price_list_schema';

// these variables are at the root of the file
const date = humanReadableNow();

// OneFixtureToCreateThemAll
let fixture;

// Price
let priceSystemName;
let priceListName;

// Product
let categoryName;
let productName1;
let productName2;

// Price List Schema
let priceListSchemaName;
let surchargeAmount;

// test
let priceListID;

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

    Object.assign(new PriceList(), priceListJson).apply();

    cy.getCurrentWindowRecordId().then(id => (priceListID = id));
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

    productJson.productPrices[0].priceList = priceListName;

    Object.assign(new Product(), productJson).apply();
  });

  it('Create Product2', function() {
    const productJson = fixture['Products'][1];
    productJson.name = productJson.name + appendDate();
    productName2 = productJson.name;

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

describe('Create Price List Schema for Product', function() {
});

function appendDate() {
  return `_${date}`;
}
