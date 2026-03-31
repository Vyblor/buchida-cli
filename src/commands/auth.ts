import type { Command } from "commander";
import {
	clearConfig,
	listProfiles,
	loadConfig,
	removeProfile,
	resolveApiKey,
	saveConfig,
	saveProfile,
	switchProfile,
} from "../lib/config.js";
import { withErrorHandler } from "../lib/errors.js";
import { isTTY, printDetail, printError, printJson, printSuccess, printTable, printWarning } from "../lib/output.js";

interface AuthOptions {
	json?: boolean;
	apiKey?: string;
	profile?: string;
}

export function registerAuthCommands(program: Command): void {
	program
		.command("login")
		.description("Authenticate with buchida")
		.option("--api-key <key>", "Set API key directly (skip browser login)")
		.option("--profile <name>", "Save credentials to a named profile")
		.option("--json", "Output as JSON")
		.action(
			withErrorHandler(async (options: AuthOptions) => {
				if (options.apiKey) {
					// Direct API key login
					if (options.profile) {
						saveProfile(options.profile, { apiKey: options.apiKey });
						switchProfile(options.profile);
						if (options.json) {
							printJson({ success: true, method: "api_key", profile: options.profile });
						} else {
							printSuccess(`API key saved to profile "${options.profile}" and activated.`);
						}
					} else {
						const config = loadConfig();
						config.apiKey = options.apiKey;
						saveConfig(config);
						if (options.json) {
							printJson({ success: true, method: "api_key" });
						} else {
							printSuccess("API key saved successfully.");
						}
					}
					return;
				}

				// Interactive login
				if (!isTTY()) {
					printError("Interactive login requires a TTY. Use --api-key instead.", options.json);
					process.exit(1);
				}

				const clack = await import("@clack/prompts");

				clack.intro("buchida login");

				const key = await clack.text({
					message: "Enter your API key (from https://buchida.com/dashboard/api-keys):",
					placeholder: "bc_live_...",
					validate(value) {
						if (!value.startsWith("bc_")) {
							return "API key must start with bc_live_, bc_test_, or bc_cli_";
						}
					},
				});

				if (clack.isCancel(key)) {
					clack.cancel("Login cancelled.");
					process.exit(0);
				}

				if (options.profile) {
					saveProfile(options.profile, { apiKey: key as string });
					switchProfile(options.profile);
					clack.outro(`Logged in and saved to profile "${options.profile}"!`);
				} else {
					const config = loadConfig();
					config.apiKey = key as string;
					saveConfig(config);
					clack.outro("Logged in successfully!");
				}
			}),
		);

	program
		.command("logout")
		.description("Clear stored credentials")
		.option("--json", "Output as JSON")
		.action(
			withErrorHandler(async (options: AuthOptions) => {
				clearConfig();
				if (options.json) {
					printJson({ success: true });
				} else {
					printSuccess("Logged out. Credentials cleared.");
				}
			}),
		);

	program
		.command("whoami")
		.description("Show current user and team info")
		.option("--json", "Output as JSON")
		.option("--api-key <key>", "API key to use")
		.action(
			withErrorHandler(async (options: AuthOptions) => {
				const { apiRequest } = await import("../lib/client.js");

				interface WhoAmIResponse {
					id: string;
					email: string;
					name: string;
					team: { id: string; name: string; plan: string };
				}

				const data = await apiRequest<WhoAmIResponse>("/v1/me", {
					apiKey: options.apiKey,
				});

				if (options.json) {
					printJson(data);
				} else {
					printDetail([
						["User", data.name],
						["Email", data.email],
						["Team", data.team.name],
						["Plan", data.team.plan],
						["API Key", maskKey(resolveApiKey(options.apiKey) ?? "")],
					]);
				}
			}),
		);

	// auth subcommand group
	const auth = program
		.command("auth")
		.description("Manage authentication profiles");

	auth
		.command("switch")
		.description("Switch to a named profile")
		.requiredOption("--profile <name>", "Profile name to activate")
		.option("--json", "Output as JSON")
		.action(
			withErrorHandler(async (options: AuthOptions) => {
				const name = options.profile as string;
				const success = switchProfile(name);

				if (!success) {
					if (options.json) {
						printJson({ success: false, error: `Profile "${name}" not found` });
					} else {
						printError(`Profile "${name}" not found. Run \`buchida auth list\` to see available profiles.`);
					}
					process.exit(1);
				}

				if (options.json) {
					printJson({ success: true, activeProfile: name });
				} else {
					printSuccess(`Switched to profile "${name}".`);
				}
			}),
		);

	auth
		.command("list")
		.description("List all saved profiles")
		.option("--json", "Output as JSON")
		.action(
			withErrorHandler(async (options: AuthOptions) => {
				const profiles = listProfiles();

				if (options.json) {
					printJson(profiles);
					return;
				}

				if (profiles.length === 0) {
					printWarning("No profiles saved. Use `buchida login --profile <name>` to create one.");
					return;
				}

				const headers = ["Profile", "API Key", "Active"];
				const rows = profiles.map((p) => [
					p.name,
					p.apiKey ? maskKey(p.apiKey) : "(not set)",
					p.active ? "*" : "",
				]);

				printTable(headers, rows);
			}),
		);

	auth
		.command("remove")
		.description("Remove a saved profile")
		.requiredOption("--profile <name>", "Profile name to remove")
		.option("--json", "Output as JSON")
		.action(
			withErrorHandler(async (options: AuthOptions) => {
				const name = options.profile as string;
				const success = removeProfile(name);

				if (!success) {
					if (options.json) {
						printJson({ success: false, error: `Profile "${name}" not found` });
					} else {
						printError(`Profile "${name}" not found.`);
					}
					process.exit(1);
				}

				if (options.json) {
					printJson({ success: true, removed: name });
				} else {
					printSuccess(`Profile "${name}" removed.`);
				}
			}),
		);
}

function maskKey(key: string): string {
	if (key.length <= 12) return "****";
	return `${key.slice(0, 8)}...${key.slice(-4)}`;
}
