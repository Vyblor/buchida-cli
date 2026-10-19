import type { Command } from "commander";
import { apiRequest } from "../lib/client.js";
import { withErrorHandler } from "../lib/errors.js";
import { printJson } from "../lib/output.js";

interface Metrics {
	period: string;
	sent: number;
	delivered: number;
	bounced: number;
	complained: number;
	opened: number;
	clicked: number;
	delivery_rate: number;
	open_rate: number;
	click_rate: number;
	bounce_rate: number;
}

const PERIOD_MS: Record<string, number> = {
	"24h": 86_400_000,
	"7d": 7 * 86_400_000,
	"30d": 30 * 86_400_000,
};

/**
 * Map the --period flag to the from_date/to_date params the API reads.
 * Unknown periods send no date filter (all-time), matching what the API did with the old `period` param.
 */
export function buildMetricsQuery(period: string, now: number = Date.now()): string {
	const ms = PERIOD_MS[period];
	if (!ms) return "";
	const params = new URLSearchParams();
	params.set("from_date", new Date(now - ms).toISOString());
	params.set("to_date", new Date(now).toISOString());
	return `?${params.toString()}`;
}

interface ApiMetrics {
	total?: number;
	by_status?: Record<string, number>;
	filtered_total?: number;
	filtered_by_status?: Record<string, number>;
	delivery_rate?: number;
	bounce_rate?: number;
	complaint_rate?: number;
}

/**
 * The API returns `{ data: { filtered_by_status, ... } }`. Normalise it (or a legacy flat
 * `Metrics` shape) into the fields the table renders so missing values never crash.
 */
export function normalizeMetrics(raw: unknown, period: string): Metrics {
	const body = (raw ?? {}) as Record<string, unknown>;
	const inner = (body.data ?? body) as Metrics & ApiMetrics;
	if (typeof (inner as Metrics).sent === "number") return inner as Metrics;
	const by = inner.filtered_by_status ?? inner.by_status ?? {};
	const total = inner.filtered_total ?? inner.total ?? 0;
	const n = (k: string): number => by[k] ?? 0;
	const rate = (v: number): number => (total > 0 ? v / total : 0);
	return {
		period,
		sent: total,
		delivered: n("delivered"),
		bounced: n("bounced"),
		complained: n("complained"),
		opened: 0,
		clicked: 0,
		delivery_rate: rate(n("delivered")),
		open_rate: 0,
		click_rate: 0,
		bounce_rate: rate(n("bounced")),
	};
}

interface MetricsOptions {
	json?: boolean;
	apiKey?: string;
	period?: string;
}

export function registerMetricsCommand(program: Command): void {
	program
		.command("metrics")
		.description("Show email sending metrics")
		.option("--json", "Output as JSON")
		.option("--api-key <key>", "API key to use")
		.option("--period <period>", "Time period: 24h, 7d, 30d", "7d")
		.action(
			withErrorHandler(async (options: MetricsOptions) => {
				const period = options.period ?? "7d";
				const raw = await apiRequest<unknown>(`/v1/metrics${buildMetricsQuery(period)}`, {
					apiKey: options.apiKey,
				});

				if (options.json) {
					printJson(raw);
					return;
				}

				const data = normalizeMetrics(raw, period);

				console.log(`\x1b[1mbuchida metrics (${data.period})\x1b[0m\n`);

				const bar = (value: number, max: number, width = 30): string => {
					const filled = max > 0 ? Math.round((value / max) * width) : 0;
					return `${"█".repeat(filled)}${"░".repeat(width - filled)}`;
				};

				const maxVal = Math.max(data.sent, 1);

				const rows: [string, number, string][] = [
					["Sent", data.sent, ""],
					["Delivered", data.delivered, `${(data.delivery_rate * 100).toFixed(1)}%`],
					["Opened", data.opened, `${(data.open_rate * 100).toFixed(1)}%`],
					["Clicked", data.clicked, `${(data.click_rate * 100).toFixed(1)}%`],
					["Bounced", data.bounced, `${(data.bounce_rate * 100).toFixed(1)}%`],
					["Complained", data.complained, ""],
				];

				for (const [label, value, rate] of rows) {
					const paddedLabel = label.padEnd(12);
					const paddedValue = value.toString().padStart(8);
					const rateStr = rate ? ` (${rate})` : "";
					console.log(`  ${paddedLabel} ${bar(value, maxVal)} ${paddedValue}${rateStr}`);
				}
				console.log();
			}),
		);
}
