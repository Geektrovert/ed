// Import fontsource packages
import "@fontsource-variable/inconsolata/wght.css";
import "@fontsource-variable/inter/wght.css";
import "@fontsource/crimson-text/400.css";
import "@fontsource/crimson-text/700.css";
// @ts-ignore
import "cal-sans";

// Define CSS variables to be used in the app
export const cal = "var(--font-title)";
export const crimsonBold = "var(--font-title)";
export const inter = "var(--font-default)";
export const inconsolataBold = "var(--font-title)";
export const crimson = "var(--font-default)";
export const inconsolata = "var(--font-default)";

// Font family mapping
export const titleFontMapper = {
	Default: '"Cal Sans", sans-serif',
	Serif: '"Crimson Text", serif',
	Mono: "Inconsolata, monospace",
};

export const defaultFontMapper = {
	Default: "Inter, sans-serif",
	Serif: '"Crimson Text", serif',
	Mono: "Inconsolata, monospace",
};
