import config from '../../config';
import { wrapRequest, findByName } from './utils';

export default class SalesOrder {
  constructor({ reference, ...vals }) {
    cy.log(`SalesOrder - set reference = ${reference}`);
    this.reference = reference;
    this.lines = [];

    for (let [key, val] of Object.entries(vals)) {
      this[key] = val;
    }
    return this;
  }

  setBPartner(bPartner) {
    cy.log(`SalesOrder - setBPartner = ${bPartner}`);
    this.bPartner = bPartner;
    return this;
  }

  addLine(salesOrderLine) {
    this.lines.push(salesOrderLine);
    return this;
  }

  setBPartnerLocation(location) {
    cy.log(`SalesOrder - setBPartnerLocation = ${location}`);
    this.bPartnerLocation = location;
    return this;
  }

  setInvoicePartner(invoicePartner) {
    cy.log(`SalesOrder - setInvoicePartner = ${invoicePartner}`);
    this.invoicePartner = invoicePartner;
    return this;
  }

  setInvoicePartnerLocation(location) {
    cy.log(`SalesOrder - setInvoicePartnerLocation = ${location}`);
    this.invoicePartnerLocation = location;
    return this;
  }

  setPoReference(reference) {
    cy.log(`SalesOrder - setReference = ${reference}`);
    this.reference = reference;
    return this;
  }

  setWarehouse(warehouse) {
    cy.log(`SalesOrder - setWarehouse = ${warehouse}`);
    this.warehouse = warehouse;
    return this;
  }

  setPriceSystem(priceSystem) {
    cy.log(`SalesOrder - priceSystem = ${priceSystem}`);
    this.priceSystem = priceSystem;
    return this;
  }

  apply() {
    cy.log(`SalesOrder - apply - START (${this.reference})`);
    return SalesOrder.applySalesOrder(this).then(() => {
      cy.log(`SalesOrder - apply - END (${this.reference})`);

      if (this.lines.length) {
        cy.visitWindow(143, this.id);

        // @TODO: Temporarily we're adding order lines manually
        SalesOrder.applyLines(this);
      }

      return cy.wrap(this);
    });
  }

  static applySalesOrder(salesOrder) {
    const basicUri = `${config.API_URL}/window/143`;

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
        salesOrder.id = newResponse.body[0].id;

        SalesOrder.getData(basicUri, salesOrder).then(data => {
          const dataObject = [
            {
              op: 'replace',
              path: 'POReference',
              value: salesOrder.reference,
            },
            ...data,
          ];

          return cy
            .request({
              url: `${basicUri}/${salesOrder.id}`,
              method: 'PATCH',
              body: JSON.stringify(dataObject),
              headers: {
                'Content-Type': 'application/json',
              },
            })
            .then(() => salesOrder);
        });
      });
  }

  static getData(basicUri, salesOrder) {
    const dataObject = [];

    const bPartnerRequest = wrapRequest(
      cy.request({
        url: `${basicUri}/${salesOrder.id}/field/C_BPartner_ID/typeahead`,
        method: 'GET',
        qs: {
          query: salesOrder.bPartner,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      })
    );

    const bPartnerLocationRequest = wrapRequest(
      cy.request({
        url: `${basicUri}/${salesOrder.id}/field/C_BPartner_Location_ID/dropdown`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    );

    const invoicePartnerRequest = wrapRequest(
      cy.request({
        url: `${basicUri}/${salesOrder.id}/field/Bill_BPartner_ID/typeahead`,
        method: 'GET',
        qs: {
          query: salesOrder.bPartner,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      })
    );

    const invoicePartnerLocationRequest = wrapRequest(
      cy.request({
        url: `${basicUri}/${salesOrder.id}/field/Bill_Location_ID/dropdown`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    );

    const warehouseRequest = wrapRequest(
      cy.request({
        url: `${basicUri}/${salesOrder.id}/field/M_Warehouse_ID/dropdown`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    );

    const priceSystemRequest = wrapRequest(
      cy.request({
        url: `${basicUri}/${salesOrder.id}/field/M_PricingSystem_ID/dropdown`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    );

    return Cypress.Promise.all([bPartnerRequest, bPartnerLocationRequest, invoicePartnerRequest, invoicePartnerLocationRequest, warehouseRequest, priceSystemRequest]).then(vals => {
      const [bPartnerResponse, bPartnerLocationResponse, invoicePartnerResponse, invoicePartnerLocationResponse, warehouseResponse, priceSystemResponse] = vals;

      const bPartner = findByName(bPartnerResponse, salesOrder.bPartner);
      if (salesOrder.bPartner && bPartner) {
        dataObject.push({
          op: 'replace',
          path: 'C_BPartner_ID',
          value: {
            key: bPartner.key,
            caption: bPartner.caption,
          },
        });
      }

      const location = findByName(bPartnerLocationResponse, salesOrder.bPartnerLocation);
      if (salesOrder.bPartnerLocation && location) {
        dataObject.push({
          op: 'replace',
          path: 'C_BPartner_Location_ID',
          value: {
            key: location.key,
            caption: location.caption,
          },
        });
      }

      const invoicePartner = findByName(invoicePartnerResponse, salesOrder.invoicePartner);
      if (salesOrder.invoicePartner && invoicePartner) {
        dataObject.push({
          op: 'replace',
          path: 'Bill_BPartner_ID',
          value: {
            key: invoicePartner.key,
            caption: invoicePartner.caption,
          },
        });
      }

      const invoicePartnerLocation = findByName(invoicePartnerLocationResponse, salesOrder.invoicePartnerLocation);
      if (salesOrder.invoicePartnerLocation && invoicePartnerLocation) {
        dataObject.push({
          op: 'replace',
          path: 'Bill_Location_ID',
          value: {
            key: invoicePartnerLocation.key,
            caption: invoicePartnerLocation.caption,
          },
        });
      }

      const warehouse = findByName(warehouseResponse, salesOrder.warehouse);
      if (salesOrder.warehouse && warehouse) {
        dataObject.push({
          op: 'replace',
          path: 'M_Warehouse_ID',
          value: {
            key: warehouse.key,
            caption: warehouse.caption,
          },
        });
      }

      const priceSystem = findByName(priceSystemResponse, salesOrder.priceSystem);
      if (salesOrder.priceSystem && priceSystem) {
        dataObject.push({
          op: 'replace',
          path: 'M_PricingSystem_ID',
          value: {
            key: priceSystem.key,
            caption: priceSystem.caption,
          },
        });
      }

      return dataObject;
    });
  }

  static applyLines(salesOrder) {
    salesOrder.lines.forEach(line => {
      cy.selectTab('C_OrderLine');
      cy.pressAddNewButton();

      cy.writeIntoLookupListField('M_Product_ID', line.product, line.product, false /*typeList*/, true /*modal*/);
      cy.writeIntoStringField('QtyEntered', line.quantity, true /*modal*/, null /*rewriteUrl*/, true /*noRequest, bc the patch response is e.g. 20 and we would be waiting for e.g. '20' */);

      cy.pressDoneButton();
    });
  }
}

export class SalesOrderLine {
  setProduct(product) {
    this.product = product;
    return this;
  }

  setQuantity(quantity) {
    this.quantity = quantity;
    return this;
  }
}
