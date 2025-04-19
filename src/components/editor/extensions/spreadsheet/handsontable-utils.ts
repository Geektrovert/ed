import type { JSONContent } from "@tiptap/core";

// Define a type for Handsontable node
export interface HandsontableNode {
	type: string;
	attrs?: {
		id?: string;
		title?: string;
		data?: Array<Array<string | number | null>>;
		[key: string]: unknown;
	};
	content?: JSONContent[];
	[key: string]: unknown;
}

/**
 * Helper to check if a node is a Handsontable node
 */
export function isHandsontableNode(node: unknown): boolean {
	return Boolean(
		node &&
			typeof node === "object" &&
			(node as { type?: string }).type === "handsontableNode",
	);
}

/**
 * Find all Handsontable nodes in the editor content
 */
export function findHandsontableNodes(
	content: JSONContent,
): HandsontableNode[] {
	const result: HandsontableNode[] = [];

	if (!content || !content.content) {
		return result;
	}

	function traverse(node: JSONContent) {
		if (isHandsontableNode(node)) {
			result.push(node as HandsontableNode);
		}

		if (node.content) {
			node.content.forEach(traverse);
		}
	}

	traverse(content);
	return result;
}

/**
 * Extract Handsontable data from editor content
 */
export function extractHandsontableData(
	content: JSONContent,
): Record<string, Array<Array<string | number | null>>> {
	const nodes = findHandsontableNodes(content);
	const result: Record<string, Array<Array<string | number | null>>> = {};

	nodes.forEach((node, index) => {
		// Use the id if available, otherwise use a numeric index
		const id = node.attrs?.id || `table_${index}`;

		if (node.attrs?.data) {
			result[id] = node.attrs.data as Array<Array<string | number | null>>;
		}
	});

	return result;
}

/**
 * Update a specific Handsontable node's data in the document
 */
export function updateHandsontableNodeData(
	content: JSONContent,
	tableId: string,
	newData: Array<Array<string | number | null>>,
): JSONContent {
	if (!content || !content.content) {
		return content;
	}

	// Create a deep copy of the content
	const newContent = JSON.parse(JSON.stringify(content)) as JSONContent;

	function traverse(node: JSONContent): boolean {
		if (isHandsontableNode(node) && node.attrs?.id === tableId) {
			node.attrs.data = newData;
			return true; // Found and updated
		}

		if (node.content) {
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
	updateHandsontableNodeData,
	generateTableId,
};
