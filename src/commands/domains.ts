import type { Command } from "commander";
import { apiRequest } from "../lib/client.js";
import { withErrorHandler } from "../lib/errors.js";
import { formatDate, printJson, printSuccess, printTable } from "../lib/output.js";

interface Domain {
	id: string;
	name: string;
	status: string;
	region: string;
	created_at: string;
	dns_records?: DnsRecord[];
}

interface DnsRecord {
	type: string;
	name: string;
	value: string;
	priority?: number;
	status: string;
}

interface DomainOptions {
	json?: boolean;
	apiKey?: string;
}

export function registerDomainsCommand(program: Command): void {
	const domains = program.command("domains").description("Manage email domains");

	domains
		.command("list")
		.description("List all domains")
		.option("--json", "Output as JSON")
		.option("--api-key <key>", "API key to use")
		.action(
			withErrorHandler(async (options: DomainOptions) => {
				interface ListResponse {
					data: Domain[];
				}

				const data = await apiRequest<ListResponse>("/v1/domains", {
					apiKey: options.apiKey,
				});

				if (options.json) {
					printJson(data);
					return;
				}

				if (data.data.length === 0) {
					console.log("No domains registered. Add one at https://buchida.com/dashboard/domains");
					return;
				}

				printTable(
					["Domain", "Status", "Region", "Created"],
					data.data.map((d) => [d.name, d.status, d.region, formatDate(d.created_at)]),
				);
			}),
		);

	domains
		.command("add <domain>")
		.description("Add a new domain")
		.option("--json", "Output as JSON")
		.option("--api-key <key>", "API key to use")
		.action(
			withErrorHandler(async (domain: string, options: DomainOptions) => {
				const data = await apiRequest<Domain>("/v1/domains", {
					method: "POST",
					apiKey: options.apiKey,
					body: { name: domain },
				});

				if (options.json) {
					printJson(data);
					return;
				}

				printSuccess(`Domain "${domain}" added.`);
				if (data.dns_records && data.dns_records.length > 0) {
					console.log("\n\x1b[1mAdd these DNS records to verify your domain:\x1b[0m\n");
					printTable(
						["Type", "Name", "Value", "Priority"],
						data.dns_records.map((r) => [r.type, r.name, r.value, r.priority?.toString() ?? "—"]),
					);
					console.log("\nRun `buchida domains verify %s` after adding records.", domain);
				}
			}),
		);

	domains
		.command("verify <domain>")
		.description("Verify domain DNS records")
		.option("--json", "Output as JSON")
		.option("--api-key <key>", "API key to use")
		.action(
			withErrorHandler(async (domain: string, options: DomainOptions) => {
				const data = await apiRequest<Domain>(`/v1/domains/${domain}/verify`, {
					method: "POST",
					apiKey: options.apiKey,
				});

				if (options.json) {
					printJson(data);
					return;
				}

				if (data.status === "verified") {
					printSuccess(`Domain "${domain}" is verified and ready to send!`);
				} else {
					console.log(`Domain status: ${data.status}`);
					if (data.dns_records) {
						console.log("\n\x1b[1mDNS Record Status:\x1b[0m\n");
						printTable(
							["Type", "Name", "Status"],
							data.dns_records.map((r) => [r.type, r.name, r.status]),
						);
					}
				}
			}),
		);
}
