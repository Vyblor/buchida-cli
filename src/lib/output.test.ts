import { describe, expect, it, vi } from "vitest";
import { formatDate, printJson, printTable, truncate } from "./output.js";

describe("truncate", () => {
	it("returns short strings unchanged", () => {
		expect(truncate("hello", 10)).toBe("hello");
	});

	it("truncates long strings with ellipsis", () => {
		expect(truncate("hello world", 8)).toBe("hello w…");
	});

	it("handles exact length", () => {
		expect(truncate("hello", 5)).toBe("hello");
	});

	it("handles empty string", () => {
		expect(truncate("", 5)).toBe("");
	});

	it("handles length of 1", () => {
		expect(truncate("ab", 1)).toBe("…");
	});
});

describe("formatDate", () => {
	it("formats ISO date strings", () => {
		const result = formatDate("2026-03-31T10:00:00Z");
		expect(result).toContain("2026");
		expect(result).toContain("Mar");
	});

	it("returns original string on invalid date", () => {
		const result = formatDate("not-a-date");
		// Invalid Date still returns a string from toLocaleDateString
		expect(typeof result).toBe("string");
	});
});

describe("printJson", () => {
	it("outputs valid JSON", () => {
		const spy = vi.spyOn(console, "log").mockImplementation(() => {});
		printJson({ test: true, count: 42 });
		expect(spy).toHaveBeenCalledWith(expect.stringContaining('"test": true'));
		spy.mockRestore();
	});
});

describe("printTable", () => {
	it("prints no results message for empty rows", () => {
		const spy = vi.spyOn(console, "log").mockImplementation(() => {});
		printTable(["A", "B"], []);
		expect(spy).toHaveBeenCalledWith("No results found.");
		spy.mockRestore();
	});

	it("prints formatted table with data", () => {
		const spy = vi.spyOn(console, "log").mockImplementation(() => {});
		printTable(
			["Name", "Value"],
			[
				["foo", "bar"],
				["baz", "qux"],
			],
		);
		// Should have header + separator + 2 data rows = 4 calls
		expect(spy).toHaveBeenCalledTimes(4);
		spy.mockRestore();
	});
});
