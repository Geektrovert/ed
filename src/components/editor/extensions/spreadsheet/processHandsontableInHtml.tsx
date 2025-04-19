/**
 * Processes HTML content with Handsontable elements to make them display correctly
 * when outputting as raw HTML (outside the editor)
 */
export const processHandsontableInHtml = (html: string): string => {
	try {
		// Safeguard against invalid HTML
		if (!html || typeof html !== "string") {
			return html || "";
		}

		const parser = new DOMParser();
		const doc = parser.parseFromString(html, "text/html");

		// Check for parsing errors
		const parseError = doc.querySelector("parsererror");
		if (parseError) {
			console.error("HTML parsing error:", parseError.textContent);
			return html;
		}

		// Find all Handsontable divs
		const handsontableDivs = doc.querySelectorAll(
			"div[data-type='handsontable']",
		);

		if (handsontableDivs.length === 0) {
			return html;
		}

		// Now process handsontable divs
		for (const div of handsontableDivs) {
			// Ensure we don't add duplicate elements if this is called multiple times
			const existingTable = div.querySelector(".handsontable-placeholder");
			if (existingTable) {
				continue;
			}

			// Extract data-title attribute (id is not used but kept for future use)
			const title = div.getAttribute("data-title") || "";

			// Create a styled placeholder element
			const placeholder = document.createElement("div");
			placeholder.className = "handsontable-placeholder";
			placeholder.style.cssText = `
					border: 1px solid #ccc;
					padding: 8px;
					background-color: #f9f9f9;
					border-radius: 4px;
					margin: 8px 0;
			`;

			// Add title if available
			if (title) {
				const titleEl = document.createElement("div");
				titleEl.style.cssText = "font-weight: bold; margin-bottom: 4px;";
				titleEl.textContent = title;
				placeholder.appendChild(titleEl);
			}

			div.appendChild(placeholder);
		}

		return new XMLSerializer().serializeToString(doc);
	} catch (error) {
		console.error("Error processing Handsontable in HTML:", error);
		return html;
	}
};
