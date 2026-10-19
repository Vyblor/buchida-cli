import { Command } from "commander";
import { describe, expect, it } from "vitest";
import { buildEmailsListQuery } from "../commands/emails.js";
import { buildMetricsQuery, normalizeMetrics } from "../commands/metrics.js";
import { applyGlobalOptions } from "./global-options.js";

function run(argv: string[]): { json?: boolean; apiKey?: string } {
	const program = new Command();
	program.exitOverride();
	program.option("--api-key <key>").option("--json");
	applyGlobalOptions(program);
	let seen: { json?: boolean; apiKey?: string } = {};
	const emails = program.command("emails");
	emails
		.command("list")
		.option("--json")
		.option("--api-key <key>")
		.action((options) => {
			seen = options;
		});
	program.parse(["node", "buchida", ...argv]);
	return seen;
}

describe("global --json / --api-key propagation", () => {
	it("subcommand --json reaches the action", () => {
		expect(run(["emails", "list", "--json"]).json).toBe(true);
	});
	it("root --json before the subcommand reaches the action", () => {
		expect(run(["--json", "emails", "list"]).json).toBe(true);
	});
	it("no --json leaves it unset", () => {
		expect(run(["emails", "list"]).json).toBeUndefined();
	});
	it("--api-key after the subcommand reaches the action", () => {
		expect(run(["emails", "list", "--api-key", "bc_live_x"]).apiKey).toBe("bc_live_x");
	});
});

describe("emails list query", () => {
	it("old call shape (limit only) is unchanged", () => {
		expect(buildEmailsListQuery({ limit: "20" })).toBe("limit=20");
		expect(buildEmailsListQuery({})).toBe("limit=20");
	});
	it("sends cursor/status/from/to, encoding + in addresses", () => {
		const q = buildEmailsListQuery({
			limit: "5",
			cursor: "abc",
			status: "bounced",
			from: "a+b@x.com",
			to: "c@y.com",
		});
		const p = new URLSearchParams(q);
		expect(p.get("limit")).toBe("5");
		expect(p.get("cursor")).toBe("abc");
		expect(p.get("status")).toBe("bounced");
		expect(p.get("from")).toBe("a+b@x.com");
		expect(q).toContain("a%2Bb%40x.com");
		expect(p.get("to")).toBe("c@y.com");
	});
});

describe("metrics query", () => {
	it("maps --period to from_date/to_date", () => {
		const now = Date.UTC(2026, 9, 19);
		const p = new URLSearchParams(buildMetricsQuery("7d", now).slice(1));
		expect(p.get("from_date")).toBe(new Date(now - 7 * 86_400_000).toISOString());
		expect(p.get("to_date")).toBe(new Date(now).toISOString());
		expect(p.has("period")).toBe(false);
	});
	it("unknown period sends no filter", () => {
		expect(buildMetricsQuery("bogus")).toBe("");
	});
	it("normalizes the API envelope", () => {
		const m = normalizeMetrics(
			{ data: { filtered_total: 10, filtered_by_status: { delivered: 8, bounced: 2 } } },
			"7d",
		);
		expect(m.sent).toBe(10);
		expect(m.delivered).toBe(8);
		expect(m.bounce_rate).toBeCloseTo(0.2);
	});
});
