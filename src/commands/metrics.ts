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
				const data = await apiRequest<Metrics>(`/v1/metrics?period=${period}`, {
					apiKey: options.apiKey,
				});

				if (options.json) {
					printJson(data);
					return;
				}

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
