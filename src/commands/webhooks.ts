import type { Command } from "commander";
import { apiRequest } from "../lib/client.js";
import { withErrorHandler } from "../lib/errors.js";
import { formatDate, isTTY, printJson, printSuccess, printTable } from "../lib/output.js";

interface Webhook {
	id: string;
	url: string;
	events: string[];
	active: boolean;
	created_at: string;
}

interface WebhookOptions {
	json?: boolean;
	apiKey?: string;
}

export function registerWebhooksCommand(program: Command): void {
	const webhooks = program
		.command("webhooks")
		.description("Manage webhooks");

	webhooks
		.command("list")
		.description("List all webhooks")
		.option("--json", "Output as JSON")
		.option("--api-key <key>", "API key to use")
		.action(
			withErrorHandler(async (options: WebhookOptions) => {
				interface ListResponse {
					data: Webhook[];
				}

				const data = await apiRequest<ListResponse>("/v1/webhooks", {
					apiKey: options.apiKey,
				});

				if (options.json) {
					printJson(data);
					return;
				}

				printTable(
					["ID", "URL", "Events", "Active", "Created"],
					data.data.map((w) => [
						w.id,
						w.url,
						w.events.join(", "),
						w.active ? "Yes" : "No",
						formatDate(w.created_at),
					]),
				);
			}),
		);

	webhooks
		.command("create")
		.description("Create a webhook")
		.option("--url <url>", "Webhook endpoint URL")
		.option("--events <events>", "Comma-separated event types")
		.option("--json", "Output as JSON")
		.option("--api-key <key>", "API key to use")
		.action(
			withErrorHandler(
				async (options: WebhookOptions & { url?: string; events?: string }) => {
					let { url, events } = options;

					if ((!url || !events) && isTTY()) {
						const clack = await import("@clack/prompts");

						if (!url) {
							const result = await clack.text({
								message: "Webhook URL:",
								placeholder: "https://example.com/webhook",
								validate: (v) =>
									!v.startsWith("https://") ? "Must be an HTTPS URL" : undefined,
							});
							if (clack.isCancel(result)) process.exit(0);
							url = result as string;
						}

						if (!events) {
							const result = await clack.multiselect({
								message: "Select events:",
								options: [
									{ value: "email.sent", label: "email.sent" },
									{ value: "email.delivered", label: "email.delivered" },
									{ value: "email.bounced", label: "email.bounced" },
									{ value: "email.complained", label: "email.complained" },
									{ value: "email.opened", label: "email.opened" },
									{ value: "email.clicked", label: "email.clicked" },
								],
							});
							if (clack.isCancel(result)) process.exit(0);
							events = (result as string[]).join(",");
						}
					}

					if (!url || !events) {
						throw new Error("--url and --events are required.");
					}

					const data = await apiRequest<Webhook>("/v1/webhooks", {
						method: "POST",
						apiKey: options.apiKey,
						body: {
							url,
							events: events.split(",").map((e) => e.trim()),
						},
					});

					if (options.json) {
						printJson(data);
					} else {
						printSuccess(`Webhook created: ${data.id}`);
					}
				},
			),
		);

	webhooks
		.command("delete <id>")
		.description("Delete a webhook")
		.option("--json", "Output as JSON")
		.option("--api-key <key>", "API key to use")
		.action(
			withErrorHandler(async (id: string, options: WebhookOptions) => {
				await apiRequest(`/v1/webhooks/${id}`, {
					method: "DELETE",
					apiKey: options.apiKey,
				});

				if (options.json) {
					printJson({ success: true, id });
				} else {
					printSuccess(`Webhook ${id} deleted.`);
				}
			}),
		);
}
