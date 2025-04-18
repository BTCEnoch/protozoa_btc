/**
 * Type declaration for JSON modules
 * This allows TypeScript to import JSON files as modules
 */

declare module "*.json" {
  const value: any;
  export default value;
}
