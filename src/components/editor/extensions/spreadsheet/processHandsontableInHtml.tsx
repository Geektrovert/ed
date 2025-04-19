/**
 * Processes HTML content with Handsontable elements to make them display correctly
 * when outputting as raw HTML (outside the editor)
 */
export const processHandsontableInHtml = (html: string): string => {
  try {
    // Safeguard against invalid HTML
    if (!html || typeof html !== 'string') {
      return html || '';
    }
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    
    // Check for parsing errors
    const parseError = doc.querySelector('parsererror');
    if (parseError) {
      console.error("HTML parsing error:", parseError.textContent);
      return html;
    }
    
    // Find all Handsontable divs
    const handsontableDivs = doc.querySelectorAll("div[data-type='handsontable']");
    
    if (handsontableDivs.length === 0) {
      return html;
    }
    
    handsontableDivs.forEach((div) => {
      // Ensure we don't add duplicate elements if this is called multiple times
      if (div.querySelector('.handsontable-export-indicator')) {
        return;
      }
      
      // Get title from data attribute
      const title = div.getAttribute('data-title') || 'Spreadsheet';
      
      // Add a placeholder class for styling if not already present
      div.classList.add("handsontable-placeholder");
      
      // Create a styled header for the spreadsheet
      const header = document.createElement("div");
      header.className = "handsontable-placeholder-header";
      header.textContent = title;
      div.appendChild(header);
      
      // Add a visual indicator that this is a spreadsheet
      const placeholder = document.createElement("div");
      placeholder.className = "handsontable-export-indicator";
      placeholder.innerHTML = '<span>Interactive Spreadsheet</span>';
      div.appendChild(placeholder);
    });
    
    return new XMLSerializer().serializeToString(doc);
  } catch (error) {
    console.error("Error processing Handsontable in HTML:", error);
    return html;
  }
}; 