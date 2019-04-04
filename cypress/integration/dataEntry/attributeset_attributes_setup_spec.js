describe('Create a Attribute Set and Attributes for it', function() {
  before(function() {
    // login before each test
    cy.loginByForm();
  });

  it('Create a new Attribute Set and Attributes', function() {

    //create Attribute1
    cy.visit('/window/260/NEW');
    cy.writeIntoStringField('Name', 'TestAttribute1');
    cy.writeIntoStringField('Description', 'TestAttribute1');
    cy.writeIntoStringField('Value', 'TestAttribute1');
    

    cy.get('.form-field-AttributeValueType')
      .find('input')
      .type('L');
    cy.get('.input-dropdown-list').should('exist');
    cy.contains('.input-dropdown-list-option', 'List').click();

    cy.get('.form-field-IsInstanceAttribute')
      .find('.input-checkbox-tick')
      .click()
    
    cy.get('.form-field-IsPricingRelevant')
      .find('.input-checkbox-tick')
      .click()

    cy.get('.form-field-IsStorageRelevant')
      .find('.input-checkbox-tick')
      .click()

    cy.get('.form-field-IsAttrDocumentRelevant')
      .find('.input-checkbox-tick')
      .click()


   //create AttributeValue1
    cy.pressAddNewButton();
    cy.writeIntoStringField('Name', 'TestAttributeName1',true);
    cy.writeIntoStringField('Value', 'TestAttributeValue1',true);
    cy.pressDoneButton();


   //create AttributeSet1
   cy.visit('/window/256/NEW');
   cy.writeIntoStringField('Name', 'TestAttributeSet1');

   cy.get('.form-field-MandatoryType')
     .find('input')
     .type('N');
   cy.get('.input-dropdown-list').should('exist');
   cy.contains('.input-dropdown-list-option', 'Not Mandatary').click();

   cy.pressAddNewButton();
   cy.get('.form-field-M_Attribute_ID')
     .find('input')
     .type('T')
   cy.get('.input-dropdown-list').should('exist');
   cy.contains('.input-dropdown-list-option', 'TestAttribute1_TestAttribute1').click();
   cy.pressDoneButton();

 });
});

