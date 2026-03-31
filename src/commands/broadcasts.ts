import type { Command } from "commander";
import { apiRequest } from "../lib/client.js";
import { withErrorHandler } from "../lib/errors.js";
import { formatDate, isTTY, printJson, printSuccess, printTable, truncate } from "../lib/output.js";

interface Broadcast {
	id: string;
	name: string;
	subject: string;
	status: string;
	audience_count: number;
	sent_count: number;
	created_at: string;
	sent_at?: string;
}

interface BroadcastOptions {
	json?: boolean;
	apiKey?: string;
}

export function registerBroadcastsCommand(program: Command): void {
	const broadcasts = program.command("broadcasts").description("Manage broadcast emails");

	broadcasts
		.command("list")
		.description("List all broadcasts")
		.option("--json", "Output as JSON")
		.option("--api-key <key>", "API key to use")
		.action(
			withErrorHandler(async (options: BroadcastOptions) => {
				interface ListResponse {
					data: Broadcast[];
				}

				const data = await apiRequest<ListResponse>("/v1/broadcasts", {
					apiKey: options.apiKey,
				});

				if (options.json) {
					printJson(data);
					return;
				}

				printTable(
					["ID", "Name", "Subject", "Status", "Sent", "Date"],
					data.data.map((b) => [
						truncate(b.id, 12),
						b.name,
						truncate(b.subject, 25),
						b.status,
						`${b.sent_count}/${b.audience_count}`,
						formatDate(b.sent_at ?? b.created_at),
					]),
				);
			}),
		);

	broadcasts
		.command("create")
		.description("Create a new broadcast")
		.option("--name <name>", "Broadcast name")
		.option("--from <address>", "Sender address")
		.option("--subject <subject>", "Email subject")
		.option("--template <id>", "Template ID to use")
		.option("--json", "Output as JSON")
		.option("--api-key <key>", "API key to use")
		.action(
			withErrorHandler(
				async (
					options: BroadcastOptions & {
						name?: string;
						from?: string;
						subject?: string;
						template?: string;
					},
				) => {
					let { name, from, subject, template } = options;

					if ((!name || !from || !subject) && isTTY()) {
						const clack = await import("@clack/prompts");
						clack.intro("Create broadcast");

						if (!name) {
							const r = await clack.text({ message: "Broadcast name:" });
							if (clack.isCancel(r)) process.exit(0);
							name = r as string;
						}
						if (!from) {
							const r = await clack.text({
								message: "From address:",
								placeholder: "newsletter@yourdomain.com",
							});
							if (clack.isCancel(r)) process.exit(0);
							from = r as string;
						}
						if (!subject) {
							const r = await clack.text({ message: "Subject:" });
							if (clack.isCancel(r)) process.exit(0);
							subject = r as string;
						}
					}

					if (!name || !from || !subject) {
						throw new Error("--name, --from, and --subject are required.");
					}

					const data = await apiRequest<Broadcast>("/v1/broadcasts", {
						method: "POST",
						apiKey: options.apiKey,
						body: { name, from, subject, template_id: template },
					});

					if (options.json) {
						printJson(data);
					} else {
						printSuccess(`Broadcast "${data.name}" created (ID: ${data.id})`);
					}
				},
			),
		);

	broadcasts
		.command("send <id>")
		.description("Send a broadcast")
		.option("--json", "Output as JSON")
		.option("--api-key <key>", "API key to use")
		.option("--force", "Skip confirmation")
		.action(
			withErrorHandler(async (id: string, options: BroadcastOptions & { force?: boolean }) => {
				if (!options.force && isTTY()) {
					const clack = await import("@clack/prompts");
					const confirmed = await clack.confirm({
						message: "Send this broadcast to all recipients?",
					});
					if (clack.isCancel(confirmed) || !confirmed) {
						process.exit(0);
					}
				}

				const data = await apiRequest<Broadcast>(`/v1/broadcasts/${id}/send`, {
					method: "POST",
					apiKey: options.apiKey,
				});

				if (options.json) {
					printJson(data);
				} else {
					printSuccess(`Broadcast is sending to ${data.audience_count} recipients.`);
				}
			}),
		);
}
