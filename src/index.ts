import { Command } from "commander";
import pkg from "../package.json" with { type: "json" };
import { registerApiKeysCommand } from "./commands/api-keys.js";
import { registerAuthCommands } from "./commands/auth.js";
import { registerBroadcastsCommand } from "./commands/broadcasts.js";
import { registerCompletionsCommand } from "./commands/completions.js";
import { registerDevCommand } from "./commands/dev.js";
import { registerDomainsCommand } from "./commands/domains.js";
import { registerEmailsCommand } from "./commands/emails.js";
import { registerInitCommand } from "./commands/init.js";
import { registerMetricsCommand } from "./commands/metrics.js";
import { registerSendCommand } from "./commands/send.js";
import { registerTemplatesCommand } from "./commands/templates.js";
import { registerWebhooksCommand } from "./commands/webhooks.js";
import { BINARY_NAME, PACKAGE_NAME } from "./lib/constants.js";

const program = new Command();

program
	.name(BINARY_NAME)
	.description("buchida CLI — send emails, manage domains, and more")
	.version(pkg.version, "-v, --version")
	.option("--api-key <key>", "API key (overrides env and config)")
	.option("--json", "Output as JSON (for all commands)");

// Register all commands
registerAuthCommands(program);
registerSendCommand(program);
registerEmailsCommand(program);
registerDomainsCommand(program);
registerApiKeysCommand(program);
registerWebhooksCommand(program);
registerTemplatesCommand(program);
registerBroadcastsCommand(program);
registerMetricsCommand(program);
registerInitCommand(program);
registerDevCommand(program);
registerCompletionsCommand(program);

// Auto-update check (non-blocking, once per day)
async function checkForUpdates(): Promise<void> {
	try {
		const { loadConfig, saveConfig } = await import("./lib/config.js");
		const config = loadConfig();
		const now = Date.now();
		const lastCheck = config.lastUpdateCheck ?? 0;
		const ONE_DAY = 86_400_000;

		if (now - lastCheck < ONE_DAY) return;

		config.lastUpdateCheck = now;
		saveConfig(config);

		const res = await fetch(`https://registry.npmjs.org/${PACKAGE_NAME}/latest`, {
			signal: AbortSignal.timeout(3000),
		});
		if (!res.ok) return;

		const data = (await res.json()) as { version: string };
		const current = pkg.version;
		if (data.version !== current) {
			console.error(
				`\x1b[33m\nUpdate available: ${current} → ${data.version}\nRun: npm install -g ${PACKAGE_NAME}\x1b[0m\n`,
			);
		}
	} catch {
		// Silently ignore update check failures
	}
}

// Run
checkForUpdates().then(() => {
	program.parse();
});
