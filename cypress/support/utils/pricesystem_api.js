import config from '../../config';

export default class Pricesystem {
  constructor({ name, ...vals }) {
    cy.log(`Pricesystem - set name = ${name}`);
    this.name = name;

    for (let [key, val] of Object.entries(vals)) {
      this[key] = val;
    }
    return this;
  }

  setDescription(description) {
    cy.log(`Pricesystem - set description = ${description}`);
    this.description = description;
    return this;
  }

  setValue(value) {
    cy.log(`Pricesystem - set value = ${value}`);
    this.value = value;
    return this;
  }

  setActive(isActive) {
    cy.log(`Pricesystem - set isActive = ${isActive}`);
    this.IsActive = isActive;
    return this;
  }

  apply() {
    cy.log(`Pricesystem - apply - START (${this.name})`);
    return Pricesystem.applyPriceSystem(this).then(() => {
      cy.log(`Pricesystem - apply - END (${this.name})`);

      return cy.wrap(this);
    });
  }

  static applyPriceSystem(priceSystem) {
    const basicUri = `${config.API_URL}/window/540320`;

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
        priceSystem.id = newResponse.body[0].id;

        const basicDataObject = [
          {
            op: 'replace',
            path: 'Name',
            value: priceSystem.name,
          },
          {
            op: 'replace',
            path: 'Description',
            value: priceSystem.description,
          },
        ];

        return cy
          .request({
            url: `${basicUri}/${priceSystem.id}`,
            method: 'PATCH',
            body: JSON.stringify(basicDataObject),
            headers: {
              'Content-Type': 'application/json',
            },
          })
          .then(() => priceSystem);
      });
  }
}
