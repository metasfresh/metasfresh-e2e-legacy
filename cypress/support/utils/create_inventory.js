import { getLanguageSpecific } from '../../support/utils/utils';
import { inventory } from '../../page_objects/inventory';

export class InventoryLine {
    
    setProduct(productName){
        this.productName = productName;
        return this;
    }

    setQty(qty){
        this.qty = qty.toString();
        return this;
    }

}

export class SingleInventory{
  
    setWarehouse(){
        cy.visitWindow(inventory.windowId, 'NEW', 'newInventoryRecord');
        cy.fixture('inventory/inventory.json').then(inventoryJson => {
            cy.getStringFieldValue('C_DocType_ID').then(docTypeName => {
              expect(docTypeName).to.eq(getLanguageSpecific(inventoryJson, 'singleHUInventoryDocTypeName')); /// <<====
            });
      
            // set warehouse by its language-specific name
            cy.selectInListField('M_Warehouse_ID', inventoryJson.warehouseName);
          });
          return this;
    }
    


    addLine( new_inventory ){
        cy.selectTab('M_InventoryLine');
        cy.pressAddNewButton();
        cy.getStringFieldValue('HUAggregationType', true /*modal*/).then(huAggregationType => {
            expect(huAggregationType).to.eq('Single HU'); /// <<====
        });
        cy.writeIntoLookupListField('M_Product_ID', new_inventory.productName, new_inventory.productName, false /*typeList*/, true /*modal*/);
        cy.fixture('product/simple_product.json').then(productJson => {
            const uomName = getLanguageSpecific(productJson, 'c_uom');
            cy.writeIntoLookupListField('C_UOM_ID', uomName, uomName, false /*typeList*/, true /*modal*/);
        });
        cy.writeIntoLookupListField('M_Locator_ID', '0_0_0', '0_0_0', true /*typeList*/, true /*modal*/);
        cy.writeIntoStringField('QtyCount', new_inventory.qty , true /*modal*/);
        cy.clickOnCheckBox('IsCounted', true, true /*modal*/);
        cy.pressDoneButton();
        cy.fixture('misc/misc_dictionary.json').then(miscDictionary => {
            cy.processDocument(
                getLanguageSpecific(miscDictionary, 'docActionComplete'),
                getLanguageSpecific(miscDictionary, 'docStatusCompleted')
            );
        });
        return this;
    }

    apply(){
        // make sure that the inventory line has an HU (created on completion)
        cy.selectTab('M_InventoryLine');
        cy.selectSingleTabRow();
        cy.openAdvancedEdit();
        cy.getStringFieldValue('M_HU_ID', true /*modal*/) /// <<====
            .then(huValue => {
                expect(huValue).to.be.not.null;
            });
        cy.pressDoneButton();
        cy.get('@newInventoryRecord').then(newInventoryRecord => {
            inventory.toMatchSnapshots(newInventoryRecord, 'inventory_singleHU');
    });
    return this;
  }
}