import type { Command } from "commander";
import { apiRequest } from "../lib/client.js";
import { withErrorHandler } from "../lib/errors.js";
import {
	formatDate,
	isTTY,
	printJson,
	printSuccess,
	printTable,
	printWarning,
} from "../lib/output.js";

interface ApiKey {
	id: string;
	name: string;
	key?: string;
	prefix: string;
	created_at: string;
	last_used_at?: string;
}

interface KeyOptions {
	json?: boolean;
	apiKey?: string;
}

export function registerApiKeysCommand(program: Command): void {
	const keys = program.command("api-keys").description("Manage API keys");

	keys
		.command("list")
		.description("List all API keys")
		.option("--json", "Output as JSON")
		.option("--api-key <key>", "API key to use")
		.action(
			withErrorHandler(async (options: KeyOptions) => {
				interface ListResponse {
					data: ApiKey[];
				}

				const data = await apiRequest<ListResponse>("/v1/api-keys", {
					apiKey: options.apiKey,
				});

				if (options.json) {
					printJson(data);
					return;
				}

				printTable(
					["ID", "Name", "Prefix", "Created", "Last Used"],
					data.data.map((k) => [
						k.id,
						k.name,
						k.prefix,
						formatDate(k.created_at),
						k.last_used_at ? formatDate(k.last_used_at) : "Never",
					]),
				);
			}),
		);

	keys
		.command("create")
		.description("Create a new API key")
		.option("--name <name>", "Key name")
		.option("--json", "Output as JSON")
		.option("--api-key <key>", "API key to use")
		.action(
			withErrorHandler(async (options: KeyOptions & { name?: string }) => {
				let { name } = options;

				if (!name && isTTY()) {
					const clack = await import("@clack/prompts");
					const result = await clack.text({
						message: "Key name:",
						placeholder: "my-api-key",
					});
					if (clack.isCancel(result)) {
						process.exit(0);
					}
					name = result as string;
				}

				if (!name) {
					throw new Error("Key name is required. Provide --name or run interactively.");
				}

				const data = await apiRequest<ApiKey>("/v1/api-keys", {
					method: "POST",
					apiKey: options.apiKey,
					body: { name },
				});

				if (options.json) {
					printJson(data);
					return;
				}

				printSuccess(`API key created: ${data.name}`);
				if (data.key) {
					console.log(`\n\x1b[1mKey:\x1b[0m ${data.key}`);
					printWarning("Save this key now — it won't be shown again.");
				}
			}),
		);

	keys
		.command("delete <id>")
		.description("Delete an API key")
		.option("--json", "Output as JSON")
		.option("--api-key <key>", "API key to use")
		.option("--force", "Skip confirmation")
		.action(
			withErrorHandler(async (id: string, options: KeyOptions & { force?: boolean }) => {
				if (!options.force && isTTY()) {
					const clack = await import("@clack/prompts");
					const confirmed = await clack.confirm({
						message: `Delete API key ${id}? This cannot be undone.`,
					});
					if (clack.isCancel(confirmed) || !confirmed) {
						process.exit(0);
					}
				}

				await apiRequest(`/v1/api-keys/${id}`, {
					method: "DELETE",
					apiKey: options.apiKey,
				});

				if (options.json) {
					printJson({ success: true, id });
				} else {
					printSuccess(`API key ${id} deleted.`);
				}
			}),
		);
}
