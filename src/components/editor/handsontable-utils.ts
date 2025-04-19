import { type JSONContent } from "novel";

/**
 * Helper to check if a node is a Handsontable node
 */
export function isHandsontableNode(node: any): boolean {
  return node && node.type === "handsontableNode";
}

/**
 * Find all Handsontable nodes in the editor content
 */
export function findHandsontableNodes(content: JSONContent): any[] {
  const result: any[] = [];
  
  if (!content || !content.content) {
    return result;
  }
  
  function traverse(node: any) {
    if (isHandsontableNode(node)) {
      result.push(node);
    }
    
    if (node.content && Array.isArray(node.content)) {
      node.content.forEach(traverse);
    }
  }
  
  traverse(content);
  return result;
}

/**
 * Extract Handsontable data from editor content
 */
export function extractHandsontableData(content: JSONContent): Record<string, any> {
  const nodes = findHandsontableNodes(content);
  const result: Record<string, any> = {};
  
  nodes.forEach((node, index) => {
    const id = node.attrs?.id || `table-${index}`;
    result[id] = {
      data: node.attrs?.data || [],
      formulas: node.attrs?.formulas || [],
      namedExpressions: node.attrs?.namedExpressions || [],
      config: node.attrs?.config || {}
    };
  });
  
  return result;
}

/**
 * Update a specific Handsontable node in the editor content
 */
export function updateHandsontableNode(
  content: JSONContent, 
  tableId: string, 
  newData: any[][]
): JSONContent {
  if (!content || !content.content) {
    return content;
  }
  
  const newContent = JSON.parse(JSON.stringify(content)) as JSONContent;
  
  function traverse(node: any): boolean {
    if (isHandsontableNode(node) && (node.attrs?.id === tableId)) {
      node.attrs.data = newData;
      return true;
    }
    
    if (node.content && Array.isArray(node.content)) {
      for (let i = 0; i < node.content.length; i++) {
        if (traverse(node.content[i])) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  traverse(newContent);
  return newContent;
}

/**
 * Generate a unique ID for a Handsontable node
 */
export function generateTableId(): string {
  return `table-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export default {
  isHandsontableNode,
  findHandsontableNodes,
  extractHandsontableData,
  updateHandsontableNode,
  generateTableId
}; 