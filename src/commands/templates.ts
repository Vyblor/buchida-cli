import type { Command } from "commander";
import { apiRequest } from "../lib/client.js";
import { withErrorHandler } from "../lib/errors.js";
import { formatDate, printDetail, printJson, printTable, truncate } from "../lib/output.js";

interface Template {
	id: string;
	name: string;
	subject: string;
	language: string;
	created_at: string;
	updated_at: string;
}

interface TemplateDetail extends Template {
	html: string;
	text?: string;
	variables: string[];
}

interface TemplateOptions {
	json?: boolean;
	apiKey?: string;
}

export function registerTemplatesCommand(program: Command): void {
	const templates = program.command("templates").description("Manage email templates");

	templates
		.command("list")
		.description("List all templates")
		.option("--json", "Output as JSON")
		.option("--api-key <key>", "API key to use")
		.action(
			withErrorHandler(async (options: TemplateOptions) => {
				interface ListResponse {
					data: Template[];
				}

				const data = await apiRequest<ListResponse>("/v1/templates", {
					apiKey: options.apiKey,
				});

				if (options.json) {
					printJson(data);
					return;
				}

				printTable(
					["ID", "Name", "Subject", "Language", "Updated"],
					data.data.map((t) => [
						truncate(t.id, 12),
						t.name,
						truncate(t.subject, 30),
						t.language,
						formatDate(t.updated_at),
					]),
				);
			}),
		);

	templates
		.command("get <id>")
		.description("Get template details")
		.option("--json", "Output as JSON")
		.option("--api-key <key>", "API key to use")
		.action(
			withErrorHandler(async (id: string, options: TemplateOptions) => {
				const data = await apiRequest<TemplateDetail>(`/v1/templates/${id}`, {
					apiKey: options.apiKey,
				});

				if (options.json) {
					printJson(data);
					return;
				}

				printDetail([
					["ID", data.id],
					["Name", data.name],
					["Subject", data.subject],
					["Language", data.language],
					["Variables", data.variables.join(", ") || "None"],
					["Created", formatDate(data.created_at)],
					["Updated", formatDate(data.updated_at)],
				]);
			}),
		);
}
