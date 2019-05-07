import { Currency } from '../../support/utils/currency';

describe('Activate Currency USD for Automatic End2End Tests with cypress https://github.com/metasfresh/metasfresh-e2e/issues/76', function() {
  it('Deactivate the currency USD', function() {
    cy.fixture('currency/currency.json').then(currencyJson => {
      Object.assign(new Currency(), currencyJson)
        .setCurrencyID(100) //USD
        .setIsoCode('USD')
        .setActive(false)
        .apply();
    });
  });
  it('Activate the currency USD', function() {
    cy.fixture('currency/currency.json').then(currencyJson => {
      Object.assign(new Currency(), currencyJson)
        .setCurrencyID(100) //USD
        .setIsoCode('USD')
        .setActive(true)
        .apply();
    });
  });
});