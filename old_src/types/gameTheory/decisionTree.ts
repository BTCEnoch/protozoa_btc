/**
 * Decision Tree Types
 * 
 * This file defines types for decision trees used in game theory calculations.
 */

/**
 * Decision node interface
 * Represents a node in a decision tree
 */
export interface DecisionNode {
  id: string;
  decision: string;
  condition?: (state: any) => boolean;
  payoff?: number;
  children?: DecisionNode[];
}

/**
 * Decision path interface
 * Represents a path through a decision tree
 */
export interface DecisionPath {
  nodes: DecisionNode[];
  totalPayoff: number;
}

/**
 * Decision tree interface
 * Represents a complete decision tree
 */
export interface DecisionTree {
  root: DecisionNode;
  evaluate: (state: any) => DecisionPath;
}

/**
 * Create a new decision node
 * @param id Node ID
 * @param decision Decision description
 * @param options Optional parameters (condition, payoff, children)
 * @returns A new DecisionNode object
 */
export function createDecisionNode(
  id: string,
  decision: string,
  options?: {
    condition?: (state: any) => boolean;
    payoff?: number;
    children?: DecisionNode[];
  }
): DecisionNode {
  return {
    id,
    decision,
    condition: options?.condition,
    payoff: options?.payoff,
    children: options?.children
  };
}

/**
 * Create a new decision tree
 * @param root Root node of the tree
 * @returns A new DecisionTree object
 */
export function createDecisionTree(root: DecisionNode): DecisionTree {
  return {
    root,
    evaluate: (state: any) => {
      // Default implementation - can be overridden
      const path: DecisionNode[] = [];
      let currentNode = root;
      let totalPayoff = 0;
      
      while (currentNode) {
        path.push(currentNode);
        
        if (currentNode.payoff !== undefined) {
          totalPayoff += currentNode.payoff;
        }
        
        if (!currentNode.children || currentNode.children.length === 0) {
          break;
        }
        
        // Find the first child whose condition is true
        const nextNode = currentNode.children.find(child => 
          !child.condition || child.condition(state)
        );
        
        if (!nextNode) {
          break;
        }
        
        currentNode = nextNode;
      }
      
      return {
        nodes: path,
        totalPayoff
      };
    }
  };
}
