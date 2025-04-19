import { HotTable } from "@handsontable/react-wrapper";
import type { HotTableRef } from "@handsontable/react-wrapper";
import { NodeViewWrapper } from "@tiptap/react";
import type { CellChange, ChangeSource } from "handsontable/common";
import { useCallback, useEffect, useRef, useState } from "react";
import "handsontable/styles/handsontable.css";
import "handsontable/styles/ht-theme-main.css";
import { cx } from "class-variance-authority";
import { useDebouncedCallback } from "use-debounce";
import {
	createDefaultConfig,
	createFormulasConfig,
	processTableData,
} from "./handsontable-setup";
import { generateTableId } from "./handsontable-utils";

type NamedExpression = {
	name: string;
	expression: string | number;
};

interface TableConfig {
	colHeaders: boolean;
	rowHeaders: boolean;
	height: string | number;
	width?: string | number;
	licenseKey?: string;
}

interface NodeAttributes {
	id?: string;
	title?: string;
	data?: Array<Array<string | number | null>>;
	config?: TableConfig;
	namedExpressions?: NamedExpression[];
}

interface NodeViewProps {
	node: {
		attrs: NodeAttributes;
	};
	updateAttributes: (attrs: Partial<NodeAttributes>) => void;
}

// Use proper interfaces instead of 'any'
export const HandsontableView = (props: NodeViewProps) => {
	const { node, updateAttributes } = props;
	const hotRef = useRef<HotTableRef>(null);
	const [isReady, setIsReady] = useState(false);
	const [tableTitle, setTableTitle] = useState(
		node.attrs.title || "Spreadsheet",
	);

	// Use refs for tracking updates to avoid re-renders
	const isDirtyRef = useRef(false);
	const isPendingUpdateRef = useRef(false);
	const isInitialLoadRef = useRef(true);
	const dataUpdateInProgressRef = useRef(false);
	const isDestroyedRef = useRef(false);

	// Get table ID or generate one if missing
	const tableId = node.attrs.id || generateTableId();

	// Process table data using our helper
	const tableData = processTableData(node.attrs.data);

	// Get table config or use defaults
	const tableConfig = node.attrs.config || createDefaultConfig();

	// Prepare named expressions for HyperFormula
	const namedExpressions = (node.attrs.namedExpressions || []).map(
		(item: NamedExpression) => ({
			name: item.name,
			expression: item.expression,
		}),
	);

	// Create formulas config
	const formulasConfig = createFormulasConfig(namedExpressions);

	// Create a debounced version of updateAttributes
	const debouncedUpdateAttributes = useDebouncedCallback(
		(attrs: Partial<NodeAttributes>) => {
			updateAttributes(attrs);
			isPendingUpdateRef.current = false;
		},
		150,
	);

	// Update table data without triggering state changes
	const updateTableData = useCallback(() => {
		if (
			!hotRef.current?.hotInstance ||
			isDestroyedRef.current ||
			!isDirtyRef.current ||
			isPendingUpdateRef.current ||
			dataUpdateInProgressRef.current
		) {
			return;
		}

		const data = hotRef.current.hotInstance.getData();
		if (!data || !Array.isArray(data)) return;

		// Skip update if data hasn't changed
		const dataStr = JSON.stringify(data);
		const nodeDataStr = JSON.stringify(node.attrs.data || []);

		if (dataStr === nodeDataStr) {
			isDirtyRef.current = false;
			return;
		}

		// Set flags to prevent recursive updates
		isPendingUpdateRef.current = true;

		// Update the attributes with the new data
		debouncedUpdateAttributes({
			id: tableId,
			title: tableTitle,
			data,
		});

		isDirtyRef.current = false;
	}, [debouncedUpdateAttributes, node.attrs.data, tableId, tableTitle]);

	// Handler for handling the afterChange event safely
	const handleHotChange = useCallback(
		(changes: CellChange[] | null, source: ChangeSource) => {
			if (
				!changes ||
				source === "loadData" ||
				isInitialLoadRef.current ||
				dataUpdateInProgressRef.current
			) {
				return;
			}

			isDirtyRef.current = true;

			// Use setTimeout to break the React render cycle
			setTimeout(() => {
				updateTableData();
			}, 0);
		},
		[updateTableData],
	);

	// Handle structure changes (rows/columns added or removed)
	const handleStructureChange = useCallback(() => {
		if (isInitialLoadRef.current || dataUpdateInProgressRef.current) return;

		isDirtyRef.current = true;

		// Use setTimeout to break the React render cycle
		setTimeout(() => {
			updateTableData();
		}, 0);
	}, [updateTableData]);

	// Handle title changes
	const handleTitleChange = useCallback(
		(e: React.FocusEvent<HTMLInputElement>) => {
			const newTitle = e.target.value || "Spreadsheet";
			setTableTitle(newTitle);
			updateAttributes({ title: newTitle });
		},
		[updateAttributes],
	);

	// Initial setup effect - runs once
	useEffect(() => {
		// Ensure ID is set
		if (!node.attrs.id) {
			updateAttributes({ id: tableId });
		}

		// Ensure title is set
		if (!node.attrs.title) {
			updateAttributes({ title: tableTitle });
		}

		setIsReady(true);

		return () => {
			isDestroyedRef.current = true;
			if (hotRef.current?.hotInstance) {
				hotRef.current.hotInstance.destroy();
			}
			debouncedUpdateAttributes.cancel();
		};
	}, [
		node.attrs.id,
		node.attrs.title,
		tableId,
		tableTitle,
		updateAttributes,
		debouncedUpdateAttributes,
	]);

	// Effect to setup event listeners
	useEffect(() => {
		if (!isReady || !hotRef.current) return;

		const hot = hotRef.current.hotInstance;
		if (!hot) return;

		// Make sure the table has the latest data from the node
		if (tableData && Array.isArray(tableData)) {
			dataUpdateInProgressRef.current = true;
			isInitialLoadRef.current = true;

			// Add safety check to ensure hot instance exists and isn't destroyed
			const safelyLoadData = () => {
				if (hotRef.current?.hotInstance && !isDestroyedRef.current) {
					try {
						hotRef.current.hotInstance.loadData(tableData);

						// Reset flags after data is loaded
						setTimeout(() => {
							isInitialLoadRef.current = false;
							dataUpdateInProgressRef.current = false;
						}, 50);
					} catch (error) {
						console.error(
							`[HandsontableView ${tableId}] Error loading data:`,
							error,
						);
						dataUpdateInProgressRef.current = false;
						isInitialLoadRef.current = false;
					}
				} else {
					dataUpdateInProgressRef.current = false;
					isInitialLoadRef.current = false;
				}
			};

			// Delay the loadData call slightly to ensure the component is fully mounted
			setTimeout(safelyLoadData, 0);
		}

		// Setup event listeners directly on the hot instance
		const directHandleAfterChange = (
			changes: CellChange[] | null,
			source: ChangeSource,
		) => {
			handleHotChange(changes, source);
		};

		const directHandleFormulasUpdate = () => {
			if (isInitialLoadRef.current || dataUpdateInProgressRef.current) return;

			try {
				const formulasPlugin = hot.getPlugin("formulas");
				if (formulasPlugin?.engine) {
					isDirtyRef.current = true;

					// Use setTimeout to break the React render cycle
					setTimeout(() => {
						updateTableData();
					}, 0);
				}
			} catch (error) {
				console.error(
					`[HandsontableView ${tableId}] Error updating formulas:`,
					error,
				);
			}
		};

		const directHandleStructureChange = () => {
			handleStructureChange();
		};

		// Add hooks with direct handler references
		hot.addHook("afterChange", directHandleAfterChange);
		hot.addHook("afterFormulasValuesUpdate", directHandleFormulasUpdate);
		hot.addHook("afterCreateCol", directHandleStructureChange);
		hot.addHook("afterCreateRow", directHandleStructureChange);
		hot.addHook("afterRemoveCol", directHandleStructureChange);
		hot.addHook("afterRemoveRow", directHandleStructureChange);

		// Clean up hooks
		return () => {
			if (hot && !isDestroyedRef.current) {
				try {
					hot.removeHook("afterChange", directHandleAfterChange);
					hot.removeHook(
						"afterFormulasValuesUpdate",
						directHandleFormulasUpdate,
					);
					hot.removeHook("afterCreateCol", directHandleStructureChange);
					hot.removeHook("afterCreateRow", directHandleStructureChange);
					hot.removeHook("afterRemoveCol", directHandleStructureChange);
					hot.removeHook("afterRemoveRow", directHandleStructureChange);
				} catch (error) {
					console.error(
						`[HandsontableView ${tableId}] Error removing hooks:`,
						error,
					);
				}
			}
		};
	}, [
		isReady,
		handleHotChange,
		handleStructureChange,
		tableData,
		updateTableData,
		tableId,
	]);

	return (
		<NodeViewWrapper
			className={cx("handsontable-wrapper", "prose-lg w-full overflow-hidden")}
			data-table-id={tableId}
		>
			<div className="bg-muted/20 dark:bg-muted/10 rounded-t-md px-3 py-2 border border-border flex items-center justify-between">
				<input
					type="text"
					value={tableTitle}
					onChange={(e) => setTableTitle(e.target.value)}
					onBlur={handleTitleChange}
					className="bg-transparent border-0 outline-none focus:ring-0 p-0 text-sm font-medium text-foreground placeholder:text-muted-foreground w-full"
					placeholder="Spreadsheet Title"
				/>
				<div className="text-xs text-muted-foreground">
					{tableData[0]?.length || 0} × {tableData.length || 0}
				</div>
			</div>

			<div className="border-x border-border">
				{isReady && (
					<HotTable
						ref={hotRef}
						data={tableData}
						formulas={formulasConfig}
						licenseKey="non-commercial-and-evaluation"
						colHeaders={tableConfig.colHeaders}
						rowHeaders={tableConfig.rowHeaders}
						height={tableConfig.height}
						width={tableConfig.width || "100%"}
						stretchH="all"
						contextMenu={true}
						manualColumnResize={true}
						manualRowResize={true}
						className="handsontable-inner"
						afterChange={handleHotChange}
						afterCreateCol={handleStructureChange}
						afterCreateRow={handleStructureChange}
						afterRemoveCol={handleStructureChange}
						afterRemoveRow={handleStructureChange}
					/>
				)}
			</div>

			<div className="text-xs text-muted-foreground bg-muted/10 border border-t-0 border-border rounded-b-md px-3 py-1.5 flex justify-end">
				<span>
					<kbd className="px-1.5 py-0.5 text-xs text-muted-foreground bg-muted rounded border border-border">
						Tab
					</kbd>{" "}
					to navigate •{" "}
					<kbd className="px-1.5 py-0.5 text-xs text-muted-foreground bg-muted rounded border border-border">
						Right-click
					</kbd>{" "}
					for more options
				</span>
			</div>
		</NodeViewWrapper>
	);
};
