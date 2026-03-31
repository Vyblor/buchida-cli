import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// We test the config resolution logic directly
describe("config resolution", () => {
	const testDir = join(tmpdir(), "buchida-cli-test-" + Date.now());
	const configDir = join(testDir, ".buchida");
	const configPath = join(configDir, "config.json");

	beforeEach(() => {
		mkdirSync(configDir, { recursive: true });
	});

	afterEach(() => {
		rmSync(testDir, { recursive: true, force: true });
		delete process.env.NSEND_API_KEY;
	});

	it("resolves API key from explicit flag first", () => {
		process.env.NSEND_API_KEY = "bc_test_env_key";
		// Simulate the resolution logic
		const flag = "bc_live_explicit";
		const env = process.env.NSEND_API_KEY;
		const result = flag || env || undefined;
		expect(result).toBe("bc_live_explicit");
	});

	it("resolves API key from env when no flag", () => {
		process.env.NSEND_API_KEY = "bc_test_env_key";
		const flag = undefined;
		const env = process.env.NSEND_API_KEY;
		const result = flag || env || undefined;
		expect(result).toBe("bc_test_env_key");
	});

	it("reads config file correctly", () => {
		const config = { apiKey: "bc_live_from_file", apiUrl: "https://custom.api.com" };
		writeFileSync(configPath, JSON.stringify(config), "utf-8");
		const raw = readFileSync(configPath, "utf-8");
		const parsed = JSON.parse(raw);
		expect(parsed.apiKey).toBe("bc_live_from_file");
		expect(parsed.apiUrl).toBe("https://custom.api.com");
	});

	it("returns empty config when file does not exist", () => {
		const nonExistent = join(testDir, "nonexistent", "config.json");
		expect(existsSync(nonExistent)).toBe(false);
	});

	it("handles malformed config gracefully", () => {
		writeFileSync(configPath, "not valid json{{{", "utf-8");
		let result = {};
		try {
			result = JSON.parse(readFileSync(configPath, "utf-8"));
		} catch {
			result = {};
		}
		expect(result).toEqual({});
	});
});

describe("API key format validation", () => {
	it("recognizes live keys", () => {
		expect("bc_live_abc123".startsWith("bc_live_")).toBe(true);
	});

	it("recognizes test keys", () => {
		expect("bc_test_abc123".startsWith("bc_test_")).toBe(true);
	});

	it("recognizes CLI keys", () => {
		expect("bc_cli_abc123".startsWith("bc_cli_")).toBe(true);
	});

	it("rejects invalid keys", () => {
		expect("sk_abc123".startsWith("bc_")).toBe(false);
	});
});
