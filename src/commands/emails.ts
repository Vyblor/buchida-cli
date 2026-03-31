import type { Command } from "commander";
import { apiRequest } from "../lib/client.js";
import { withErrorHandler } from "../lib/errors.js";
import { formatDate, printDetail, printJson, printTable, truncate } from "../lib/output.js";

interface EmailSummary {
	id: string;
	from: string;
	to: string[];
	subject: string;
	status: string;
	created_at: string;
}

interface EmailDetail extends EmailSummary {
	html?: string;
	text?: string;
	reply_to?: string;
	headers?: Record<string, string>;
	events?: { type: string; timestamp: string }[];
}

interface ListOptions {
	json?: boolean;
	apiKey?: string;
	limit?: string;
}

export function registerEmailsCommand(program: Command): void {
	const emails = program
		.command("emails")
		.description("Manage sent emails");

	emails
		.command("list")
		.description("List sent emails")
		.option("--json", "Output as JSON")
		.option("--api-key <key>", "API key to use")
		.option("--limit <n>", "Number of results", "20")
		.action(
			withErrorHandler(async (options: ListOptions) => {
				interface ListResponse {
					data: EmailSummary[];
					has_more: boolean;
				}

				const data = await apiRequest<ListResponse>(
					`/v1/emails?limit=${options.limit ?? "20"}`,
					{ apiKey: options.apiKey },
				);

				if (options.json) {
					printJson(data);
					return;
				}

				printTable(
					["ID", "From", "To", "Subject", "Status", "Date"],
					data.data.map((e) => [
						truncate(e.id, 12),
						truncate(e.from, 24),
						truncate(e.to.join(", "), 24),
						truncate(e.subject, 30),
						e.status,
						formatDate(e.created_at),
					]),
				);
			}),
		);

	emails
		.command("get <id>")
		.description("Get email details")
		.option("--json", "Output as JSON")
		.option("--api-key <key>", "API key to use")
		.action(
			withErrorHandler(async (id: string, options: { json?: boolean; apiKey?: string }) => {
				const data = await apiRequest<EmailDetail>(`/v1/emails/${id}`, {
					apiKey: options.apiKey,
				});

				if (options.json) {
					printJson(data);
					return;
				}

				printDetail([
					["ID", data.id],
					["From", data.from],
					["To", data.to.join(", ")],
					["Subject", data.subject],
					["Status", data.status],
					["Reply-To", data.reply_to],
					["Created", formatDate(data.created_at)],
				]);

				if (data.events && data.events.length > 0) {
					console.log("\n\x1b[1mEvents:\x1b[0m");
					for (const event of data.events) {
						console.log(`  ${formatDate(event.timestamp)}  ${event.type}`);
					}
				}
			}),
		);
}
