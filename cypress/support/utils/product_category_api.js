import config from '../../config';
import { wrapRequest, findByName } from './utils';

export default class ProductCategory {
  constructor({ name, ...vals }) {
    cy.log(`Product Category - set name = ${name}`);
    this.name = name;

    for (let [key, val] of Object.entries(vals)) {
      this[key] = val;
    }
    return this;
  }

  setName(name) {
    cy.log(`Product Category - set name = ${name}`);
    this.name = name;
    return this;
  }

  setAttributeSet(attributeSet) {
    cy.log(`Product Category - set attributeSet = ${attributeSet}`);
    this.attributeSet = attributeSet;
    return this;
  }

  apply() {
    cy.log(`ProductCategory - apply - START (${this.name})`);
    return ProductCategory.applyProductCategory(this).then(() => {
      cy.log(`ProductCategory - apply - END (${this.name})`);

      return cy.wrap(this);
    });
  }

  static applyProductCategory(productCategory) {
    const basicUri = `${config.API_URL}/window/144`;

    return cy
      .request({
        url: `${basicUri}/NEW`,
        method: 'PATCH',
        body: JSON.stringify([]),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then(newResponse => {
        productCategory.id = newResponse.body[0].id;

        ProductCategory.getData(basicUri, productCategory).then(data => {
          const dataObject = [
            {
              op: 'replace',
              path: 'Name',
              value: productCategory.name,
            },
            {
              op: 'replace',
              path: 'Value',
              value: productCategory.name,
            },
            ...data,
          ];

          console.log('DATAOBJECT: ', dataObject)

          return cy
            .request({
              url: `${basicUri}/${productCategory.id}`,
              method: 'PATCH',
              body: JSON.stringify(dataObject),
              headers: {
                'Content-Type': 'application/json',
              },
            })
            .then(() => productCategory);
        });
      });
  }

  static getData(basicUri, productCategory) {
    const dataObject = [];

    const attributeSetRequest = wrapRequest(
      cy.request({
        url: `${basicUri}/${productCategory.id}/field/M_AttributeSet_ID/dropdown`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    );

    return Cypress.Promise.all([attributeSetRequest]).then(vals => {
      const [attributeSetResponse] = vals;

      const attributeSet = findByName(attributeSetResponse, productCategory.attributeSet);
      if (productCategory.attributeSet && attributeSet) {
        dataObject.push({
          op: 'replace',
          path: 'M_AttributeSet_ID',
          value: {
            key: attributeSet.key,
            caption: attributeSet.caption,
          },
        });
      }

      return dataObject;
    });
  }
}
