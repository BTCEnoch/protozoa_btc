/**
 * Decision Tree Types for Bitcoin Protozoa
 * 
 * This file defines the types for decision trees in game theory.
 */

/**
 * Decision node interface
 * Represents a node in a decision tree
 */
export interface DecisionNode {
  // Unique identifier for the node
  id: string;
  
  // The decision to be made at this node
  decision: string;
  
  // Available choices at this node
  choices: string[];
  
  // Payoffs for each choice
  payoffs: {
    [choice: string]: number;
  };
  
  // Child nodes for each choice
  children?: {
    [choice: string]: DecisionNode;
  };
}

/**
 * Decision path interface
 * Represents a path through a decision tree
 */
export interface DecisionPath {
  // The sequence of decisions made
  decisions: {
    nodeId: string;
    choice: string;
  }[];
  
  // The total payoff for this path
  totalPayoff: number;
}

/**
 * Decision tree interface
 * Represents a decision tree for game theory
 */
export interface DecisionTree {
  // The root node of the tree
  root: DecisionNode;
  
  // Evaluate the tree to find the optimal path
  evaluate: (state: any) => DecisionPath;
}
