// ***********************************************
// This file can be used to create custom Cypress commands
// and overwrite existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Import Cypress types
/// <reference types="cypress" />
/// <reference path="./cypress-commands.d.ts" />

Cypress.Commands.add('generateCreature', (blockNumber: number) => {
  cy.get('#blockNumberInput').clear().type(blockNumber.toString());
  cy.get('#generateButton').click();
  cy.wait('@blockData');
  cy.get('#creatureContainer', { timeout: 10000 }).should('be.visible');
});

Cypress.Commands.add('waitForLoading', () => {
  cy.get('#loadingIndicator').should('not.be.visible');
});

Cypress.Commands.add('getCreatureAttributes', () => {
  return cy.get('#creatureAttributes');
});

Cypress.Commands.add('getCreatureTraits', () => {
  return cy.get('#creatureTraits');
});
