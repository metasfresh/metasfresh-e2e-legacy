import { humanReadableNow } from '../../support/utils/utils';
import { Pricesystem } from '../../support/utils/pricesystem';
import { PriceList } from '../../support/utils/pricelist';
import { Product, ProductCategory, ProductPrice } from '../../support/utils/product';

// these variables are at the root of the file
const date = humanReadableNow();

// OneFixtureToCreateThemAll
let fixture;

// Price
let priceSystemName;
let priceListName;

// // Product
// let categoryName;
// let productName1;
// let productName2;
// let productType;

// test
let priceListID;

describe('Read fixture and prepare test data', function() {
  it('Read fixture', function() {
    cy.fixture('price/add_a_product_to_a_pricelist_schema_and_create_a_new_PLV.json').then(fixtureJson => {
      fixture = fixtureJson;
    });
  });

  it('Create Price', function() {
    const priceSystemJson = fixture['PriceSystem'];
    priceSystemJson.name = priceSystemJson.name + `_${date}`;
    priceSystemName = priceSystemJson.name;

    const priceListJson = fixture['PriceList'];
    priceListJson.name = priceListJson.name + appendDate();
    priceListName = priceListJson.name;

    Builder2.createPriceEntities(priceSystemJson, priceListJson);

    cy.getCurrentWindowRecordId().then(id => (priceListID = id));
  });

  // it('Create Product1 and Category', function() {
  //   const productCategoryJson = fixture['ProductCategory'];
  //   productCategoryJson.name = productCategoryJson + appendDate();
  //   categoryName = productCategoryJson.name;
  //
  //
  //   Builder2.createProductEntities(productCategoryJson, priceListName, productName1, productName1, productType);
  // });
});

function appendDate() {
  return `_${date}`;
}

class Builder2 {
  // static createProductEntities(productCategoryJson) {
  //   cy.fixture('product/simple_productCategory.json').then(productCategoryJson => {
  //     Object.assign(new ProductCategory(), productCategoryJson).apply();
  //   });
  //
  //   let productPrice;
  //   cy.fixture('product/product_price.json').then(productPriceJson => {
  //     productPrice = Object.assign(new ProductPrice(), productPriceJson).setPriceList(priceListName);
  //   });
  //
  //   cy.fixture('product/simple_product.json').then(productJson => {
  //     Object.assign(new Product(), productJson)
  //       .setName(productName)
  //       .setValue(productValue)
  //       .setProductType(productType)
  //       .setProductCategory(productCategoryValue + '_' + productCategoryName)
  //       .addProductPrice(productPrice)
  //       .apply();
  //   });
  // }

  static createPriceEntities(priceSystemJson, priceListJson) {
    Object.assign(new Pricesystem(), priceSystemJson).apply();

    Object.assign(new PriceList(), priceListJson)
      .setPriceSystem(priceSystemJson.name)
      .apply();
  }

}
