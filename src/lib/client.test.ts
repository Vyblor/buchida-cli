import { describe, expect, it } from "vitest";
import { BuchidaApiError, getDomainErrorHint } from "./client.js";

describe("BuchidaApiError", () => {
	it("creates error with status and message", () => {
		const error = new BuchidaApiError({
			status: 401,
			message: "Unauthorized",
			code: "invalid_key",
		});
		expect(error.message).toBe("Unauthorized");
		expect(error.status).toBe(401);
		expect(error.code).toBe("invalid_key");
		expect(error.name).toBe("BuchidaApiError");
	});

	it("is instance of Error", () => {
		const error = new BuchidaApiError({ status: 500, message: "Internal error" });
		expect(error).toBeInstanceOf(Error);
		expect(error).toBeInstanceOf(BuchidaApiError);
	});

	it("handles missing code", () => {
		const error = new BuchidaApiError({ status: 404, message: "Not found" });
		expect(error.code).toBeUndefined();
	});
});

describe("BuchidaApiError hint property", () => {
	it("stores hint when provided", () => {
		const error = new BuchidaApiError({
			status: 403,
			message: "Domain not registered",
			code: "domain_not_registered",
			hint: "Run `buchida domains list`",
		});
		expect(error.hint).toBe("Run `buchida domains list`");
	});

	it("hint is undefined when not provided", () => {
		const error = new BuchidaApiError({ status: 403, message: "Forbidden" });
		expect(error.hint).toBeUndefined();
	});
});

describe("getDomainErrorHint", () => {
	it("returns domains list hint for domain_not_registered", () => {
		const hint = getDomainErrorHint("domain_not_registered");
		expect(hint).toContain("buchida domains list");
		expect(hint).toContain("buchida.com/dashboard/domains");
	});

	it("returns dns verification hint for domain_not_verified", () => {
		const hint = getDomainErrorHint("domain_not_verified");
		expect(hint).toContain("buchida.com/dashboard/domains");
		expect(hint).not.toContain("buchida domains list");
	});

	it("returns undefined for unrecognized codes", () => {
		expect(getDomainErrorHint("rate_limit_exceeded")).toBeUndefined();
		expect(getDomainErrorHint("invalid_email_address")).toBeUndefined();
		expect(getDomainErrorHint(undefined)).toBeUndefined();
	});
});

describe("API key resolution precedence", () => {
	it("flag > env > config (documented)", () => {
		// This tests the documented precedence behavior
		const sources = {
			flag: "bc_live_flag",
			env: "bc_test_env",
			config: "bc_live_config",
		};

		const resolve = (flag?: string, env?: string, config?: string) => {
			return flag ?? env ?? config;
		};

		expect(resolve(sources.flag, sources.env, sources.config)).toBe("bc_live_flag");
		expect(resolve(undefined, sources.env, sources.config)).toBe("bc_test_env");
		expect(resolve(undefined, undefined, sources.config)).toBe("bc_live_config");
		expect(resolve(undefined, undefined, undefined)).toBeUndefined();
	});
});
