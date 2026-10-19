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
	from_name?: string | null;
	headers?: Record<string, string>;
	events?: { type: string; timestamp: string }[];
}

interface ListOptions {
	json?: boolean;
	apiKey?: string;
	limit?: string;
	cursor?: string;
	status?: string;
	from?: string;
	to?: string;
}

interface ListResponse {
	data: EmailSummary[];
	/** Current API field. */
	hasMore?: boolean;
	/** Legacy field name, kept as a fallback. */
	has_more?: boolean;
	cursor?: string | null;
}

/** Build the /v1/emails query string. With only `limit` it is identical to the old request. */
export function buildEmailsListQuery(options: ListOptions): string {
	const params = new URLSearchParams();
	params.set("limit", options.limit ?? "20");
	if (options.cursor) params.set("cursor", options.cursor);
	if (options.status) params.set("status", options.status);
	if (options.from) params.set("from", options.from);
	if (options.to) params.set("to", options.to);
	return params.toString();
}

export function registerEmailsCommand(program: Command): void {
	const emails = program.command("emails").description("Manage sent emails");

	emails
		.command("list")
		.description("List sent emails")
		.option("--json", "Output as JSON")
		.option("--api-key <key>", "API key to use")
		.option("--limit <n>", "Number of results", "20")
		.option("--cursor <cursor>", "Pagination cursor from a previous response")
		.option("--status <status>", "Filter by status (e.g. queued, sent, delivered, bounced)")
		.option("--from <address>", "Filter by sender address")
		.option("--to <address>", "Filter by recipient address")
		.action(
			withErrorHandler(async (options: ListOptions) => {
				const data = await apiRequest<ListResponse>(`/v1/emails?${buildEmailsListQuery(options)}`, {
					apiKey: options.apiKey,
				});

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

				const hasMore = data.hasMore ?? data.has_more ?? false;
				if (hasMore && data.cursor) {
					console.error(`\nMore results available. Next page: --cursor ${data.cursor}`);
				}
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
					["From", data.from_name ? `${data.from_name} <${data.from}>` : data.from],
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
