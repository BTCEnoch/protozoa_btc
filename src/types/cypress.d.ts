/**
 * Type definitions for Cypress
 *
 * This file provides minimal type definitions for Cypress to prevent TypeScript errors
 * when running Jest tests that include Cypress test files.
 */

declare namespace Cypress {
  interface Chainable<Subject> {
    visit(url: string, options?: any): Chainable<Subject>
    get(selector: string, options?: any): Chainable<Subject>
    type(text: string, options?: any): Chainable<Subject>
    click(options?: any): Chainable<Subject>
    wait(alias: string, options?: any): Chainable<Subject>
    should(chainer: string, value?: any): Chainable<Subject>
    intercept(method: string, url: string, response?: any): Chainable<Subject>
    as(alias: string): Chainable<Subject>
    clear(): Chainable<Subject>

    // Custom commands
    generateCreature(blockNumber: number): Chainable<any>
    waitForLoading(): Chainable<any>
    getCreatureAttributes(): Chainable<any>
    getCreatureTraits(): Chainable<any>
  }

  // Add Commands interface to fix TypeScript errors
  interface Commands {
    add<T = any>(name: string, fn: (this: CommandFnThis, ...args: any[]) => T): void
  }
}

declare namespace Cypress {
  interface CommandFnThis {
    [key: string]: any
  }
}

declare const cy: Cypress.Chainable<any>
declare const Cypress: {
  Commands: Cypress.Commands
  [key: string]: any
}
