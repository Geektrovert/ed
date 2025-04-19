import { registerAllModules } from "handsontable/registry";
import { HyperFormula } from "hyperformula";

// Register all Handsontable modules
registerAllModules();

// Create a shared HyperFormula instance to be used across tables if needed
export const createHyperFormulaInstance = () => {
  return HyperFormula.buildEmpty({
    licenseKey: "internal-use-in-handsontable",
  });
};

// Helper to create basic configuration for Handsontable
export const createDefaultConfig = (options: any = {}) => {
  return {
    colHeaders: true,
    rowHeaders: true,
    height: "auto",
    width: "100%",
    licenseKey: "non-commercial-and-evaluation",
    ...options,
  };
};

// Helper to create a formula configuration
export const createFormulasConfig = (
  namedExpressions: Array<{ name: string; expression: string | number }> = []
) => {
  return {
    engine: HyperFormula,
    namedExpressions,
  };
};

// Process table data from serialized content
export const processTableData = (data: any) => {
  if (!data || !Array.isArray(data)) {
    return [["", "", ""], ["", "", ""], ["", "", ""]];
  }
  return data;
};

export default {
  createHyperFormulaInstance,
  createDefaultConfig,
  createFormulasConfig,
  processTableData,
}; 