/**
 * Output formatting utilities.
 * Supports --json flag for machine-readable output and
 * pretty table/detail views for human consumption.
 */

export function isJson(options: { json?: boolean }): boolean {
	return options.json === true;
}

export function isTTY(): boolean {
	return process.stdout.isTTY === true;
}

export function printJson(data: unknown): void {
	console.log(JSON.stringify(data, null, "\t"));
}

export function printError(message: string, json = false): void {
	if (json) {
		console.error(JSON.stringify({ error: message }));
	} else {
		console.error(`\x1b[31mError:\x1b[0m ${message}`);
	}
}

export function printSuccess(message: string): void {
	console.log(`\x1b[32m✓\x1b[0m ${message}`);
}

export function printWarning(message: string): void {
	console.log(`\x1b[33m!\x1b[0m ${message}`);
}

export function printHint(message: string): void {
	console.error(`\x1b[2mHint:\x1b[0m ${message}`);
}

export function printInfo(message: string): void {
	console.log(`\x1b[36mℹ\x1b[0m ${message}`);
}

/**
 * Print a simple table with column headers and rows.
 */
export function printTable(headers: string[], rows: string[][]): void {
	if (rows.length === 0) {
		console.log("No results found.");
		return;
	}

	// Calculate column widths
	const widths = headers.map((h, i) => {
		const maxRow = Math.max(...rows.map((r) => (r[i] ?? "").length));
		return Math.max(h.length, maxRow);
	});

	// Header
	const headerLine = headers.map((h, i) => h.padEnd(widths[i] ?? 0)).join("  ");
	const separator = widths.map((w) => "─".repeat(w)).join("──");

	console.log(`\x1b[1m${headerLine}\x1b[0m`);
	console.log(separator);

	// Rows
	for (const row of rows) {
		const line = row.map((cell, i) => (cell ?? "").padEnd(widths[i] ?? 0)).join("  ");
		console.log(line);
	}
}

/**
 * Print key-value detail view.
 */
export function printDetail(entries: [string, string | undefined][]): void {
	const maxKeyLen = Math.max(...entries.map(([k]) => k.length));
	for (const [key, value] of entries) {
		console.log(`\x1b[1m${key.padEnd(maxKeyLen)}\x1b[0m  ${value ?? "—"}`);
	}
}

/**
 * Truncate string with ellipsis.
 */
export function truncate(str: string, maxLen: number): string {
	if (str.length <= maxLen) return str;
	return `${str.slice(0, maxLen - 1)}…`;
}

/**
 * Format a date string for display.
 */
export function formatDate(dateStr: string): string {
	try {
		const date = new Date(dateStr);
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	} catch {
		return dateStr;
	}
}
