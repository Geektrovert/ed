import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { HandsontableView } from "./handsontable-view";
import { generateTableId } from "./handsontable-utils";

import "handsontable/styles/handsontable.css";
import "handsontable/styles/ht-theme-main.css";

import "./handsontable-custom.css";

export const HandsontableNode = Node.create({
  name: "handsontableNode",
  
  group: "block",
  
  // Setting content to empty string instead of null to properly serialize
  content: "",
  
  // Still mark as atomic - it can't contain other nodes
  atom: true,
  
  draggable: true,
  
  inline: false,
  
  // Add selectable property
  selectable: true,
  
  // Add isolated property
  isolating: true,
  
  parseHTML() {
    return [
      {
        tag: "div[data-type='handsontable']",
      },
    ];
  },
  
  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, any> }) {
    const id = HTMLAttributes.id || generateTableId();
    const title = HTMLAttributes.title || "Spreadsheet";
    
    // Create a self-closing div tag for the Handsontable container
    return [
      "div",
      mergeAttributes(HTMLAttributes, { 
        "data-type": "handsontable",
        "data-id": id,
        "data-title": title,
        "class": "handsontable-placeholder"
      })
    ];
  },
  
  addAttributes() {
    return {
      // Unique ID for the table
      id: {
        default: generateTableId(),
      },
      // Title for the spreadsheet
      title: {
        default: "Spreadsheet",
      },
      // Store the table data
      data: {
        default: [["", "", ""], ["", "", ""], ["", "", ""]]
      },
      // Store formula definitions
      formulas: {
        default: []
      },
      // Store named expressions
      namedExpressions: {
        default: []
      },
      // Store table config
      config: {
        default: {
          colHeaders: true,
          rowHeaders: true,
          height: "auto",
          licenseKey: "non-commercial-and-evaluation",
          width: "100%",
        }
      }
    };
  },
  
  addNodeView() {
    return ReactNodeViewRenderer(HandsontableView as any);
  },
  
  // Define how this node should be serialized to JSON
  toJSON() {
    return {
      type: this.name,
      attrs: this.attrs,
    }
  },
  
  addKeyboardShortcuts() {
    return {
      // Prevent default behavior when inside the table
      // These can be customized as needed
      "Mod-z": () => true,
      "Shift-Mod-z": () => true,
      "Tab": () => true,
      "Shift-Tab": () => true,
    };
  },
}); 