import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Command } from "commander";
import { resolveApiKey } from "../lib/config.js";
import { withErrorHandler } from "../lib/errors.js";
import { isTTY, printInfo, printJson, printSuccess, printWarning } from "../lib/output.js";

interface InitOptions {
	json?: boolean;
	apiKey?: string;
}

export function registerInitCommand(program: Command): void {
	program
		.command("init")
		.description("Initialize buchida in your project")
		.option("--json", "Output as JSON")
		.option("--api-key <key>", "API key to use")
		.action(
			withErrorHandler(async (options: InitOptions) => {
				const cwd = process.cwd();
				const envPath = join(cwd, ".env");
				const envLocalPath = join(cwd, ".env.local");

				let apiKey = resolveApiKey(options.apiKey);

				if (!apiKey && isTTY()) {
					const clack = await import("@clack/prompts");
					clack.intro("buchida init");

					const result = await clack.text({
						message: "Enter your API key:",
						placeholder: "bc_live_...",
						validate: (v) => (!v.startsWith("bc_") ? "API key must start with bc_" : undefined),
					});
					if (clack.isCancel(result)) {
						clack.cancel("Init cancelled.");
						process.exit(0);
					}
					apiKey = result as string;
				}

				const created: string[] = [];

				// Create .env or .env.local
				const targetEnv = existsSync(envPath) ? envLocalPath : envPath;
				const envContent = `# buchida API key\nNSEND_API_KEY=${apiKey ?? "bc_live_your_key_here"}\n`;

				if (existsSync(targetEnv)) {
					printWarning(
						`${targetEnv} already exists. Add manually:\n  NSEND_API_KEY=${apiKey ?? "bc_live_..."}`,
					);
				} else {
					writeFileSync(targetEnv, envContent, "utf-8");
					created.push(targetEnv);
				}

				// Check gitignore
				const gitignorePath = join(cwd, ".gitignore");
				if (existsSync(gitignorePath)) {
					const content = await import("node:fs").then((fs) =>
						fs.readFileSync(gitignorePath, "utf-8"),
					);
					if (!content.includes(".env")) {
						printWarning("Add .env to your .gitignore to protect your API key.");
					}
				}

				if (options.json) {
					printJson({ success: true, files_created: created, api_key_set: !!apiKey });
					return;
				}

				if (created.length > 0) {
					printSuccess(`Created ${created.join(", ")}`);
				}

				// Suggest SDK install
				const pkgPath = join(cwd, "package.json");
				if (existsSync(pkgPath)) {
					printInfo("Install the Node SDK: npm install buchida");
				} else {
					console.log("\nSDK installation:");
					console.log("  Node:   npm install buchida");
					console.log("  Python: pip install buchida");
					console.log("  Go:     go get github.com/buchida/buchida-go");
					console.log("  Ruby:   gem install buchida");
					console.log("  PHP:    composer require buchida/buchida-php");
				}

				console.log(
					"\nQuick start: buchida send --from you@example.com --to test@test.com --subject 'Hello' --text 'World'",
				);
			}),
		);
}
